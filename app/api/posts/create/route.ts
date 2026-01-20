import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-user';
    console.log('Creating post for user:', userId);
    
    const formData = await request.formData();
    
    const content = formData.get('content') as string;
    const socialAccountId = formData.get('socialAccountId') as string;
    const scheduledFor = formData.get('scheduledFor') as string | null;
    
    console.log('Post data:', { content: content?.substring(0, 50), socialAccountId, scheduledFor });
    
    if (!content || !socialAccountId) {
      return NextResponse.json(
        { error: 'Content and social account ID are required' },
        { status: 400 }
      );
    }

    // Get the social account
    console.log('Looking up social account:', socialAccountId);
    const socialAccount = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
    });

    if (!socialAccount || socialAccount.userId !== userId) {
      console.log('Social account not found or unauthorized:', { found: !!socialAccount, accountUserId: socialAccount?.userId, requestUserId: userId });
      return NextResponse.json(
        { error: 'Social account not found or unauthorized' },
        { status: 404 }
      );
    }

    console.log('Found social account:', { platform: socialAccount.platform, accountName: socialAccount.accountName });

    // Handle media uploads
    const mediaUrls: string[] = [];
    const mediaFiles = formData.getAll('media') as File[];
    
    console.log('Processing media files:', mediaFiles.length);
    
    if (mediaFiles && mediaFiles.length > 0) {
      // Create uploads directory if it doesn't exist
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
          console.log('Created uploads directory');
        }

        for (const file of mediaFiles) {
          if (file && file.size > 0) {
            // Generate unique filename
            const fileExtension = path.extname(file.name);
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
            const filePath = path.join(uploadsDir, fileName);
            
            // Save file
            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(filePath, buffer);
            
            // Add URL to mediaUrls
            const mediaUrl = `/uploads/${fileName}`;
            mediaUrls.push(mediaUrl);
          }
        }
      } catch (fileError: any) {
        console.error('File upload error:', fileError);
        throw new Error(`File upload failed: ${fileError.message}`);
      }
    }

    // Create post in database
    const post = await prisma.post.create({
      data: {
        userId,
        socialAccountId,
        content,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: scheduledFor ? 'scheduled' : 'draft',
        mediaUrls,
      },
      include: {
        socialAccount: true,
      },
    });

    // If not scheduled, publish immediately
    if (!scheduledFor) {
      console.log('Publishing post immediately to platform:', socialAccount.platform);
      await publishPost(post.id, socialAccount.platform, content, socialAccount, mediaUrls);
    } else {
      console.log('Post scheduled for:', scheduledFor);
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}

// Helper function to publish to different platforms
async function publishPost(
  postId: string,
  platform: string,
  content: string,
  socialAccount: any,
  mediaUrls: string[] = []
) {
  try {
    console.log('Publishing to platform:', platform, 'with media URLs:', mediaUrls);
    let platformPostId = null;

    switch (platform.toLowerCase()) {
      case 'linkedin':
        platformPostId = await publishToLinkedIn(content, socialAccount, mediaUrls);
        break;
      case 'discord':
        platformPostId = await publishToDiscord(content, socialAccount, mediaUrls);
        break;
      case 'twitter':
        platformPostId = await publishToTwitter(content, socialAccount, mediaUrls);
        break;
      case 'facebook':
        platformPostId = await publishToFacebook(content, socialAccount, mediaUrls);
        break;
      default:
        throw new Error(`Platform ${platform} not supported yet`);
    }

    console.log('Successfully published to', platform, 'with post ID:', platformPostId);

    // Update post status
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        platformPostId,
      },
    });

    return platformPostId;
  } catch (error: any) {
    // Update post with error
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'failed',
        errorMessage: error.message,
      },
    });
    throw error;
  }
}

