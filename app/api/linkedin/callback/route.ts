import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('LinkedIn OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL('/dashboard?error=linkedin_oauth_failed', request.url)
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code provided' },
        { status: 400 }
      );
    }

    // TODO: Verify state parameter for security
    // For now, we'll skip state verification in development

    // Exchange code for access token
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/linkedin/callback';

    if (!clientId || !clientSecret) {
      console.error('LinkedIn credentials not configured');
      return NextResponse.redirect(
        new URL('/dashboard?error=linkedin_config_missing', request.url)
      );
    }

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', tokenData);
      return NextResponse.redirect(
        new URL('/dashboard?error=linkedin_token_exchange_failed', request.url)
      );
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // Fetch LinkedIn profile to get person URN
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      console.error('Failed to fetch LinkedIn profile');
      return NextResponse.redirect(
        new URL('/dashboard?error=linkedin_profile_fetch_failed', request.url)
      );
    }

    const profile = await profileResponse.json();
    const personUrn = `urn:li:person:${profile.sub}`;

    // Store in database
    const userId = 'default-user'; // TODO: Get from session
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: profile.email || `${userId}@example.com`,
        name: profile.name || 'LinkedIn User',
      },
    });

    await prisma.socialAccount.upsert({
      where: {
        userId_platform_platformId: {
          userId,
          platform: 'linkedin',
          platformId: profile.sub,
        },
      },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token || null,
        tokenExpiry: new Date(Date.now() + expires_in * 1000),
        accountName: profile.name,
        avatarUrl: profile.picture,
        metadata: {
          personUrn,
          email: profile.email,
        },
        isActive: true,
      },
      create: {
        userId,
        platform: 'linkedin',
        platformId: profile.sub,
        accessToken: access_token,
        refreshToken: refresh_token || null,
        tokenExpiry: new Date(Date.now() + expires_in * 1000),
        accountName: profile.name,
        avatarUrl: profile.picture,
        metadata: {
          personUrn,
          email: profile.email,
        },
        isActive: true,
      },
    });

    console.log('LinkedIn account connected successfully for user:', userId);

    // Redirect back to dashboard with success
    return NextResponse.redirect(
      new URL('/dashboard?success=linkedin_connected', request.url)
    );

  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=linkedin_callback_error', request.url)
    );
  }
}