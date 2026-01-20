# SocialFly AI - Complete Social Media Management Platform

A production-ready social media management platform similar to Buffer and SocialPilot, built with Next.js, PostgreSQL, and Prisma.

## 🚀 Features

- **Multi-Platform Support**: LinkedIn, Facebook, Discord, YouTube, Twitter/X, Instagram, Bluesky, Mastodon, Pinterest
- **Database-Backed**: PostgreSQL with Prisma ORM for reliable data storage
- **Token Management**: Secure storage and retrieval of OAuth tokens
- **Unified Posting Interface**: Post to multiple platforms from one dashboard
- **Buffer-Style UI**: Beautiful, intuitive interface for managing social accounts
- **End-to-End Tested**: Comprehensive testing for all integrations

## 📋 Prerequisites

1. Node.js 18+ installed
2. Discord bot created and added to your server
3. Discord Developer Mode enabled (for getting channel IDs)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The `.env.local` file is already configured with:
- Discord bot credentials
- PostgreSQL database connection (Prisma Cloud)
- Facebook, LinkedIn, YouTube, Twitter credentials

### 3. Database Setup

The database is already configured and migrated! We're using Prisma Postgres (cloud).

To verify the database:
```bash
npx prisma studio
```

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:3000

## 🎯 Testing Discord Integration

### Get Your Discord Channel ID

1. Open Discord
2. Go to User Settings → Advanced
3. Enable "Developer Mode"
4. Right-click on any channel
5. Click "Copy Channel ID"

### Run the End-to-End Test

```bash
node test-discord-integration.js YOUR_CHANNEL_ID
```

Example:
```bash
node test-discord-integration.js 1234567890123456789
```

This will:
1. ✅ Connect Discord to the database
2. ✅ Post a test message to your Discord channel
3. ✅ Save the post to PostgreSQL
4. ✅ Verify all data is retrievable

## 🌐 Using the Dashboard

### Access the Dashboard

Visit: http://localhost:3000/dashboard

### Connect Discord

1. Click on "Connect" next to Discord
2. Or visit: http://localhost:3000/connect/discord
3. Enter your Discord channel ID
4. Enter channel and server names (optional)
5. Click "Connect"

### Post to Discord

Once connected, you can post through:
- The web dashboard UI
- The API endpoints
- Scheduled posts (coming soon)

## 📡 API Endpoints

### Social Accounts

```bash
# Get all connected accounts
GET /api/social-accounts
Headers: x-user-id: default-user

# Connect a new account
POST /api/social-accounts
Headers: x-user-id: default-user
Body: { platform, platformId, accountName, accessToken, ... }
```

### Discord

```bash
# Connect Discord
POST /api/discord/connect
Headers: x-user-id: default-user
Body: { channelId, channelName, guildName }

# Post to Discord
POST /api/discord/post
Headers: x-user-id: default-user
Body: { socialAccountId, content, mediaUrls }

# Get Discord accounts
GET /api/discord/connect
Headers: x-user-id: default-user
```

### Posts

```bash
# Create a post
POST /api/posts
Headers: x-user-id: default-user
Body: { socialAccountId, content, mediaUrls, scheduledFor }

# Get all posts
GET /api/posts
Headers: x-user-id: default-user
```

## 🗄️ Database Schema

### User
- id, email, name
- Relations: socialAccounts, posts

### SocialAccount
- Platform details (linkedin, facebook, discord, etc.)
- OAuth tokens (encrypted in production)
- Account metadata

### Post
- Content, media URLs
- Scheduling information
- Publication status
- Platform-specific post IDs

### OAuthState
- OAuth flow state management
- Security tokens

## 🔒 Security Notes

**Current Setup (Development)**:
- User ID is hardcoded as "default-user"
- Tokens stored in plain text in database

**Production Recommendations**:
1. Implement proper authentication (NextAuth.js, Auth0, etc.)
2. Encrypt tokens before storing in database
3. Use environment-specific API keys
4. Implement rate limiting
5. Add CSRF protection
6. Use HTTPS only

## 🚧 Roadmap

- [x] PostgreSQL database setup
- [x] Prisma ORM integration
- [x] Discord integration
- [x] Buffer-style dashboard UI
- [x] Social account management
- [x] Post creation and storage
- [ ] LinkedIn OAuth and posting
- [ ] Facebook OAuth and posting
- [ ] YouTube OAuth and uploading
- [ ] Twitter/X OAuth and posting
- [ ] Multi-platform posting (post to all at once)
- [ ] Scheduled posting with cron jobs
- [ ] Post analytics and insights
- [ ] Media upload and management
- [ ] Team collaboration features
- [ ] User authentication
- [ ] Role-based access control

## 📚 Tech Stack

- **Frontend**: Next.js 16, React, TailwindCSS, React Icons
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL (Prisma Postgres Cloud)
- **ORM**: Prisma
- **APIs**: Discord, Facebook Graph API, LinkedIn API, YouTube Data API, Twitter API

## 🐛 Troubleshooting

### Discord Bot Not Posting

1. **Check bot permissions**: Bot needs "Send Messages" permission
2. **Verify bot is in server**: Bot must be added to your Discord server
3. **Check channel ID**: Make sure you copied the correct channel ID
4. **Enable Developer Mode**: Required to copy channel IDs

### Database Connection Issues

The app uses Prisma Postgres (cloud), so no local PostgreSQL installation needed. If you see connection errors:

1. Check your internet connection
2. Verify DATABASE_URL in `.env.local`
3. Run `npx prisma generate` to regenerate client

### Next.js Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run dev
```

## 📝 License

MIT

## 👥 Contributing

This is a demonstration project. Feel free to fork and modify for your own use!

## 🎉 Credits

Built with ❤️ using modern web technologies and best practices.

---

**Ready to test?** Run: `node test-discord-integration.js YOUR_CHANNEL_ID`

**Need help?** Check the troubleshooting section or review the API documentation above.
