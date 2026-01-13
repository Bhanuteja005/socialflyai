import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { channelId, content, embeds, components } = await request.json();

    if (!channelId || !content) {
      return NextResponse.json(
        { error: 'channelId and content are required' },
        { status: 400 }
      );
    }

    const messageData: any = { content };
    if (embeds) messageData.embeds = embeds;
    if (components) messageData.components = components;

    const response = await axios.post(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      messageData,
      {
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: response.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to send message',
        details: error.response?.data?.message || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
