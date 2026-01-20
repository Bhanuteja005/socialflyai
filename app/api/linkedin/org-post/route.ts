import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { text, visibility = 'PUBLIC' } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const organizationId = process.env.LINKEDIN_ORGANIZATION_ID;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID not configured in environment variables' },
        { status: 500 }
      );
    }

    const author = `urn:li:organization:${organizationId}`;

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

    console.log('Organization Post Data:', JSON.stringify(postData, null, 2));

    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      postData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'LinkedIn organization post created successfully',
      data: response.data,
    });
  } catch (error: any) {
    console.error('Organization post error:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: 'Failed to create LinkedIn organization post',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
