import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const config = {
    discord: {
      botToken: process.env.DISCORD_BOT_TOKEN ? '✓ Set (length: ' + process.env.DISCORD_BOT_TOKEN.length + ')' : '✗ Not set',
      clientId: process.env.DISCORD_CLIENT_ID ? '✓ Set' : '✗ Not set',
      apiBase: process.env.DISCORD_API_BASE || 'Using default',
    },
    facebook: {
      pageId: process.env.FACEBOOK_PAGE_ID ? '✓ Set' : '✗ Not set',
      accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN ? '✓ Set (length: ' + process.env.FACEBOOK_PAGE_ACCESS_TOKEN.length + ')' : '✗ Not set',
    },
    linkedin: {
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN ? '✓ Set (length: ' + process.env.LINKEDIN_ACCESS_TOKEN.length + ')' : '✗ Not set',
      clientId: process.env.LINKEDIN_CLIENT_ID ? '✓ Set' : '✗ Not set',
    },
    x: {
      clientId: process.env.X_CLIENT_ID ? '✓ Set' : '✗ Not set',
      clientSecret: process.env.X_CLIENT_SECRET ? '✓ Set' : '✗ Not set',
    },
    youtube: {
      clientId: process.env.YOUTUBE_CLIENT_ID ? '✓ Set' : '✗ Not set',
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET ? '✓ Set' : '✗ Not set',
    },
    app: {
      port: process.env.PORT || '3000',
      nodeEnv: process.env.NODE_ENV || 'development',
    }
  };

  return NextResponse.json({
    success: true,
    message: 'Environment configuration check',
    config,
    timestamp: new Date().toISOString(),
  });
}
