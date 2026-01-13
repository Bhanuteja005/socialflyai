import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { message, link, scheduledPublishTime } = await request.json();

    const params = new URLSearchParams({
      access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN!,
      message: message || '',
      link: link || '',
    });

    if (scheduledPublishTime) {
      params.append(
        'scheduled_publish_time',
        Math.floor(new Date(scheduledPublishTime).getTime() / 1000).toString()
      );
      params.append('published', 'false');
    }

    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${process.env.FACEBOOK_PAGE_ID}/feed?${params.toString()}`
    );

    return NextResponse.json({
      success: true,
      message: 'Posted to Facebook successfully',
      data: response.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to post to Facebook',
        details: error.response?.data?.error?.message || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
