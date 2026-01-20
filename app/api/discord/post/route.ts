import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-user';
    const body = await request.json();
    const { socialAccountId, content, mediaUrls } = body;
    
    // Get social account with credentials
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        id: socialAccountId,
        userId,
        platform: 'discord',
        isActive: true,
      },
    });
    
    if (!socialAccount) {
      return NextResponse.json(
        { success: false, error: 'Discord account not found or not connected' },
        { status: 404 }
      );
    }
    
    const channelId = socialAccount.platformId;
    const botToken = socialAccount.accessToken;
    
    if (!channelId || !botToken) {
      return NextResponse.json(
        { success: false, error: 'Discord channel or bot token not configured' },
        { status: 400 }
      );
    }
    
    // Send message to Discord
    const discordResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
      }),
    });
    
    if (!discordResponse.ok) {
      const error = await discordResponse.json();
      throw new Error(error.message || 'Failed to send Discord message');
    }
    
    const discordMessage = await discordResponse.json();
    
    // Save post to database
    const post = await prisma.post.create({
      data: {
        userId,
        socialAccountId,
        content,
        mediaUrls: mediaUrls || [],
        status: 'published',
        publishedAt: new Date(),
        platformPostId: discordMessage.id,
      },
    });
    
    return NextResponse.json({
      success: true,
      post,
      discordMessage,
    });
  } catch (error: any) {
    console.error('Error posting to Discord:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
