import { NextRequest, NextResponse } from 'next/server';
import { xService } from '@/lib/services/x.service';
import { handleApiError, successResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const result = xService.generateAuthUrl();
    return successResponse(result);
  } catch (error: any) {
    return handleApiError(error);
  }
}
