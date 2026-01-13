import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { text, imageUrl, visibility = 'PUBLIC', organizationId } = await request.json();

    if (!text || !imageUrl) {
      return NextResponse.json(
        { error: 'Text and imageUrl are required' },
        { status: 400 }
      );
    }

    // Get user profile
    const profileResponse = await axios.get(
      'https://api.linkedin.com/v2/userinfo',
      {
        headers: {
          'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
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
          shareMediaCategory: 'IMAGE',
          media: [
            {
              status: 'READY',
              originalUrl: imageUrl,
            },
          ],
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
          'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'LinkedIn image post created successfully',
      data: response.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to create LinkedIn image post',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
