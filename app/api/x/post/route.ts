import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { text, accessToken } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Missing text' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token provided. Authenticate first.' },
        { status: 400 }
      );
    }

    const response = await axios.post(
      'https://api.twitter.com/2/tweets',
      { text },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Tweet posted successfully',
      data: response.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to post tweet',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
