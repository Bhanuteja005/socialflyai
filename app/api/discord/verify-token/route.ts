import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const apiBase = process.env.DISCORD_API_BASE || 'https://discord.com/api/v10';
  
  if (!token) {
    return NextResponse.json({
      success: false,
      error: 'DISCORD_BOT_TOKEN not set',
    }, { status: 500 });
  }

  try {
    // Test 1: Get bot user info
    const botInfoResponse = await axios.get(`${apiBase}/users/@me`, {
      headers: {
        'Authorization': `Bot ${token}`,
      },
    });

    // Test 2: Get bot's application info
    const appInfoResponse = await axios.get(`${apiBase}/oauth2/applications/@me`, {
      headers: {
        'Authorization': `Bot ${token}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Token is valid! ✓',
      bot: {
        id: botInfoResponse.data.id,
        username: botInfoResponse.data.username,
        discriminator: botInfoResponse.data.discriminator,
        verified: botInfoResponse.data.verified,
        bot: botInfoResponse.data.bot,
      },
      application: {
        id: appInfoResponse.data.id,
        name: appInfoResponse.data.name,
      },
      tokenInfo: {
        length: token.length,
        preview: token.substring(0, 20) + '...' + token.substring(token.length - 10),
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Token validation failed',
      details: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      },
      tokenInfo: {
        present: true,
        length: token.length,
        preview: token.substring(0, 20) + '...',
      },
      instructions: [
        '1. Go to https://discord.com/developers/applications',
        '2. Select your application',
        '3. Go to "Bot" section',
        '4. Click "Reset Token" to get a fresh token',
        '5. Copy the new token',
        '6. Update DISCORD_BOT_TOKEN in your .env file',
        '7. Restart your dev server',
      ],
    }, { status: error.response?.status || 500 });
  }
}
