# SocialFly AI - API Testing Guide

## Overview
This directory contains test scripts for all social media API integrations in SocialFly AI.

## Prerequisites
1. **Environment Variables**: Ensure `.env.local` is configured with all required API credentials
2. **Dev Server**: Start the Next.js development server with `npm run dev`
3. **Test Files**: For file upload tests, place `test-image.jpg` in the `tests/` directory

## Available Test Scripts

### PowerShell Scripts (Windows)
- `run-all-tests.ps1` - Runs all test scripts sequentially
- `test-discord.ps1` - Tests Discord API endpoints
- `test-facebook.ps1` - Tests Facebook API endpoints
- `test-linkedin.ps1` - Tests LinkedIn API endpoints
- `test-x.ps1` - Tests X (Twitter) API endpoints
- `test-youtube.ps1` - Tests YouTube API endpoints

### Node.js Script
- `test-all-apis.js` - Automated test suite for all APIs

## Running Tests

### Option 1: PowerShell (Windows)
```powershell
# Run all tests
cd tests
.\run-all-tests.ps1

# Run individual platform tests
.\test-discord.ps1
.\test-facebook.ps1
.\test-linkedin.ps1
.\test-x.ps1
.\test-youtube.ps1
```

### Option 2: Node.js
```bash
# Install dependencies first
npm install

# Run automated tests
node tests/test-all-apis.js
```

### Option 3: Web Interface
The easiest way to test all integrations:
1. Start the dev server: `npm run dev`
2. Open http://localhost:3000 in your browser
3. Use the interactive UI to test each platform

## Environment Variables Required

### Discord
- `DISCORD_BOT_TOKEN`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`

### Facebook
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_PAGE_ACCESS_TOKEN`
- `FACEBOOK_PAGE_ID`

### LinkedIn
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_REFRESH_TOKEN`

### X (Twitter)
- `X_CLIENT_ID`
- `X_CLIENT_SECRET`
- `X_REDIRECT_URI`

### YouTube
- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_REDIRECT_URI`

## Test Coverage

### Discord
- ✅ Send text message
- ✅ Send message with media (images/files)
- ✅ Error handling

### Facebook
- ✅ Create text post
- ✅ Upload media
- ✅ Get recent posts
- ✅ Error handling

### LinkedIn
- ✅ Get user profile
- ✅ Create text post
- ✅ Create image post
- ✅ Error handling

### X (Twitter)
- ✅ Generate OAuth URL
- ✅ Exchange authorization code for token
- ✅ Post tweet
- ✅ Error handling

### YouTube
- ✅ Generate OAuth URL
- ✅ Exchange authorization code for token
- ✅ Upload video
- ✅ Error handling

## Notes

### OAuth Flows
X (Twitter) and YouTube require OAuth 2.0 authentication:
1. Generate auth URL using the API
2. Visit the URL and authorize the app
3. Copy the authorization code
4. Exchange code for access token
5. Use access token for API calls

### File Uploads
For testing file uploads:
1. Place test files in the `tests/` directory:
   - `test-image.jpg` for image uploads
   - `test-video.mp4` for video uploads
2. Or use the web interface which handles file selection

### Rate Limiting
Be aware of API rate limits:
- Discord: Various limits per endpoint
- Facebook: App-level rate limiting
- LinkedIn: Varies by API endpoint
- X: Standard OAuth 2.0 rate limits
- YouTube: Daily quota limits

## Troubleshooting

### "Server is not running" Error
- Ensure Next.js dev server is running: `npm run dev`
- Check if port 3000 is available

### "Authentication Failed" Errors
- Verify all environment variables in `.env.local`
- Check if tokens are expired (regenerate if needed)
- Ensure API credentials have correct permissions

### "File Not Found" Errors
- Create test files in the `tests/` directory
- Or use the web interface for file uploads

### API-Specific Errors
- Discord: Verify channel ID exists and bot has access
- Facebook: Check page access token permissions
- LinkedIn: Ensure access token has write permissions
- X: Verify OAuth credentials and redirect URI
- YouTube: Check API quota hasn't been exceeded

## Additional Resources

- [Discord API Documentation](https://discord.com/developers/docs)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [LinkedIn API](https://docs.microsoft.com/en-us/linkedin/)
- [X API Documentation](https://developer.twitter.com/en/docs)
- [YouTube Data API](https://developers.google.com/youtube/v3)

## Support
For issues or questions, please check the main README.md or create an issue in the project repository.
