import { NextRequest, NextResponse } from 'next/server';
import { xService } from '@/lib/services/x.service';
import { validateRequired, handleApiError, successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const { text, accessToken } = await request.json();

    console.log('[X Post Route] Received post request');
    console.log('[X Post Route] Text:', text?.substring(0, 50) + '...');
    console.log('[X Post Route] Has access token:', !!accessToken);

    // Validate required fields
    const validationErrors = validateRequired({ text, accessToken }, ['text', 'accessToken']);
    if (validationErrors.length > 0) {
      return errorResponse('Validation failed', 400, validationErrors);
    }

    if (text.length > 280) {
      return errorResponse('Tweet text exceeds 280 characters', 400);
    }

    const result = await xService.postTweet(accessToken, text);

    return successResponse(result, 'Tweet posted successfully');
  } catch (error: any) {
    console.error('[X Post Route] Error:', error.message);
    return handleApiError(error);
  }
}
