import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File;
    const title = formData.get('title') as string || 'Test Video';
    const description = formData.get('description') as string || 'Uploaded via SocialFly AI';
    const accessToken = formData.get('accessToken') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token provided' },
        { status: 401 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    // Convert File to Stream
    const buffer = await file.arrayBuffer();
    const stream = Readable.from(Buffer.from(buffer));

    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description,
        },
        status: {
          privacyStatus: 'public',
        },
      },
      media: {
        body: stream,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Video uploaded to YouTube successfully',
      data: response.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to upload video',
        details: error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
