import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import qs from 'querystring';

export async function POST(request: NextRequest) {
  try {
    const { code, code_verifier, redirect_uri } = await request.json();

    if (!code || !code_verifier) {
      return NextResponse.json(
        { error: 'Missing code or code_verifier' },
        { status: 400 }
      );
    }

    const params = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirect_uri || process.env.X_REDIRECT_URI!,
      code_verifier,
      client_id: process.env.X_CLIENT_ID!,
    };

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    let auth: any = undefined;
    
    if (process.env.X_CLIENT_SECRET) {
      auth = {
        username: process.env.X_CLIENT_ID!,
        password: process.env.X_CLIENT_SECRET!,
      };
    }

    const response = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      qs.stringify(params),
      { headers, auth }
    );

    return NextResponse.json({
      success: true,
      tokens: response.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to exchange code for token',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
