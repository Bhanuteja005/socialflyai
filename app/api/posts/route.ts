import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-user';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const where: any = { userId };
    if (status) {
      where.status = status;
    }
    
    // Get total count for pagination
    const total = await prisma.post.count({ where });
    
    const posts = await prisma.post.findMany({
      where,
      include: {
        socialAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
            avatarUrl: true,
            metadata: true,
          },
        },
      },
      orderBy: [
        { scheduledFor: 'asc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return NextResponse.json({ success: true, posts, total, page, limit });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-user';
    
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `${userId}@example.com`,
        name: 'Default User',
      },
    });
    
    const body = await request.json();
    const { socialAccountId, content, mediaUrls, scheduledFor } = body;
    
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        id: socialAccountId,
        userId,
      },
    });
    
    if (!socialAccount) {
      return NextResponse.json(
        { success: false, error: 'Social account not found' },
        { status: 404 }
      );
    }
    
    const post = await prisma.post.create({
      data: {
        userId,
        socialAccountId,
        content,
        mediaUrls: mediaUrls || [],
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: scheduledFor ? 'scheduled' : 'draft',
      },
    });
    
    if (!scheduledFor) {
      await publishPost(post.id, socialAccount, content);
    }
    
    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function publishPost(postId: string, socialAccount: any, content: string) {
  try {
    let platformPostId = null;
    
    switch (socialAccount.platform.toLowerCase()) {
      case 'discord':
        platformPostId = await publishToDiscord(content, socialAccount);
        break;
      case 'linkedin':
        platformPostId = await publishToLinkedIn(content, socialAccount);
        break;
      case 'twitter':
        platformPostId = await publishToTwitter(content, socialAccount);
        break;
      case 'facebook':
        platformPostId = await publishToFacebook(content, socialAccount);
        break;
      default:
        throw new Error(`Platform ${socialAccount.platform} not supported`);
    }
    
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

async function publishToLinkedIn(content: string, account: any) {
  const metadata = account.metadata as any;
  const personUrn = metadata?.personUrn || `urn:li:person:${account.platformId}`;
  
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${account.accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'LinkedIn posting failed');
  }

  const data = await response.json();
  return data.id;
}

async function publishToDiscord(content: string, account: any) {
  const metadata = account.metadata as any;
  const channelId = metadata?.channelId || metadata?.defaultChannelId;

  if (!channelId) {
    throw new Error('No Discord channel configured');
  }

  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Discord posting failed');
  }

  const data = await response.json();
  return data.id;
}

async function publishToTwitter(content: string, account: any) {
  // Implement Twitter v2 API
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${account.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: content,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Twitter posting failed');
  }

  const data = await response.json();
  return data.data.id;
}

async function publishToFacebook(content: string, account: any) {
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
