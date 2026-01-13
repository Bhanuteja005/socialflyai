import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const channelId = formData.get('channelId') as string;
    const content = formData.get('content') as string;
    const files = formData.getAll('files') as File[];

    if (!channelId) {
      return NextResponse.json(
        { error: 'channelId is required' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'At least one file is required' },
        { status: 400 }
      );
    }

    const form = new FormData();

    // Add message payload
    const payload: any = {};
    if (content) payload.content = content;
    form.append('payload_json', JSON.stringify(payload));

    // Add files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = await file.arrayBuffer();
      form.append(`files[${i}]`, Buffer.from(buffer), {
        filename: file.name,
        contentType: file.type,
      });
    }

    const response = await axios.post(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Message with media sent successfully',
      data: response.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to send message with media',
        details: error.response?.data?.message || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
