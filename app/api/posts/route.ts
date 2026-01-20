import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-user'; // TODO: Implement proper auth
    
    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `${userId}@example.com`, // TODO: Use real email from auth
        name: 'Default User',
      },
    });
    
    const body = await request.json();
    const { socialAccountId, content, mediaUrls, scheduledFor } = body;
    
    // Verify social account exists and belongs to user
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
    
    // Create post
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
    
    // If not scheduled, publish immediately
    if (!scheduledFor) {
      // TODO: Call the appropriate posting API based on platform
      await publishPost(post.id, socialAccount);
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

async function publishPost(postId: string, socialAccount: any) {
  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');
    
    let platformPostId = null;
    
    // Route to appropriate platform API
    switch (socialAccount.platform) {
      case 'discord':
        // Call Discord API
        break;
      case 'facebook':
        // Call Facebook API
        break;
      case 'linkedin':
        // Call LinkedIn API
        break;
      case 'twitter':
        // Call Twitter API
        break;
      case 'youtube':
        // Call YouTube API
        break;
    }
    
    // Update post status
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        platformPostId,
      },
    });
  } catch (error: any) {
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'failed',
        errorMessage: error.message,
      },
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-user';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const posts = await prisma.post.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        socialAccount: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
