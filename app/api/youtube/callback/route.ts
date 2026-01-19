import { NextRequest, NextResponse } from 'next/server';
import { youTubeService } from '@/lib/services/youtube.service';

// Google OAuth callback - receives code via GET request query params
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle user denial or errors from Google
    if (error) {
      return NextResponse.redirect(
        new URL(`/?youtube_error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/?youtube_error=no_code', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await youTubeService.exchangeCodeForToken(code);

    // Redirect to frontend with tokens in URL (for MVP - in production, use secure session/cookies)
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('youtube_success', 'true');
    redirectUrl.searchParams.set('access_token', tokens.access_token || '');
    if (tokens.refresh_token) {
      redirectUrl.searchParams.set('refresh_token', tokens.refresh_token);
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error('YouTube OAuth callback error:', error);
    
    // Redirect to frontend with error
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('youtube_error', 'auth_failed');
    redirectUrl.searchParams.set('error_details', error.message || 'Unknown error');
    
    return NextResponse.redirect(redirectUrl);
  }
}
