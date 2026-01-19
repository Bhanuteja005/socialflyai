# YouTube/Google OAuth Setup Guide

## 🚨 Current Issue: Invalid OAuth Client

**Error:** `Error 401: invalid_client - The OAuth client was not found`

**Cause:** Your `.env` file has placeholder credentials instead of real Google OAuth credentials.

## ✅ Complete Setup Guide

### Step 1: Create Google Cloud Project

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `SocialFlyAI` (or any name)
4. Click **"Create"**
5. Wait for project creation (check notifications)

### Step 2: Enable YouTube Data API v3

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for: **"YouTube Data API v3"**
3. Click on it → Click **"Enable"**
4. Wait for API to be enabled

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** → Click **"Create"**
3. Fill in the form:
   - **App name:** `SocialFlyAI`
   - **User support email:** Your email
   - **Developer contact:** Your email
4. Click **"Save and Continue"**

5. **Scopes** page:
   - Click **"Add or Remove Scopes"**
   - Search and add:
     - `https://www.googleapis.com/auth/youtube.upload`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Click **"Update"** → **"Save and Continue"**

6. **Test users** page:
   - Click **"Add Users"**
   - Add your email address
   - Click **"Save and Continue"**

7. Click **"Back to Dashboard"**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select application type: **"Web application"**
4. Enter name: `SocialFlyAI YouTube Integration`

5. **Authorized JavaScript origins:**
   - Click **"Add URI"**
   - Enter: `http://localhost:3000`

6. **Authorized redirect URIs:**
   - Click **"Add URI"**
   - Enter: `http://localhost:3000/api/youtube/callback`
   - ⚠️ **IMPORTANT:** This MUST match exactly - no trailing slash!

7. Click **"Create"**

8. **Download credentials:**
   - A popup will show your **Client ID** and **Client Secret**
   - Click **"Download JSON"** (save for backup)
   - Copy the **Client ID** (starts with something like: `123456789-abc...googleusercontent.com`)
   - Copy the **Client Secret** (random string)

### Step 5: Update Your .env File

Open: `..\Socialflyai\.env`

Replace these lines:
```env
YOUTUBE_CLIENT_ID=your_google_client_id_here
YOUTUBE_CLIENT_SECRET=your_google_client_secret_here
```

With your actual credentials:
```env
YOUTUBE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-your_actual_secret_here
```

**Keep this line as is:**
```env
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback
```

### Step 6: Restart Your Application

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 7: Verify Configuration

Visit: http://localhost:3000/api/youtube/verify-config

Should show:
```json
{
  "success": true,
  "message": "YouTube OAuth is configured correctly"
}
```

### Step 8: Test OAuth Flow

1. Open: http://localhost:3000
2. Go to **YouTube tab**
3. Click **"Get Auth URL"**
4. Click the generated URL
5. Sign in with your Google account
6. Grant permissions
7. You'll be redirected back with tokens

## 📋 Google Cloud Console Checklist

- ✅ Project created
- ✅ YouTube Data API v3 enabled
- ✅ OAuth consent screen configured
- ✅ Test user (your email) added
- ✅ OAuth 2.0 Client ID created
- ✅ Redirect URI set to: `http://localhost:3000/api/youtube/callback`
- ✅ JavaScript origin set to: `http://localhost:3000`
- ✅ Credentials copied to .env file
- ✅ Application restarted

## 🔍 Troubleshooting

### Error: "invalid_client"
- **Cause:** CLIENT_ID or CLIENT_SECRET is wrong or placeholder
- **Fix:** Double-check credentials in Google Cloud Console

### Error: "redirect_uri_mismatch"
- **Cause:** Redirect URI in Google Console doesn't match exactly
- **Fix:** Must be exactly: `http://localhost:3000/api/youtube/callback`

### Error: "access_denied"
- **Cause:** User denied permissions or not in test users list
- **Fix:** Add your email to test users in OAuth consent screen

### Error: "admin_policy_enforced"
- **Cause:** Organization policy blocking
- **Fix:** Use personal Google account, not workspace account

## 📝 Important Notes

1. **Port 3000:** Everything runs on port 3000 (not 5000 or 5173)
2. **No trailing slash:** Redirect URI must NOT have trailing slash
3. **Test users:** In development, only test users can authenticate
4. **Scopes:** Make sure both scopes are added in OAuth consent screen
5. **API enabled:** YouTube Data API v3 must be enabled

## 🔗 Useful Links

- Google Cloud Console: https://console.cloud.google.com/
- YouTube API Documentation: https://developers.google.com/youtube/v3
- OAuth 2.0 Guide: https://developers.google.com/identity/protocols/oauth2

---

Once you complete these steps, YouTube authentication will work perfectly! 🚀
