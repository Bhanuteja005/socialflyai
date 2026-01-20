// X (Twitter) Service for SocialFlyAI
import axios from 'axios';
import qs from 'querystring';
import crypto from 'crypto';

const X_AUTH_URL = 'https://api.twitter.com/2/oauth2';
const X_API_BASE = 'https://api.twitter.com/2';

export interface XAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface XPostData {
  text: string;
  accessToken: string;
}

function base64url(buffer: Buffer): string {
  return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64url(hash);
}

export class XService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.X_CLIENT_ID || '';
    this.clientSecret = process.env.X_CLIENT_SECRET || '';
    this.redirectUri = process.env.X_REDIRECT_URI || '';
  }

  generateAuthUrl() {
    const codeVerifier = base64url(crypto.randomBytes(32));
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = base64url(crypto.randomBytes(16));
    const scope = encodeURIComponent('tweet.read tweet.write users.read offline.access');

    const url = `https://x.com/i/oauth2/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${scope}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    return {
      url,
      code_verifier: codeVerifier,
      state,
    };
  }

  async exchangeCodeForToken(code: string, codeVerifier: string, redirectUri?: string): Promise<XAuthTokens> {
    const params = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri || this.redirectUri,
      code_verifier: codeVerifier,
      client_id: this.clientId,
    };

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    let auth: any = undefined;

    if (this.clientSecret) {
      auth = {
        username: this.clientId,
        password: this.clientSecret,
      };
    }

    const response = await axios.post(
      `${X_AUTH_URL}/token`,
      qs.stringify(params),
      { headers, auth }
    );

    return response.data;
  }

  async postTweet(accessToken: string, text: string) {
    console.log('[X Post] Attempting to post tweet...');
    console.log('[X Post] Text length:', text.length);
    console.log('[X Post] Access token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'MISSING');

    try {
      const response = await axios.post(
        `${X_API_BASE}/tweets`,
        { text },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[X Post] Success! Tweet ID:', response.data.data?.id);
      return response.data;
    } catch (error: any) {
      console.error('[X Post] Error:', error.message);
      console.error('[X Post] Status:', error.response?.status);
      console.error('[X Post] Error details:', JSON.stringify(error.response?.data, null, 2));

      // Handle specific error codes
      if (error.response?.status === 402) {
        throw new Error(
          'Payment Required (402): Your X API access level does not support posting tweets. ' +
          'You need to upgrade to Basic tier ($100/month) or higher. ' +
          'Free tier only allows read operations. ' +
          'Visit: https://developer.twitter.com/en/portal/products'
        );
      }

      if (error.response?.status === 403) {
        const detail = error.response?.data?.detail;
        throw new Error(`Access Forbidden: ${detail || 'Your app does not have permission to post tweets.'}`);
      }

      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before trying again.');
      }

      // Generic error
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message;
      throw new Error(`Failed to post tweet: ${errorMsg}`);
    }
  }
}

export const xService = new XService();
