import prisma from './prisma';

export async function processScheduledPosts() {
  try {
    const now = new Date();

    // Find all scheduled posts that are due
    let duePosts;
    try {
      duePosts = await prisma.post.findMany({
        where: {
          status: 'scheduled',
          scheduledFor: {
            lte: now
          }
        },
        include: {
          socialAccount: true
        }
      });
    } catch (dbError: any) {
      console.error('Database connection error in scheduler:', dbError.message);
      // If it's a connection error, don't fail completely - just log and return
      if (dbError.code === 'P1001' || dbError.message?.includes('Can\'t reach database server')) {
        console.log('Database temporarily unavailable, skipping scheduler run');
        return;
      }
      throw dbError;
    }

    console.log(`Found ${duePosts.length} scheduled posts due for publishing`);

    for (const post of duePosts) {
      try {
        console.log(`Publishing scheduled post ${post.id} to ${post.socialAccount.platform}`);

        // Publish the post using the same logic as the create endpoint
        const platformPostId = await publishPost(
          post.id,
          post.socialAccount.platform,
          post.content,
          post.socialAccount,
          post.mediaUrls
        );

        // Update post status to published
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'published',
            publishedAt: now,
            platformPostId: platformPostId
          }
        });

        console.log(`Successfully published post ${post.id}`);
      } catch (error) {
        console.error(`Failed to publish post ${post.id}:`, error);

        // Mark as failed
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }
  } catch (error) {
    console.error('Error in processScheduledPosts:', error);
    throw error;
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
    case 'youtube':
      platformPostId = await publishToYouTube(content, socialAccount, mediaUrls);
      break;
    default:
      throw new Error(`Platform ${platform} not supported yet`);
  }

  return platformPostId;
}

// Platform-specific publishing functions
async function publishToLinkedIn(content: string, socialAccount: any, mediaUrls: string[]) {
  const baseUrl = process.env.NEXTAUTH_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  if (mediaUrls && mediaUrls.length > 0) {
    // Use the actual uploaded image URL
    const imageUrl = mediaUrls[0].startsWith('http') ? mediaUrls[0] : `${baseUrl}${mediaUrls[0]}`;

    console.log('Calling LinkedIn image-post with actual uploaded image:', { text: content, imageUrl });

    const response = await fetch(`${baseUrl}/api/linkedin/image-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': socialAccount.userId,
      },
      body: JSON.stringify({
        text: content,
        imageUrl: imageUrl,
        organizationId: socialAccount.metadata?.organizationId
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LinkedIn image-post failed:', response.status, errorText);

      // If image URL is not accessible, try posting as text with image reference
      if (response.status === 400 || response.status === 500) {
        console.log('Falling back to text-post for LinkedIn');
        return publishToLinkedInTextOnly(content, socialAccount);
      }
      throw new Error(`LinkedIn API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to post image to LinkedIn');
    }

    return data.postId;
  } else {
    return publishToLinkedInTextOnly(content, socialAccount);
  }
}

async function publishToLinkedInTextOnly(content: string, socialAccount: any) {
  const baseUrl = process.env.NEXTAUTH_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const response = await fetch(`${baseUrl}/api/linkedin/text-post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': socialAccount.userId,
    },
    body: JSON.stringify({
      content,
      organizationId: socialAccount.metadata?.organizationId
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LinkedIn text-post API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to post to LinkedIn');
  }

  return data.postId;
}

async function publishToDiscord(content: string, socialAccount: any, mediaUrls: string[]) {
  const channelId = socialAccount.metadata?.channelId;
  if (!channelId) {
    throw new Error('Discord channel ID not found');
  }

  const endpoint = mediaUrls.length > 0 ? 'send-message-with-media' : 'send-message';

  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/discord/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': socialAccount.userId,
    },
    body: JSON.stringify({
      channelId,
      content,
      mediaUrls
    })
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to post to Discord');
  }

  return data.messageId;
}

async function publishToTwitter(content: string, socialAccount: any, mediaUrls: string[]) {
  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/x/post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': socialAccount.userId,
    },
    body: JSON.stringify({
      content,
      socialAccountId: socialAccount.id,
      mediaUrls
    })
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to post to Twitter');
  }

  return data.postId;
}

async function publishToFacebook(content: string, socialAccount: any, mediaUrls: string[]) {
  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/facebook/post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': socialAccount.userId,
    },
    body: JSON.stringify({
      content,
      socialAccountId: socialAccount.id,
      mediaUrls
    })
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to post to Facebook');
  }

  return data.postId;
}

async function publishToYouTube(content: string, socialAccount: any, mediaUrls: string[]) {
  // YouTube requires video files, not just URLs
  // For scheduled posts with videos, the video file should be accessible
  if (!mediaUrls || mediaUrls.length === 0) {
    throw new Error('YouTube posts require a video file');
  }

  const baseUrl = process.env.NEXTAUTH_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  // Get the video file path (mediaUrls contains paths like /uploads/filename.mp4)
  const videoUrl = mediaUrls[0];
  if (!videoUrl.startsWith('/uploads/')) {
    throw new Error('Invalid video file path for YouTube upload');
  }

  // Read the video file from the filesystem
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(process.cwd(), 'public', videoUrl);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Video file not found: ${filePath}`);
  }

  // Read the file as buffer
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  // Create FormData for upload
  const formData = new FormData();
  // Convert buffer to blob/file-like object
  const file = new File([fileBuffer], fileName, { type: 'video/mp4' });
  formData.append('video', file);
  formData.append('title', content.substring(0, 100)); // YouTube title limit
  formData.append('description', content);
  formData.append('socialAccountId', socialAccount.id);
  formData.append('privacyStatus', 'public');

  const response = await fetch(`${baseUrl}/api/youtube/upload`, {
    method: 'POST',
    headers: {
      'x-user-id': socialAccount.userId,
    },
    body: formData
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to upload video to YouTube');
  }

  return data.videoId;
}