async function publishToLinkedIn(content: string, account: any, mediaUrls: string[] = []) {
  try {
    // Use the existing LinkedIn routes via HTTP
    const baseUrl = 'http://localhost:3000'; // Since we're calling from the same server

    if (mediaUrls && mediaUrls.length > 0) {
      // Use the actual uploaded image URL
      const imageUrl = `http://localhost:3000${mediaUrls[0]}`;

      console.log('Calling LinkedIn image-post with actual uploaded image:', { text: content, imageUrl });

      const response = await fetch(`${baseUrl}/api/linkedin/image-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${account.accessToken}`,
        },
        body: JSON.stringify({
          text: content,
          imageUrl: imageUrl,
          visibility: 'PUBLIC',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LinkedIn image-post failed:', response.status, errorText);
        
        // If image URL is not accessible, try posting as text with image reference
        if (response.status === 400 || response.status === 500) {
          console.log('Falling back to text-only post with image reference');
          const fallbackResponse = await fetch(`${baseUrl}/api/linkedin/text-post`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${account.accessToken}`,
            },
            body: JSON.stringify({
              text: `${content}\n\n[Image attached: ${mediaUrls[0]}]`,
              visibility: 'PUBLIC',
            }),
          });
          
          if (!fallbackResponse.ok) {
            const fallbackError = await fallbackResponse.text();
            throw new Error(`LinkedIn posting failed: ${fallbackResponse.status} ${fallbackError}`);
          }
          
          const fallbackData = await fallbackResponse.json();
          console.log('LinkedIn fallback text-post success:', fallbackData);
          return fallbackData.data.id;
        }
        
        throw new Error(`LinkedIn image posting failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('LinkedIn image-post success:', data);
      return data.data.id;
    } else {
      // Use text-post route for text-only posts
      console.log('Calling LinkedIn text-post with:', { text: content });

      const response = await fetch(`${baseUrl}/api/linkedin/text-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${account.accessToken}`,
        },
        body: JSON.stringify({
          text: content,
          visibility: 'PUBLIC',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LinkedIn text-post failed:', response.status, errorText);
        throw new Error(`LinkedIn text posting failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('LinkedIn text-post success:', data);
      return data.data.id;
    }
  } catch (error: any) {
    console.error('LinkedIn publishing error:', error);
    throw error;
  }
}

async function publishToDiscord(content: string, account: any, mediaUrls: string[] = []) {
  try {
    const metadata = account.metadata as any;
    const channelId = metadata?.channelId || metadata?.defaultChannelId;

    if (!channelId) {
      throw new Error('No Discord channel configured');
    }

    console.log('Publishing to Discord with content:', JSON.stringify(content), 'media URLs:', mediaUrls);

    if (mediaUrls && mediaUrls.length > 0) {
      // Send message with media using the existing Discord API route
      const formData = new FormData();
      formData.append('channelId', channelId);
      if (content && content.trim()) {
        formData.append('content', content);
      }

      // Convert file URLs to File objects
      const fs = require('fs');
      const path = require('path');

      for (let i = 0; i < mediaUrls.length; i++) {
        const mediaUrl = mediaUrls[i];
        const filePath = path.join(process.cwd(), 'public', mediaUrl);
        
        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath);
          const fileName = path.basename(mediaUrl);
          
          // Detect content type based on file extension
          let contentType = 'image/jpeg';
          const ext = path.extname(fileName).toLowerCase();
          if (ext === '.png') contentType = 'image/png';
          else if (ext === '.gif') contentType = 'image/gif';
          else if (ext === '.webp') contentType = 'image/webp';
          
          // Create a File object from the buffer
          const file = new File([fileBuffer], fileName, { type: contentType });
          formData.append('files', file);
          
          console.log(`Added file ${fileName} with content type ${contentType}`);
        } else {
          console.log(`File not found: ${filePath}`);
        }
      }

      console.log('Calling Discord send-message-with-media route...');
      const response = await fetch(`http://localhost:3000/api/discord/send-message-with-media`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Discord media API error:', error);
        throw new Error(error.message || 'Discord media posting failed');
      }

      const data = await response.json();
      console.log('Discord media post success:', data);
      return data.data.id;
    } else {
      // Send text-only message using the existing Discord API route
      console.log('Calling Discord send-message route...');
      const response = await fetch(`http://localhost:3000/api/discord/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId,
          content: content || ' ', // Ensure content is not empty
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Discord text API error:', error);
        throw new Error(error.message || 'Discord text posting failed');
      }

      const data = await response.json();
      console.log('Discord text post success:', data);
      return data.data.id;
    }
  } catch (error: any) {
    console.error('Discord publishing error:', error);
    throw error;
  }
}

async function publishToTwitter(content: string, account: any, mediaUrls: string[] = []) {
  // TODO: Implement Twitter v2 API posting with media
  throw new Error('Twitter posting not implemented yet');
}

async function publishToFacebook(content: string, account: any, mediaUrls: string[] = []) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/feed`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: content,
        access_token: account.accessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Facebook posting failed');
  }

  const data = await response.json();
  return data.id;
}
