import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || process.env.LINKEDIN_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      );
    }

    const { text, visibility = 'PUBLIC', organizationId } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Get user profile to get the author URN
    const profileResponse = await axios.get(
      'https://api.linkedin.com/v2/userinfo',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const author = organizationId
      ? `urn:li:organization:${organizationId}`
      : `urn:li:person:${profileResponse.data.sub}`;

    const postData = {
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility,
      },
    };

    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      postData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'LinkedIn text post created successfully',
      data: response.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to create LinkedIn text post',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
