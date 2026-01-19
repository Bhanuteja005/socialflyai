import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = process.env.DISCORD_BOT_TOKEN;
  
  if (!token) {
    return NextResponse.json({
      success: false,
      error: 'DISCORD_BOT_TOKEN not set in environment',
    }, { status: 500 });
  }

  // Validate token format
  const parts = token.split('.');
  const validFormat = parts.length === 3;
  
  return NextResponse.json({
    success: true,
    token: {
      present: true,
      length: token.length,
      preview: token.substring(0, 20) + '...' + token.substring(token.length - 10),
      parts: parts.length,
      validFormat,
      part1Length: parts[0]?.length || 0,
      part2Length: parts[1]?.length || 0,
      part3Length: parts[2]?.length || 0,
    },
    apiBase: process.env.DISCORD_API_BASE || 'https://discord.com/api/v10',
    note: 'Discord tokens should have 3 parts separated by dots. Format: XXXXX.YYYYY.ZZZZZ'
  });
}
