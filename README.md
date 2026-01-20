# SocialFly AI - Unified Social Media Management Platform

A Next.js-based unified application for managing and posting to multiple social media platforms from a single interface. All platforms are managed through a unified backend running on **PORT 3000**.

## 🏗️ Architecture

**SocialFlyAI** is a single Next.js application (NOT microservices) that:
- Runs entirely on **PORT 3000** (frontend + API routes)
- Users toggle between platforms via tab interface
- All API endpoints are under `/api/*` routes
- Services in `/lib/services/` handle platform-specific logic
- Single `.env` file for all configuration

## 🚀 Features

### Supported Platforms
- **Discord** - Send messages and media to Discord channels
- **Facebook** - Post updates, upload media, and manage page content
- **LinkedIn** - Create text and image posts, manage professional profile
- **X (Twitter)** - Post tweets with OAuth 2.0 authentication
- **YouTube** - Upload videos with full OAuth flow

### Key Capabilities
- ✅ Unified web interface on PORT 3000
- ✅ RESTful API endpoints for all platforms
- ✅ Interactive tabbed UI for testing each platform
- ✅ Comprehensive test suite (PowerShell + Node.js)
- ✅ File upload support for media
- ✅ OAuth 2.0 authentication flows
- ✅ Error handling and validation
- ✅ Environment-based configuration

## 📋 Prerequisites

- Node.js 18+ and npm
- API credentials for each platform you want to use

## 🛠️ Installation

1. **Navigate to the project directory**
   ```bash
   cd socialflyai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update `.env` with your API credentials
   - See the [Environment Variables](#environment-variables) section below

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will start on **http://localhost:3000**

5. **Open your browser**
   - Navigate to http://localhost:3000
   - Use the tabs to switch between different social media platforms
   - Use the interactive UI to test integrations

## 🔐 Environment Variables

Update `.env.local` in the project root with your credentials. The file template is already created.

### Getting API Credentials

#### Discord
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token

#### Facebook
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app
3. Generate a Page Access Token with required permissions

#### LinkedIn
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create an app and generate access token

#### X (Twitter)
1. Go to [X Developer Portal](https://developer.twitter.com/)
2. Create a project and enable OAuth 2.0

#### YouTube
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials

## 📁 Project Structure

```
socialflyai/
├── app/
│   ├── api/                     # API routes
│   │   ├── discord/            # Discord endpoints
│   │   ├── facebook/           # Facebook endpoints
│   │   ├── linkedin/           # LinkedIn endpoints
│   │   ├── x/                  # X (Twitter) endpoints
│   │   └── youtube/            # YouTube endpoints
│   ├── page.tsx                # Main UI for testing
│   └── ...
├── tests/                      # Test scripts
│   ├── test-all-apis.js       # Node.js test suite
│   ├── *.ps1                  # PowerShell tests
│   └── README.md              # Test documentation
├── NovaLink-main/             # Original implementations
├── .env.local                 # Environment variables
└── package.json
```

## 🧪 Testing

### Interactive Web UI (Recommended)
1. Start the server: `npm run dev`
2. Open http://localhost:3000
3. Select a platform tab
4. Fill in required fields
5. Click action buttons and view responses

### Automated Tests

#### PowerShell (Windows)
```powershell
cd tests
.\run-all-tests.ps1
```

#### Node.js
```bash
node tests/test-all-apis.js
```

## 📚 API Endpoints

### Discord
- `POST /api/discord/send-message` - Send text message
- `POST /api/discord/send-message-with-media` - Send message with files

### Facebook
- `POST /api/facebook/post` - Create post
- `POST /api/facebook/upload-media` - Upload media
- `GET /api/facebook/posts` - Get recent posts

### LinkedIn
- `GET /api/linkedin/profile` - Get user profile
- `POST /api/linkedin/text-post` - Create text post
- `POST /api/linkedin/image-post` - Create image post

### X (Twitter)
- `GET /api/x/auth-url` - Generate OAuth URL
- `POST /api/x/callback` - Exchange code for token
- `POST /api/x/post` - Post tweet

### YouTube
- `GET /api/youtube/auth-url` - Generate OAuth URL
- `POST /api/youtube/callback` - Exchange code for token
- `POST /api/youtube/upload` - Upload video

## 🐛 Troubleshooting

**Authentication Errors**
- Verify all environment variables in `.env.local`
- Check if tokens are expired

**Discord Channel Not Found**
- Verify channel ID is correct
- Ensure bot has access to the channel

**OAuth Failed (X, YouTube)**
- Verify redirect URI matches exactly
- Check client ID and secret

## 📝 Notes

- OAuth flows require browser interaction
- Keep `.env.local` secure and never commit it
- Some platforms have rate limits

## 🤝 Acknowledgments

Built using the logic from NovaLink backend implementations.

---

**Made with ❤️ for social media integration testing**

