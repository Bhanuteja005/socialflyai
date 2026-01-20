import { NextRequest, NextResponse } from 'next/server';
import { xService } from '@/lib/services/x.service';
import { validateRequired, handleApiError, successResponse, errorResponse } from '@/lib/api-utils';

// GET handler - X redirects here after user authorizes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth error
    if (error) {
      return NextResponse.redirect(
        new URL(
          `/?x_error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || 'Authorization failed')}`,
          request.url
        )
      );
    }

    // Handle missing code
    if (!code) {
      return NextResponse.redirect(
        new URL('/?x_error=No authorization code received', request.url)
      );
    }

    // Redirect to frontend with code and state
    // Frontend will store code_verifier and call POST /api/x/callback to exchange
    return NextResponse.redirect(
      new URL(
        `/?x_success=true&code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`,
        request.url
      )
    );
  } catch (error: any) {
    return NextResponse.redirect(
      new URL(`/?x_error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}

// POST handler - Exchange authorization code for access token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, code_verifier, redirect_uri } = body;

    console.log('[X Callback POST] Received request');
    console.log('[X Callback POST] Code:', code ? `${code.substring(0, 20)}...` : 'MISSING');
    console.log('[X Callback POST] Code verifier:', code_verifier ? `${code_verifier.substring(0, 20)}...` : 'MISSING');

    // Validate required fields
    const validationErrors = validateRequired({ code, code_verifier }, ['code', 'code_verifier']);
    if (validationErrors.length > 0) {
      console.error('[X Callback POST] Validation failed:', validationErrors);
      return errorResponse('Validation failed', 400, validationErrors);
    }

    console.log('[X Callback POST] Validation passed, exchanging code for token...');
    const tokens = await xService.exchangeCodeForToken(code, code_verifier, redirect_uri);
    console.log('[X Callback POST] Token exchange successful');

    return successResponse({ tokens }, 'Authentication successful');
  } catch (error: any) {
    console.error('[X Callback POST] Error:', error.message);
    console.error('[X Callback POST] Error details:', error.response?.data);
    return handleApiError(error);
  }
}
