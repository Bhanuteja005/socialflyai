import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI;

  const issues: string[] = [];
  const warnings: string[] = [];

  // Check if credentials exist
  if (!clientId || clientId === 'your_google_client_id_here') {
    issues.push('YOUTUBE_CLIENT_ID is not set or is a placeholder');
  }

  if (!clientSecret || clientSecret === 'your_google_client_secret_here') {
    issues.push('YOUTUBE_CLIENT_SECRET is not set or is a placeholder');
  }

  if (!redirectUri) {
    issues.push('YOUTUBE_REDIRECT_URI is not set');
  } else if (redirectUri !== 'http://localhost:3000/api/youtube/callback') {
    warnings.push(`Redirect URI is set to: ${redirectUri}. Expected: http://localhost:3000/api/youtube/callback`);
  }

  // Check CLIENT_ID format
  if (clientId && !clientId.includes('googleusercontent.com') && clientId !== 'your_google_client_id_here') {
    warnings.push('CLIENT_ID format looks incorrect. Should end with .apps.googleusercontent.com');
  }

  // Check CLIENT_SECRET format
  if (clientSecret && !clientSecret.startsWith('GOCSPX-') && clientSecret !== 'your_google_client_secret_here') {
    warnings.push('CLIENT_SECRET format looks incorrect. Should start with GOCSPX-');
  }

  const isConfigured = issues.length === 0;

  if (!isConfigured) {
    return NextResponse.json({
      success: false,
      configured: false,
      message: 'YouTube OAuth is NOT configured correctly',
      issues,
      warnings,
      config: {
        clientId: clientId ? (clientId.length > 20 ? clientId.substring(0, 20) + '...' : 'Set but too short') : 'Not set',
        clientSecret: clientSecret ? '✓ Set (' + clientSecret.length + ' chars)' : '✗ Not set',
        redirectUri: redirectUri || 'Not set',
        expectedRedirectUri: 'http://localhost:3000/api/youtube/callback',
      },
      instructions: [
        '1. Go to: https://console.cloud.google.com/',
        '2. Create a project or select existing one',
        '3. Enable YouTube Data API v3',
        '4. Configure OAuth consent screen',
        '5. Create OAuth 2.0 Client ID (Web application)',
        '6. Add redirect URI: http://localhost:3000/api/youtube/callback',
        '7. Copy Client ID and Client Secret',
        '8. Update .env file with real credentials',
        '9. Restart the application',
        '',
        'See YOUTUBE_SETUP.md for detailed instructions'
      ],
    }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    configured: true,
    message: 'YouTube OAuth is configured correctly ✓',
    warnings: warnings.length > 0 ? warnings : undefined,
    config: {
      clientId: clientId?.substring(0, 30) + '...',
      clientSecret: '✓ Set (' + (clientSecret?.length || 0) + ' chars)',
      redirectUri,
    },
    note: 'Configuration looks good! You can now use the YouTube authentication flow.',
  });
}
