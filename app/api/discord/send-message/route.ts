import { NextRequest, NextResponse } from 'next/server';
import { discordService } from '@/lib/services/discord.service';
import { validateRequired, handleApiError, successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const { channelId, content, embeds, components } = await request.json();

    // Validate required fields
    const validationErrors = validateRequired({ channelId, content }, ['channelId', 'content']);
    if (validationErrors.length > 0) {
      return errorResponse('Validation failed', 400, validationErrors);
    }

    const result = await discordService.sendMessage({
      channelId,
      content,
      embeds,
      components,
    });

    return successResponse(result, 'Message sent successfully');
  } catch (error: any) {
    return handleApiError(error);
  }
}
