import { NextRequest, NextResponse } from 'next/server';
import { discordService } from '@/lib/services/discord.service';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const channelId = formData.get('channelId') as string;
    const content = formData.get('content') as string || '';
    const files = formData.getAll('files') as File[];

    if (!channelId) {
      return errorResponse('channelId is required', 400);
    }

    if (!files || files.length === 0) {
      return errorResponse('At least one file is required', 400);
    }

    const result = await discordService.sendMessageWithMedia(channelId, content, files);

    return successResponse(result, 'Message with media sent successfully');
  } catch (error: any) {
    return handleApiError(error);
  }
}
