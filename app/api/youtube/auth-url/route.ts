import { NextRequest, NextResponse } from 'next/server';
import { youTubeService } from '@/lib/services/youtube.service';
import { handleApiError, successResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const result = youTubeService.generateAuthUrl();
    return successResponse(result);
  } catch (error: any) {
    return handleApiError(error);
  }
}
