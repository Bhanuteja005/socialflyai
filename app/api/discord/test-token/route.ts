import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = request.nextUrl.searchParams.get('channelId');
  
  if (!token) {
    return NextResponse.json({
      success: false,
      error: 'DISCORD_BOT_TOKEN not set in environment',
    }, { status: 500 });
  }

  if (!channelId) {
    return NextResponse.json({
      success: false,
      error: 'channelId parameter is required',
    }, { status: 400 });
  }

  try {
    // Test if bot can access the channel
    const channelResponse = await axios.get(`https://discord.com/api/v10/channels/${channelId}`, {
      headers: {
        'Authorization': `Bot ${token}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Bot can access the channel',
      channel: {
        id: channelResponse.data.id,
        name: channelResponse.data.name,
        type: channelResponse.data.type,
        guild_id: channelResponse.data.guild_id,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Bot cannot access the channel',
      details: {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      },
      instructions: [
        '1. Go to your Discord server',
        '2. Right-click on the server name → Server Settings',
        '3. Go to "Integrations" → "Bots and Apps"',
        '4. Make sure your bot is added to the server',
        '5. Check that the bot has "Send Messages" permission in the channel',
      ],
    }, { status: error.response?.status || 500 });
  }
}
