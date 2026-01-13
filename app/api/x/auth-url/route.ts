import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function base64url(buffer: Buffer): string {
  return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64url(hash);
}

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.X_CLIENT_ID;
    const redirectUri = process.env.X_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: 'Missing X_CLIENT_ID or X_REDIRECT_URI in environment variables' },
        { status: 500 }
      );
    }

    const codeVerifier = base64url(crypto.randomBytes(32));
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = base64url(crypto.randomBytes(16));
    const scope = encodeURIComponent('tweet.read tweet.write users.read offline.access');

    const url = `https://x.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    return NextResponse.json({
      url,
      code_verifier: codeVerifier,
      state,
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
