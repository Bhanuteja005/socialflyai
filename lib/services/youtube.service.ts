// YouTube Service for SocialFlyAI
import { google } from 'googleapis';
import { Readable } from 'stream';
import prisma from '@/lib/prisma';

export interface YouTubeUploadData {
  file: File | Buffer;
  title: string;
  description: string;
  accessToken: string;
  refreshToken?: string;
  privacyStatus?: 'public' | 'private' | 'unlisted';
  fileName?: string;
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
    this.redirectUri = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/youtube/callback';
  }

  private getOAuth2Client() {
    return new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
  }

  /**
   * Generate YouTube OAuth authorization URL
   */
  generateAuthUrl() {
    const oauth2Client = this.getOAuth2Client();
    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
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

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code: string) {
    const oauth2Client = this.getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    return tokens;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error: any) {
      console.error('[YouTube] Token refresh error:', error.message);
      throw new Error('Failed to refresh YouTube access token');
    }
  }

  /**
   * Get valid access token from social account, refresh if needed
   */
  async getValidAccessToken(socialAccountId: string): Promise<string> {
    const account = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
    });

    if (!account) {
      throw new Error('YouTube account not found');
    }

    if (!account.accessToken) {
      throw new Error('No access token available');
    }

    // Check if token is expired or will expire in next 5 minutes
    const now = new Date();
    const expiryBuffer = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

    if (account.tokenExpiry && account.tokenExpiry < expiryBuffer) {
      console.log('[YouTube] Token expired or expiring soon, refreshing...');
      
      if (!account.refreshToken) {
        throw new Error('No refresh token available. Please reconnect your YouTube account.');
      }

      // Refresh the token
      const newTokens = await this.refreshAccessToken(account.refreshToken);

      // Update database with new tokens
      await prisma.socialAccount.update({
        where: { id: socialAccountId },
        data: {
          accessToken: newTokens.access_token || account.accessToken,
          tokenExpiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
          // Update refresh token if a new one was provided
          refreshToken: newTokens.refresh_token || account.refreshToken,
        },
      });

      return newTokens.access_token || account.accessToken;
    }

    return account.accessToken;
  }

  /**
   * Upload video to YouTube
   */
  async uploadVideo(data: YouTubeUploadData) {
    const { file, title, description, accessToken, privacyStatus = 'public', fileName = 'video.mp4' } = data;

    console.log('[YouTube Upload] Starting upload...');
    console.log('[YouTube Upload] Title:', title);
    console.log('[YouTube Upload] Access token length:', accessToken?.length);

    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    // Convert File or Buffer to Stream
    let stream: Readable;
    if (Buffer.isBuffer(file)) {
      // It's already a Buffer
      stream = Readable.from(file);
    } else {
      // It's a File object (from browser/FormData)
      const buffer = await file.arrayBuffer();
      stream = Readable.from(Buffer.from(buffer));
    }

    try {
      console.log('[YouTube Upload] Starting video upload with privacy:', privacyStatus);
      
      const response = await youtube.videos.insert({
        part: ['snippet', 'status', 'contentDetails'],
        notifySubscribers: false, // Don't notify subscribers on upload
        requestBody: {
          snippet: {
            title: title.substring(0, 100), // YouTube title limit is 100 chars
            description: description.substring(0, 5000), // YouTube description limit
            categoryId: '22', // People & Blogs (most common category)
            tags: ['socialflyai', 'upload'],
            defaultLanguage: 'en',
            defaultAudioLanguage: 'en',
          },
          status: {
            privacyStatus: privacyStatus, // 'public', 'private', or 'unlisted'
            embeddable: true,
            publicStatsViewable: true,
            madeForKids: false,
            selfDeclaredMadeForKids: false,
            // Don't set publishAt - let it publish immediately for 'public'
            license: 'youtube',
          },
        },
        media: {
          body: stream,
        },
      });

      console.log('[YouTube Upload] ✅ Upload completed successfully!');
      console.log('[YouTube Upload] Video ID:', response.data.id);
      console.log('[YouTube Upload] Upload Status:', response.data.status?.uploadStatus);
      console.log('[YouTube Upload] Privacy Status:', response.data.status?.privacyStatus);
      
      return response.data;
    } catch (error: any) {
      console.error('[YouTube Upload] Error:', error.message);
      console.error('[YouTube Upload] Error details:', JSON.stringify(error.errors || error, null, 2));
      throw new Error(`YouTube upload failed: ${error.message}`);
    }
  }

  /**
   * Upload video using social account ID (with automatic token refresh)
   */
  async uploadVideoFromAccount(socialAccountId: string, file: File | Buffer, title: string, description: string, privacyStatus: 'public' | 'private' | 'unlisted' = 'public', fileName?: string) {
    const accessToken = await this.getValidAccessToken(socialAccountId);
    
    return this.uploadVideo({
      file,
      title,
      description,
      accessToken,
      privacyStatus,
      fileName,
    });
  }
}

export const youTubeService = new YouTubeService();