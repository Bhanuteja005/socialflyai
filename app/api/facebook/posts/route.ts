import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';

    const response = await axios.get(
      `https://graph.facebook.com/v21.0/${process.env.FACEBOOK_PAGE_ID}/feed`,
      {
        params: {
          access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
          fields: 'id,message,created_time,permalink_url,full_picture,attachments{media,type,url}',
          limit,
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to fetch Facebook posts',
        details: error.response?.data?.error?.message || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
