// YouTube Service for SocialFlyAI
import { google } from 'googleapis';
import { Readable } from 'stream';

export interface YouTubeUploadData {
  file: File;
  title: string;
  description: string;
  accessToken: string;
  privacyStatus?: 'public' | 'private' | 'unlisted';
}

export interface YouTubeAuthData {
  code: string;
}

export class YouTubeService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.YOUTUBE_CLIENT_ID || '';
    this.clientSecret = process.env.YOUTUBE_CLIENT_SECRET || '';
    this.redirectUri = process.env.YOUTUBE_REDIRECT_URI || '';
  }

  private getOAuth2Client() {
    return new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
  }

  generateAuthUrl() {
    const oauth2Client = this.getOAuth2Client();
    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });

    return { url };
  }

  async exchangeCodeForToken(code: string) {
    const oauth2Client = this.getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    return tokens;
  }

  async uploadVideo(data: YouTubeUploadData) {
    const { file, title, description, accessToken, privacyStatus = 'public' } = data;

    console.log('[YouTube Upload] Starting upload...');
    console.log('[YouTube Upload] Title:', title);
    console.log('[YouTube Upload] Access token length:', accessToken?.length);
    console.log('[YouTube Upload] Access token preview:', accessToken?.substring(0, 20) + '...');

    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    // Convert File to Stream
    const buffer = await file.arrayBuffer();
    const stream = Readable.from(Buffer.from(buffer));

    try {
      const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
          },
          status: {
            privacyStatus,
          },
        },
        media: {
          body: stream,
        },
      }
    );

      console.log('[YouTube Upload] Success! Video ID:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('[YouTube Upload] Error:', error.message);
      console.error('[YouTube Upload] Error details:', JSON.stringify(error.errors || error, null, 2));
      throw new Error(`YouTube upload failed: ${error.message}`);
    }
  }
}

export const youTubeService = new YouTubeService();
