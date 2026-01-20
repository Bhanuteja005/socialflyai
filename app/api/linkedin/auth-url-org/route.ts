import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/callback';
    
    // Use basic profile scopes that are approved
    const scope = 'r_liteprofile r_emailaddress w_member_social openid profile email';

    if (!clientId) {
      return NextResponse.json(
        { error: 'LinkedIn Client ID not configured' },
        { status: 500 }
      );
    }

    // Generate state for security
    const state = Math.random().toString(36).substring(7);

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;

    return NextResponse.json({
      authUrl,
      state,
      scopes: scope,
      instructions: 'Visit this URL to authorize the app with PROFILE permissions. This will allow posting to your personal LinkedIn profile.',
      redirectUri,
      note: 'This uses approved profile scopes for personal posting. Organization posting requires additional LinkedIn approval.'
    });
  } catch (error) {
    console.error('LinkedIn org auth URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
