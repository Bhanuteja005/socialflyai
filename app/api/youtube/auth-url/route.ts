import { NextRequest, NextResponse } from 'next/server';
import { youTubeService } from '@/lib/services/youtube.service';

export async function GET(request: NextRequest) {
  try {
    const result = youTubeService.generateAuthUrl();
    return NextResponse.json({
      success: true,
      authUrl: result.url,
      url: result.url
    });
  } catch (error: any) {
    console.error('YouTube auth URL error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
