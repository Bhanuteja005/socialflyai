import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token provided' }, { status: 400 });
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    // Set credentials
    oauth2Client.setCredentials({ access_token: accessToken });

    // Try to get user info to verify token
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Try to access YouTube API
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channels = await youtube.channels.list({
      part: ['snippet'],
      mine: true,
    });

    return NextResponse.json({
      valid: true,
      message: 'Token is valid',
      user: userInfo.data,
      channelCount: channels.data.items?.length || 0,
      channels: channels.data.items?.map((ch: any) => ({
        id: ch.id,
        title: ch.snippet.title,
      })),
    });
  } catch (error: any) {
    console.error('[Verify Token] Error:', error.message);
    console.error('[Verify Token] Details:', error.response?.data || error);

    return NextResponse.json({
      valid: false,
      error: error.message,
      details: error.response?.data,
      status: error.response?.status,
    }, { status: 401 });
  }
}
