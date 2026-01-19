# YouTube OAuth Flow - Complete Guide

## Current Status
✅ Backend callback route fixed (GET method)
✅ Frontend OAuth handler added (useEffect)
❌ YouTube credentials still placeholders (need Google Cloud Console setup)

## Complete OAuth Flow

### 1. User Initiates Authentication
**Frontend:** User clicks "Get Auth URL" button
```
GET /api/youtube/auth-url
```
**Backend:** Returns Google OAuth URL with:
- client_id
- redirect_uri: http://localhost:3000/api/youtube/callback
- response_type: code
- scope: youtube.upload, userinfo.profile, userinfo.email

### 2. User Authorizes on Google
**Browser:** User redirected to Google OAuth consent screen
- User signs in to Google account
- User grants YouTube upload permissions

### 3. Google Redirects Back with Authorization Code
**Google:** Redirects to callback URL (GET request)
```
GET http://localhost:3000/api/youtube/callback?code=4/0ASc3gC36CN758mN...&scope=profile%20https://...
```

### 4. Backend Exchanges Code for Tokens
**Backend:** Route handler in `/api/youtube/callback/route.ts`
- Extracts `code` from query parameters
- POSTs to Google Token endpoint with:
  - code
  - client_id
  - client_secret
  - redirect_uri
  - grant_type: authorization_code
- Receives access_token and refresh_token

### 5. Backend Redirects to Frontend
**Backend:** Redirects browser to home page with tokens in URL
```
GET /?youtube_success=true&access_token=ya29.a0A...&refresh_token=1//09...
```

### 6. Frontend Captures Tokens
**Frontend:** useEffect hook in `app/page.tsx`
- Reads URL parameters on component mount
- Extracts access_token and refresh_token
- Stores in ytAccessToken state
- Switches to YouTube tab
- Shows success message
- Cleans URL (removes parameters)

### 7. User Uploads Video
**Frontend:** User fills in title, description, selects video file
**Backend:** Uses stored access_token to upload to YouTube API

## Files Modified

### 1. Backend Callback Route
**File:** `app/api/youtube/callback/route.ts`
**Changes:**
- Changed from POST to GET method
- Added searchParams.get('code') to read authorization code
- Added redirect to frontend with tokens in URL

```typescript
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(
        new URL('/?youtube_error=No authorization code received', request.url)
      );
    }

    const tokens = await youTubeService.exchangeCodeForToken(code);
    
    return NextResponse.redirect(
      new URL(
        `/?youtube_success=true&access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token || ''}`,
        request.url
      )
    );
  } catch (error: any) {
    return NextResponse.redirect(
      new URL(`/?youtube_error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
```

### 2. Frontend OAuth Handler
**File:** `app/page.tsx`
**Changes:**
- Added useEffect hook to handle OAuth callbacks
- Automatically captures tokens from URL parameters
- Sets access token in state
- Shows success/error messages

```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  
  // YouTube OAuth callback
  if (params.get('youtube_success') === 'true') {
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    
    if (accessToken) {
      setYtAccessToken(accessToken);
      setActiveTab('youtube');
      setResponse({
        success: true,
        message: 'YouTube authentication successful!',
        tokens: { access_token: accessToken, refresh_token: refreshToken }
      });
      
      // Clean URL
      window.history.replaceState({}, '', '/');
    }
  } else if (params.get('youtube_error')) {
    setActiveTab('youtube');
    setError(params.get('youtube_error') || 'YouTube authentication failed');
    window.history.replaceState({}, '', '/');
  }
}, []);
```

## Required: Google Cloud Console Setup

Before testing, you MUST set up real credentials:

### Step 1: Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Create new project: "SocialFlyAI"

### Step 2: Enable YouTube Data API v3
1. Navigate to "APIs & Services" → "Library"
2. Search "YouTube Data API v3"
3. Click "Enable"

### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in:
   - App name: SocialFlyAI
   - User support email: vishal.d@atyuttama.com
   - Developer email: vishal.d@atyuttama.com
4. Add scopes:
   - YouTube Data API v3 → .../auth/youtube.upload
   - Google OAuth → .../auth/userinfo.profile
   - Google OAuth → .../auth/userinfo.email

### Step 4: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "SocialFlyAI YouTube"
5. Authorized redirect URIs:
   - Add: `http://localhost:3000/api/youtube/callback`
6. Click "Create"
7. **Copy Client ID and Client Secret**

### Step 5: Update .env File
```env
YOUTUBE_CLIENT_ID=your-real-client-id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-your-real-client-secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback
```

## Testing the Flow

1. **Start the application:**
   ```powershell
   cd socialflyai
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Navigate to YouTube tab**

4. **Click "Get Auth URL"**
   - Should display Google OAuth URL
   - Click "Open in New Tab" or copy/paste the URL

5. **Authorize on Google**
   - Sign in with Google account
   - Grant permissions

6. **Verify redirect**
   - Should redirect back to http://localhost:3000
   - YouTube tab should be active
   - Should see success message with tokens
   - Access token should be populated

7. **Test video upload**
   - Fill in title and description
   - Select video file
   - Click "Upload Video"
   - Should successfully upload to YouTube

## Troubleshooting

### Error: invalid_client
**Cause:** Using placeholder credentials
**Fix:** Set up real credentials in Google Cloud Console (see above)

### Error: 405 Method Not Allowed
**Cause:** Callback route was using POST instead of GET
**Fix:** ✅ Already fixed - route now uses GET method

### Error: redirect_uri_mismatch
**Cause:** Redirect URI in .env doesn't match Google Cloud Console
**Fix:** Ensure both are exactly: `http://localhost:3000/api/youtube/callback`

### No success message after authorization
**Cause:** Frontend not detecting URL parameters
**Fix:** ✅ Already fixed - useEffect now handles callbacks

### Access token not persisting
**Note:** Access tokens are stored in component state only
**Solution:** For production, consider using:
- localStorage for persistence across page reloads
- Session storage for single-session persistence
- Backend session management with secure cookies

## Production Considerations

1. **Security:**
   - Never expose tokens in URL (use session/cookies)
   - Use HTTPS for production redirect URIs
   - Store refresh tokens securely in backend database

2. **Token Management:**
   - Access tokens expire after ~1 hour
   - Implement refresh token flow
   - Handle token expiration gracefully

3. **Error Handling:**
   - Add retry logic for token exchange
   - Implement better error messages for users
   - Log errors to monitoring service

4. **Testing:**
   - Test with real Google account
   - Verify video upload with small test file
   - Check YouTube Studio for uploaded videos

## Next Steps

1. ✅ Backend callback route (GET method) - **COMPLETED**
2. ✅ Frontend OAuth handler - **COMPLETED**
3. ❌ Set up Google Cloud Console credentials - **REQUIRED**
4. ❌ Test complete OAuth flow - **PENDING**
5. ❌ Implement token refresh logic - **FUTURE**
6. ❌ Add secure token storage - **PRODUCTION**
