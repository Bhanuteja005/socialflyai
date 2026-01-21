# YouTube Integration Guide

## Overview
YouTube has been integrated into SocialFly AI following the same pattern as LinkedIn and Discord. You can now:
- Connect your YouTube channel
- Upload videos directly to YouTube
- Schedule video uploads
- Manage YouTube posts from the dashboard

## Setup Instructions

### 1. Environment Variables
Add these to your `.env.local`:

```env
YOUTUBE_CLIENT_ID=225804408412-lp6an2pjlqpndn94ig6avcss1f2cl303.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=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
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback
```

### 2. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable YouTube Data API v3
3. Configure OAuth consent screen:
   - Add scopes:
     - `https://www.googleapis.com/auth/youtube.upload`
     - `https://www.googleapis.com/auth/youtube.readonly`
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `https://www.googleapis.com/auth/userinfo.email`
4. Add authorized redirect URI:
   - Development: `http://localhost:3000/api/youtube/callback`
   - Production: `https://yourdomain.com/api/youtube/callback`

## Features

### 1. OAuth Authentication
- **Endpoint**: `/api/youtube/auth-url`
- Generates OAuth URL for user authorization
- Redirects to Google for authentication

### 2. OAuth Callback
- **Endpoint**: `/api/youtube/callback`
- Handles OAuth callback from Google
- Stores YouTube channel information and tokens
- Supports automatic token refresh

### 3. Video Upload
- **Endpoint**: `/api/youtube/upload`
- Uploads videos to YouTube
- Supports video metadata (title, description, privacy)
- Automatically refreshes expired tokens

### 4. Scheduled Posts
- YouTube videos can be scheduled like other platforms
- Scheduler automatically uploads videos at scheduled time
- Failed uploads are marked with error messages

## Usage

### Connecting YouTube Account

1. Click "YouTube" in the platform selector on the dashboard
2. Click "Authorize" in the connection modal
3. Grant permissions in Google OAuth screen
4. Your YouTube channel will be connected automatically

### Uploading a Video

**Direct Upload (API)**:
```javascript
const formData = new FormData();
formData.append('video', videoFile);
formData.append('title', 'My Video Title');
formData.append('description', 'Video description');
formData.append('socialAccountId', youtubeAccountId);
formData.append('privacyStatus', 'public'); // or 'private', 'unlisted'

const response = await fetch('/api/youtube/upload', {
  method: 'POST',
  headers: {
    'x-user-id': 'default-user',
  },
  body: formData
});
```

**Scheduled Upload**:
1. Select YouTube account in Post Composer
2. Upload video file
3. Set title and description
4. Choose schedule time
5. Post will upload automatically at scheduled time

### Managing Tokens

The YouTube service automatically:
- Refreshes access tokens when expired
- Stores refresh tokens for long-term access
- Updates token expiry times in the database

## Database Schema

YouTube accounts are stored in `socialAccount` table:
```prisma
{
  platform: "youtube"
  platformId: "UCxxxxxxxxxxxxxxxx" // YouTube Channel ID
  accountName: "Channel Name"
  avatarUrl: "https://..." // Channel thumbnail
  accessToken: "ya29.xxx..." // OAuth access token
  refreshToken: "1//xxx..." // OAuth refresh token
  tokenExpiry: DateTime // Token expiration time
  metadata: {
    channelId: "UCxxxxxxxxxxxxxxxx"
    channelTitle: "Channel Name"
  }
}
```

## File Structure

```
app/
  api/
    youtube/
      auth-url/
        route.ts          # Generate OAuth URL
      callback/
        route.ts          # Handle OAuth callback
      upload/
        route.ts          # Upload video
lib/
  services/
    youtube.service.ts    # YouTube API integration
  scheduler.ts            # Includes YouTube support
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/youtube/auth-url` | GET | Get OAuth authorization URL |
| `/api/youtube/callback` | GET | Handle OAuth callback |
| `/api/youtube/upload` | POST | Upload video to YouTube |

## Privacy Settings

Videos can be uploaded with different privacy settings:
- `public` - Visible to everyone
- `unlisted` - Only accessible via link
- `private` - Only visible to you

## Troubleshooting

### Token Refresh Issues
If token refresh fails:
1. Check that `YOUTUBE_CLIENT_SECRET` is correct
2. Verify refresh token is stored in database
3. Reconnect your YouTube account

### Upload Failures
Common issues:
- **File too large**: YouTube has upload limits based on account verification
- **Invalid format**: Ensure video is in supported format (MP4, AVI, etc.)
- **Quota exceeded**: YouTube API has daily quota limits

### Connection Errors
If connection fails:
1. Verify redirect URI matches Google Cloud Console
2. Check that YouTube Data API v3 is enabled
3. Ensure OAuth consent screen is configured

## Production Deployment

For production on Vercel:
1. Add environment variables to Vercel project settings
2. Update `YOUTUBE_REDIRECT_URI` to production URL
3. Add production redirect URI to Google Cloud Console
4. Redeploy application

## Testing

Test the integration:
```bash
# 1. Connect YouTube account
Visit http://localhost:3000/dashboard
Click YouTube → Authorize

# 2. Upload a test video
Use the Post Composer to upload a short test video

# 3. Check scheduled uploads
Schedule a video and verify it uploads at the specified time
```

## Limitations

- YouTube API has daily quota limits
- Video processing may take time after upload
- Maximum video file size depends on channel verification
- Scheduled uploads require videos to be stored and accessible

## Support

For issues or questions:
- Check YouTube API documentation: https://developers.google.com/youtube/v3
- Review error messages in browser console
- Check server logs for detailed error information
