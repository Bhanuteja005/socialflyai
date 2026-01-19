import { NextRequest, NextResponse } from 'next/server';
import { youTubeService } from '@/lib/services/youtube.service';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File;
    const title = (formData.get('title') as string) || 'Test Video';
    const description = (formData.get('description') as string) || 'Uploaded via SocialFly AI';
    const accessToken = formData.get('accessToken') as string;
    const privacyStatus = (formData.get('privacyStatus') as 'public' | 'private' | 'unlisted') || 'public';

    console.log('[Upload Route] Received upload request');
    console.log('[Upload Route] File name:', file?.name);
    console.log('[Upload Route] Access token received:', accessToken ? 'Yes' : 'No');
    console.log('[Upload Route] Access token length:', accessToken?.length);

    if (!file) {
      return errorResponse('No video file provided', 400);
    }

    if (!accessToken) {
      return errorResponse('No access token provided', 401);
    }

    const result = await youTubeService.uploadVideo({
      file,
      title,
      description,
      accessToken,
      privacyStatus,
    });

    return successResponse(result, 'Video uploaded to YouTube successfully');
  } catch (error: any) {
    return handleApiError(error);
  }
}
