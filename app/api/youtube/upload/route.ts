import { NextRequest, NextResponse } from 'next/server';
import { youTubeService } from '@/lib/services/youtube.service';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-user';
    const formData = await request.formData();
    
    const file = formData.get('video') as File;
    const title = (formData.get('title') as string) || 'Video Upload';
    const description = (formData.get('description') as string) || 'Uploaded via SocialFly AI';
    const socialAccountId = formData.get('socialAccountId') as string;
    const privacyStatus = (formData.get('privacyStatus') as 'public' | 'private' | 'unlisted') || 'public';

    console.log('[YouTube Upload] Request received');
    console.log('[YouTube Upload] File:', file?.name);
    console.log('[YouTube Upload] Social Account ID:', socialAccountId);

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No video file provided' },
        { status: 400 }
      );
    }

    if (!socialAccountId) {
      return NextResponse.json(
        { success: false, error: 'Social account ID required' },
        { status: 400 }
      );
    }

    // Get the social account to verify ownership
    const socialAccount = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
    });

    if (!socialAccount || socialAccount.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'YouTube account not found or unauthorized' },
        { status: 404 }
      );
    }

    if (socialAccount.platform !== 'youtube') {
      return NextResponse.json(
        { success: false, error: 'Invalid platform - expected YouTube account' },
        { status: 400 }
      );
    }

    // Upload video using the service (which handles token refresh)
    const result = await youTubeService.uploadVideoFromAccount(
      socialAccountId,
      file,
      title,
      description,
      privacyStatus
    );

    console.log('[YouTube Upload] Success! Video ID:', result.id);

    return NextResponse.json({
      success: true,
      videoId: result.id,
      videoUrl: `https://www.youtube.com/watch?v=${result.id}`,
      data: result,
    });
  } catch (error: any) {
    console.error('[YouTube Upload] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload video' },
      { status: 500 }
    );
  }
}
