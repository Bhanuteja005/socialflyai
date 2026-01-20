# SocialFly AI - Social Media Management Platform

A complete end-to-end social media management platform for scheduling and publishing posts across multiple social channels from a unified dashboard.

## 🚀 Features

- **Multi-Platform Support**: LinkedIn, Discord, Twitter/X, Facebook, Instagram, and more
- **Unified Dashboard**: Manage all your social accounts from one place
- **Post Composer**: Create posts for multiple platforms simultaneously
- **Scheduling**: Schedule posts for future publishing
- **Queue Management**: View scheduled, draft, and published posts
- **Real-time Updates**: See your posts' status in real-time

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Social platform developer accounts (LinkedIn, Discord, Twitter, Facebook)

## 🔧 Setup

### 1. Environment Variables

Create a `.env.local` file with the following:

```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# LinkedIn
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/linkedin/callback

# Discord
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# Twitter/X
X_CLIENT_ID=your_client_id
X_CLIENT_SECRET=your_client_secret
X_REDIRECT_URI=http://localhost:3000/api/x/callback

# Facebook
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_token
FACEBOOK_PAGE_ID=your_page_id
```

### 2. LinkedIn Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Under **Auth** → **OAuth 2.0 settings**:
   - Add redirect URL: `http://localhost:3000/api/linkedin/callback`
   - Request scopes: `openid`, `profile`, `email`, `w_member_social`
4. Copy Client ID and Client Secret to `.env.local`

### 3. Discord Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to **Bot** section and create a bot
4. Copy the bot token to `.env.local`
5. Enable these **Privileged Gateway Intents**:
   - Server Members Intent
   - Message Content Intent
6. Add bot to your server using OAuth2 URL Generator:
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Send Messages`, `Read Messages/View Channels`

### 4. Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📖 Usage

### Connecting Accounts

1. Open the dashboard: `http://localhost:3000/dashboard`
2. Click on any platform in the sidebar (LinkedIn, Discord, Twitter, etc.)
3. Follow the OAuth flow to authorize your account
4. Once connected, the platform will show as active

### Creating Posts

#### Option 1: Via Dashboard UI

1. Click the **"+ New"** button in the top header
2. Select the accounts you want to post to
3. Write your content
4. (Optional) Add media files
5. (Optional) Schedule for a specific date/time
6. Click **"Post Now"** or **"Schedule Post"**

#### Option 2: Via API

```bash
# Create an immediate post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "x-user-id: default-user" \
  -d '{
    "socialAccountId": "your_account_id",
    "content": "Your post content here"
  }'

# Create a scheduled post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "x-user-id: default-user" \
  -d '{
    "socialAccountId": "your_account_id",
    "content": "Your scheduled content",
    "scheduledFor": "2026-01-25T15:30:00Z"
  }'
```

### Managing Posts

- **Queue Tab**: View all scheduled posts
- **Drafts Tab**: View posts saved as drafts
- **Sent Tab**: View all published posts
- Click on any post to see details

## 🧪 Testing

### Test All Integrations

Run the comprehensive test script:

```bash
node test-socialfly-platform.js
```

This will:
- Check connected accounts
- Create test posts on all active platforms
- Test scheduling functionality
- Display platform statistics

### Test Individual Platforms

#### LinkedIn
```bash
node final-linkedin-test.js
```

#### Discord
Make sure your bot is added to a server, then:
```bash
# Test via API
curl -X POST http://localhost:3000/api/discord/connect \
  -H "Content-Type: application/json" \
  -H "x-user-id: default-user" \
  -d '{
    "channelId": "your_channel_id",
    "channelName": "general",
    "guildName": "Your Server"
  }'
```

#### Facebook
```bash
node test-facebook-api.js
```

## 📁 Project Structure

```
socialflyai/
├── app/
│   ├── api/
│   │   ├── posts/          # Post management endpoints
│   │   ├── linkedin/       # LinkedIn OAuth & posting
│   │   ├── discord/        # Discord bot integration
│   │   ├── x/              # Twitter/X integration
│   │   ├── facebook/       # Facebook integration
│   │   └── social-accounts/ # Account management
│   ├── components/
│   │   └── PostComposer.tsx # Unified post creation UI
│   ├── dashboard/
│   │   └── page.tsx        # Main dashboard
│   └── page.tsx            # Landing page
├── prisma/
│   └── schema.prisma       # Database schema
└── lib/
    └── prisma.ts           # Prisma client
```

## 🔑 API Endpoints

### Social Accounts
- `GET /api/social-accounts` - List connected accounts
- `POST /api/social-accounts` - Connect new account

### Posts
- `GET /api/posts` - List all posts
- `GET /api/posts?status=scheduled` - List posts by status
- `POST /api/posts` - Create new post

### Platform-Specific
- `GET /api/linkedin/auth-url` - Get LinkedIn OAuth URL
- `GET /api/linkedin/callback` - LinkedIn OAuth callback
- `POST /api/linkedin/text-post` - Post text to LinkedIn
- `POST /api/discord/connect` - Connect Discord channel
- `GET /api/x/auth-url` - Get Twitter OAuth URL
- `POST /api/x/post` - Post to Twitter

## 🎯 Troubleshooting

### LinkedIn "redirect_uri does not match"

**Solution**: Ensure `http://localhost:3000/api/linkedin/callback` is added to your LinkedIn app's **Authorized redirect URLs**

### Discord Bot Cannot Access Channel

**Solution**: 
1. Verify bot is added to the server
2. Check bot has **Send Messages** and **View Channel** permissions
3. Ensure bot token is correct in `.env.local`

### Posts Not Publishing

**Solution**:
1. Check account is still connected: `GET /api/social-accounts`
2. Verify access tokens haven't expired
3. Check post status: `GET /api/posts`
4. Review console logs for specific errors

## 🚧 Known Limitations

- Twitter/X posting requires Twitter API v2 credentials (OAuth 2.0)
- Facebook posting requires `pages_manage_posts` permission
- Scheduled posts currently trigger on app restart (implement cron job for production)
- Media uploads in progress (currently text-only for most platforms)

## 📝 Next Steps for Production

1. **Implement proper authentication** (replace `default-user` with real auth)
2. **Add cron job for scheduled posts** (use node-cron or external scheduler)
3. **Implement token refresh logic** for expired OAuth tokens
4. **Add media upload handling** (image/video processing)
5. **Set up error monitoring** (Sentry, LogRocket)
6. **Add rate limiting** to prevent API abuse
7. **Encrypt sensitive tokens** in database
8. **Deploy to production** (Vercel, AWS, etc.)

## 📄 License

MIT

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

Built with ❤️ using Next.js, Prisma, and PostgreSQL
