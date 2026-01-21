# YouTube Integration - Quick Test Guide

## Prerequisites Checklist

✓ Node.js and npm installed
✓ YouTube API credentials configured
✓ Development server running (`npm run dev`)

## Test Steps

### 1. Verify YouTube Configuration

Run the test script:
```bash
node test-youtube.js
```

Expected output:
```
✓ HEALTH
✓ CONFIG  
✓ AUTHURL
```

### 2. Connect YouTube Account

1. Start the dev server if not running:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000/dashboard

3. Click on the **YouTube** platform card

4. Click **"Authorize"** button

5. You'll be redirected to Google OAuth consent screen

6. Sign in with your Google account that has a YouTube channel

7. Grant the following permissions:
   - View your YouTube account
   - Manage your YouTube videos
   - Upload videos to YouTube

8. After authorization, you'll be redirected back to the dashboard

9. Verify the YouTube account is connected:
   - Green "Connected" badge should appear
   - Your channel name should be displayed

### 3. Test Video Upload (Manual)

1. Click **"Create Post"** in the dashboard

2. Select **YouTube** from the platform dropdown

3. Fill in the video details:
   - **Title**: Test Upload from SocialFly
   - **Description**: This is a test video uploaded via the SocialFly platform
   - **Privacy**: Choose "Private" for testing

4. Click **"Choose File"** and select a video (MP4, MOV, AVI)
   - **Note**: Use a small test video (< 100MB) for faster upload
   - Recommended: Create a 5-10 second test video with your phone

5. Click **"Upload"** or **"Schedule"**

6. Monitor the upload progress

7. Verify in YouTube Studio:
   - Go to https://studio.youtube.com
   - Check "Content" section
   - Your test video should appear there

### 4. Test Scheduled Upload

1. Create a new post as in step 3

2. Toggle **"Schedule Post"** switch

3. Select a date/time (e.g., 2 minutes from now)

4. Click **"Schedule"**

5. The post status should show "Scheduled"

6. Wait for the scheduled time

7. The scheduler runs every 1 minute in development

8. After the scheduled time, check:
   - Post status changes to "Published"
   - Video appears in YouTube Studio

### 5. Troubleshooting

#### "Failed to get youtube auth URL"
- ✓ Check .env.local has correct credentials:
  ```
  YOUTUBE_CLIENT_ID=225804408412-lp6an2pjlqpndn94ig6avcss1f2cl303.apps.googleusercontent.com
  YOUTUBE_CLIENT_SECRET=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
  YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback
  ```
- Restart the dev server after updating .env.local

#### "Database connection failed"
- See DATABASE_SETUP.md for database configuration options
- The YouTube auth and upload features work independently of the database
- Database is only needed for storing connection details and scheduled posts

#### "Upload failed: Token expired"
- The refresh token should automatically renew
- If it fails, disconnect and reconnect your YouTube account

#### "Video upload stuck at 0%"
- Check video file size (should be < 100MB for testing)
- Check network connection
- Try with a smaller video file

#### "Scheduled post not publishing"
- Ensure the dev server is running
- Check browser console for scheduler logs
- Wait 1-2 minutes (scheduler runs every minute)

## Success Criteria

✅ YouTube account connects successfully
✅ Video uploads without errors
✅ Video appears in YouTube Studio
✅ Scheduled posts publish at correct time
✅ Token refresh works automatically

## Next Steps

After successful testing:

1. **Production Deployment**:
   - Set up production DATABASE_URL (see DATABASE_SETUP.md)
   - Add environment variables to Vercel
   - Deploy to production

2. **Update OAuth Credentials for Production**:
   - Add production URL to Google Cloud Console
   - Update YOUTUBE_REDIRECT_URI in production env

3. **Enable Other Platforms**:
   - Configure LinkedIn, Discord, Facebook as needed
   - Follow same connection flow

## Additional Resources

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [OAuth 2.0 for YouTube](https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps)
- [Video Upload Documentation](https://developers.google.com/youtube/v3/guides/uploading_a_video)
