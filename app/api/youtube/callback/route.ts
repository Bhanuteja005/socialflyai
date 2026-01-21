import { NextRequest, NextResponse } from 'next/server';
import { youTubeService } from '@/lib/services/youtube.service';
import prisma from '@/lib/prisma';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const userId = 'default-user'; // In production, get from session

    // Handle user denial or errors from Google
    if (error) {
      console.error('YouTube OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/dashboard?error=youtube_oauth_failed&details=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard?error=youtube_no_code', request.url)
      );
    }

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

    // Exchange code for tokens
    const tokens = await youTubeService.exchangeCodeForToken(code);

    if (!tokens.access_token) {
      throw new Error('No access token received from YouTube');
    }

    // Get user's YouTube channel info
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channelResponse = await youtube.channels.list({
      part: ['snippet'],
      mine: true,
    });

    const channel = channelResponse.data.items?.[0];
    if (!channel) {
      throw new Error('No YouTube channel found for this account');
    }

    const channelId = channel.id || '';
    const channelTitle = channel.snippet?.title || 'YouTube Channel';
    const channelThumbnail = channel.snippet?.thumbnails?.default?.url;

    // Store or update YouTube account in database
    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        userId_platform_platformId: {
          userId,
          platform: 'youtube',
          platformId: channelId,
        },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        accountName: channelTitle,
        avatarUrl: channelThumbnail,
        isActive: true,
      },
      create: {
        userId,
        platform: 'youtube',
        platformId: channelId,
        accountName: channelTitle,
        avatarUrl: channelThumbnail,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        isActive: true,
        metadata: {
          channelId,
          channelTitle,
        },
      },
    });

    console.log('YouTube account connected successfully:', channelTitle);

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      new URL('/dashboard?youtube_connected=true', request.url)
    );
  } catch (error: any) {
    console.error('YouTube OAuth callback error:', error);
    
    return NextResponse.redirect(
      new URL(`/dashboard?error=youtube_auth_failed&details=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
