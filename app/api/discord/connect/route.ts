import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-user';
    const body = await request.json();
    const { channelId, channelName, guildName } = body;
    
    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `${userId}@example.com`,
        name: 'Default User',
      },
    });
    
    // Test the Discord bot token from env
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { success: false, error: 'Discord bot token not configured' },
        { status: 400 }
      );
    }
    
    // Verify bot has access to channel
    const verifyResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
      },
    });
    
    if (!verifyResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Cannot access Discord channel. Make sure the bot is added to your server.' },
        { status: 400 }
      );
    }
    
    const channelData = await verifyResponse.json();
    
    // Store Discord connection in database
    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        userId_platform_platformId: {
          userId,
          platform: 'discord',
          platformId: channelId,
        },
      },
      update: {
        accountName: channelName || channelData.name,
        metadata: {
          guildName,
          guildId: channelData.guild_id,
          channelType: channelData.type,
        },
        isActive: true,
        accessToken: botToken, // Store bot token (in production, use encryption)
      },
      create: {
        userId,
        platform: 'discord',
        platformId: channelId,
        accountName: channelName || channelData.name,
        metadata: {
          guildName,
          guildId: channelData.guild_id,
          channelType: channelData.type,
        },
        isActive: true,
        accessToken: botToken,
      },
    });
    
    return NextResponse.json({
      success: true,
      account: {
        ...socialAccount,
        accessToken: '***', // Don't send token back
      },
    });
  } catch (error: any) {
    console.error('Error connecting Discord:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-user';
    
    const discordAccounts = await prisma.socialAccount.findMany({
      where: {
        userId,
        platform: 'discord',
        isActive: true,
      },
    });
    
    const sanitized = discordAccounts.map((account: any) => ({
      ...account,
      accessToken: '***',
    }));
    
    return NextResponse.json({ success: true, accounts: sanitized });
  } catch (error: any) {
    console.error('Error fetching Discord accounts:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
