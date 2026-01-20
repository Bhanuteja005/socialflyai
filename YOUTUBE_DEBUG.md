# YouTube Upload 401 Error - Debugging Guide

## Issue
Getting 401 Unauthorized error when uploading videos to YouTube, even though OAuth flow completes successfully.

## Changes Made

### 1. Added Missing Scope
**File:** `lib/services/youtube.service.ts`
**Change:** Added `https://www.googleapis.com/auth/userinfo.email` scope
**Reason:** Google OAuth requires email scope for full API access

```typescript
const scopes = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email', // Added this
];
```

### 2. Enhanced Error Logging
**Files:** 
- `lib/services/youtube.service.ts` - Added detailed logging in uploadVideo method
- `app/api/youtube/upload/route.ts` - Added logging for received tokens

**Purpose:** Better visibility into token validation and API errors

### 3. Created Token Verification Endpoint
**File:** `app/api/youtube/verify-token/route.ts`
**Purpose:** Test if the access token is valid before attempting upload

Tests:
- User info retrieval (validates OAuth)
- YouTube channel access (validates YouTube API permissions)

### 4. Added Verify Token Button
**File:** `app/page.tsx`
**Purpose:** UI button to test token validity before upload

## Testing Steps

### Step 1: Re-authenticate (CRITICAL)
Since we added a new scope, you MUST re-authenticate:

1. Clear the current access token (refresh page)
2. Click "Get Auth URL" button
3. Go through Google OAuth flow again
4. Authorize with the NEW scopes (including email)
5. Get redirected back with fresh tokens

### Step 2: Verify Token
Before uploading, click the new **"Verify Token"** button:
- ✅ Success: Shows user info and YouTube channel details
- ❌ Failure: Shows specific error (invalid token, missing permissions, etc.)

### Step 3: Check Console Logs
Open browser DevTools (F12) and check console for:
```
[Upload Route] Access token received: Yes/No
[Upload Route] Access token length: 164 (should be ~160-200 chars)
[YouTube Upload] Starting upload...
[YouTube Upload] Access token preview: ya29.a0AUMWg_...
```

### Step 4: Upload Video
After verifying token is valid:
1. Select a small test video (< 10MB recommended)
2. Fill in title and description
3. Click "Upload Video"

## Expected Results

### With Valid Token
```json
{
  "valid": true,
  "message": "Token is valid",
  "user": {
    "id": "...",
    "email": "your-email@gmail.com",
    "name": "Your Name"
  },
  "channelCount": 1,
  "channels": [
    {
      "id": "UC...",
      "title": "Your Channel"
    }
  ]
}
```

### With Invalid Token (401)
```json
{
  "valid": false,
  "error": "Invalid Credentials",
  "status": 401
}
```

## Common Issues

### Issue 1: Token Missing Email Scope
**Symptom:** Token works for user info but fails for YouTube upload
**Cause:** Old token obtained before adding email scope
**Fix:** Re-authenticate (Step 1 above)

### Issue 2: Token Expired
**Symptom:** Token worked before but now returns 401
**Cause:** Access tokens expire after ~1 hour
**Fix:** Implement refresh token flow (future enhancement) or re-authenticate

### Issue 3: Incorrect Scopes in Google Cloud Console
**Symptom:** OAuth works but API calls fail
**Fix:** 
1. Go to Google Cloud Console
2. OAuth consent screen → Edit
3. Verify scopes include:
   - `https://www.googleapis.com/auth/youtube.upload`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`

### Issue 4: YouTube Channel Required
**Symptom:** OAuth works but channel access fails
**Cause:** Google account doesn't have a YouTube channel
**Fix:** Create a YouTube channel for the authenticating Google account

## Detailed Error Analysis

### 401 Unauthorized Reasons:

1. **Invalid Access Token**
   - Token format incorrect
   - Token not properly URL-decoded
   - Token truncated or corrupted

2. **Expired Token**
   - Access tokens expire after 1 hour
   - Need to use refresh token to get new access token

3. **Insufficient Scopes**
   - Token was issued with limited scopes
   - Missing required scope for the operation

4. **Revoked Token**
   - User revoked access in Google Account settings
   - Token manually invalidated

5. **Wrong Credentials**
   - CLIENT_ID mismatch
   - CLIENT_SECRET mismatch
   - Token issued for different app

## Debug Checklist

- [ ] Re-authenticated after adding email scope
- [ ] Clicked "Verify Token" button - shows success
- [ ] Console shows access token is received (length ~160-200)
- [ ] Token preview starts with "ya29."
- [ ] Google account has YouTube channel
- [ ] OAuth consent screen has all 3 scopes
- [ ] CLIENT_ID and CLIENT_SECRET are correct in .env
- [ ] Redirect URI matches exactly in .env and Google Console

## Next Steps if Still Failing

### 1. Check Raw Token Response
Add logging to callback route to see exact token received from Google:

```typescript
console.log('[Callback] Raw tokens from Google:', JSON.stringify(tokens, null, 2));
```

### 2. Test Token with Google OAuth Playground
1. Go to https://developers.google.com/oauthplayground/
2. Use your CLIENT_ID and CLIENT_SECRET
3. Get a token with same scopes
4. Test if that token can upload to YouTube

### 3. Verify API is Enabled
Google Cloud Console → APIs & Services → Library
- YouTube Data API v3 - ENABLED

### 4. Check Quota
Google Cloud Console → APIs & Services → YouTube Data API v3 → Quotas
- Ensure you haven't exceeded daily quota (10,000 units default)
- Each upload costs 1600 units

## Production Considerations

### Token Refresh Flow
Access tokens expire after 1 hour. Implement refresh token logic:

```typescript
async refreshAccessToken(refreshToken: string) {
  const oauth2Client = this.getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials.access_token;
}
```

### Secure Token Storage
Current implementation passes tokens in URL parameters (insecure).
For production:
- Store refresh tokens in backend database
- Use HTTP-only cookies for access tokens
- Implement session management

### Error Handling
Add retry logic with exponential backoff for transient errors:
- Network issues
- Rate limiting (429)
- Server errors (5xx)

## Testing Logs to Watch For

### Success Pattern:
```
[Upload Route] Received upload request
[Upload Route] File name: test.mp4
[Upload Route] Access token received: Yes
[Upload Route] Access token length: 164
[YouTube Upload] Starting upload...
[YouTube Upload] Title: Test Video
[YouTube Upload] Access token length: 164
[YouTube Upload] Access token preview: ya29.a0AUMWg_KSHOqq...
[YouTube Upload] Success! Video ID: dQw4w9WgXcQ
```

### Failure Pattern:
```
[Upload Route] Received upload request
[Upload Route] Access token received: Yes
[Upload Route] Access token length: 164
[YouTube Upload] Starting upload...
[YouTube Upload] Error: Unauthorized
[YouTube Upload] Error details: {
  "error": {
    "code": 401,
    "message": "Invalid Credentials"
  }
}
```

## Contact & Support

If issue persists after following all steps:
1. Check server console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a fresh Google account
4. Ensure Google Cloud Console project is properly configured
