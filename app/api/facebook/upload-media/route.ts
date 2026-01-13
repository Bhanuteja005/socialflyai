import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string || '';

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    const form = new FormData();
    const buffer = await file.arrayBuffer();
    form.append('source', Buffer.from(buffer), {
      filename: file.name,
      contentType: file.type,
    });
    form.append('description', description);

    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${process.env.FACEBOOK_PAGE_ID}/photos`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`,
        },
        params: {
          published: 'false',
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Media uploaded to Facebook successfully',
      data: response.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to upload media to Facebook',
        details: error.response?.data?.error?.message || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
