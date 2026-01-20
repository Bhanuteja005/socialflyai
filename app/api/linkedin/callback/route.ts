import { NextRequest, NextResponse } from 'next/server';

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

    // TODO: Store tokens securely (database, session, etc.)
    // For now, we'll just log them and redirect
    console.log('LinkedIn tokens obtained:', {
      access_token: access_token.substring(0, 20) + '...',
      refresh_token: refresh_token ? refresh_token.substring(0, 20) + '...' : 'none',
      expires_in,
    });

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