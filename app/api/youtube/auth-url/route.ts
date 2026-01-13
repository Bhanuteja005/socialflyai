import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    const scopes = ['https://www.googleapis.com/auth/youtube.upload'];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });

    return NextResponse.json({
      url,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to generate auth URL',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
