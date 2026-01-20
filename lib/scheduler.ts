import prisma from './prisma';

export async function processScheduledPosts() {
  try {
    const now = new Date();

    // Find all scheduled posts that are due
    const duePosts = await prisma.post.findMany({
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