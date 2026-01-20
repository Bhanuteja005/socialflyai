# 🚀 SocialFly AI - Quick Reference Card

## 🎯 One-Page Overview

### Start the App
```bash
npm run dev
# or
.\start.ps1
```
Then open: **http://localhost:3000**

---

## 📍 API Endpoints Quick Reference

### Discord
```
POST /api/discord/send-message
POST /api/discord/send-message-with-media
```

### Facebook
```
POST /api/facebook/post
POST /api/facebook/upload-media
GET  /api/facebook/posts
```

### LinkedIn
```
GET  /api/linkedin/auth-url
GET  /api/linkedin/auth-url-org
POST /api/linkedin/callback
GET  /api/linkedin/profile
POST /api/linkedin/text-post
POST /api/linkedin/image-post
POST /api/linkedin/media-post
POST /api/linkedin/org-post
POST /api/linkedin/org-media-post
```

### X (Twitter)
```
GET  /api/x/auth-url
POST /api/x/callback
POST /api/x/post
```

### YouTube
```
GET  /api/youtube/auth-url
POST /api/youtube/callback
POST /api/youtube/upload
```

---

## 🔑 Required Environment Variables

```env
# Discord
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Facebook
FACEBOOK_PAGE_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=

# LinkedIn
LINKEDIN_ACCESS_TOKEN=

# X
X_CLIENT_ID=
X_CLIENT_SECRET=
X_REDIRECT_URI=http://localhost:3000/api/x/callback

# YouTube
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback
```

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Main overview |
| SETUP.md | Get API credentials |
| IMPLEMENTATION.md | Technical details |
| ARCHITECTURE.md | Visual diagrams |
| PROJECT_COMPLETE.md | Completion summary |
| CHECKLIST.md | Task checklist |
| tests/README.md | Testing guide |

---

## 🧪 Testing Commands

### Web UI (Easiest)
```
npm run dev → http://localhost:3000
```

### PowerShell Tests
```powershell
cd tests
.\run-all-tests.ps1
```

### Node.js Tests
```bash
node tests/test-all-apis.js
```

---

## 🎨 Platform-Specific Quick Tips

### Discord
1. Create bot at discord.com/developers
2. Copy bot token
3. Invite bot to server
4. Right-click channel → Copy ID

### Facebook
1. Create app at developers.facebook.com
2. Get Page Access Token
3. Copy Page ID from page settings

### LinkedIn
1. Create app at linkedin.com/developers
2. Complete OAuth flow for token
3. Request API access

### X (Twitter)
1. Apply for developer account
2. Create project/app
3. Enable OAuth 2.0
4. Use web UI for OAuth flow

### YouTube
1. Create project at console.cloud.google.com
2. Enable YouTube Data API v3
3. Create OAuth credentials
4. Use web UI for OAuth flow

---

## 🆘 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| Server won't start | Check port 3000 is free |
| "Invalid credentials" | Verify .env.local values |
| "Channel not found" (Discord) | Check channel ID & bot access |
| OAuth redirect error | Match URIs exactly |
| Token expired | Generate new token |

---

## 📁 Project Structure at a Glance

```
socialflyai/
├── app/
│   ├── api/           ← 14 API endpoints
│   └── page.tsx       ← Testing UI
├── tests/             ← Test scripts
├── .env.local         ← Your credentials
└── *.md               ← Documentation
```

---

## 💻 Example API Calls

### Send Discord Message
```typescript
POST /api/discord/send-message
{
  "channelId": "123456789",
  "content": "Hello!"
}
```

### Post to Facebook
```typescript
POST /api/facebook/post
{
  "message": "My post",
  "link": "https://example.com"
}
```

### LinkedIn Post
```typescript
POST /api/linkedin/text-post
{
  "text": "My LinkedIn post"
}
```

### Tweet (requires token)
```typescript
POST /api/x/post
{
  "text": "My tweet",
  "accessToken": "your_token"
}
```

---

## ✅ Success Checklist

- [ ] npm install completed
- [ ] .env.local configured
- [ ] Server starts successfully
- [ ] UI loads at localhost:3000
- [ ] At least one platform tested

---

## 🎯 Next Steps

1. **Configure** → Update .env.local
2. **Start** → npm run dev
3. **Test** → Use web UI
4. **Verify** → Check all platforms
5. **Deploy** → When ready for production

---

## 🔗 Quick Links

- **Dev Server**: http://localhost:3000
- **Discord Dev**: https://discord.com/developers
- **Facebook Dev**: https://developers.facebook.com
- **LinkedIn Dev**: https://linkedin.com/developers
- **X Dev**: https://developer.twitter.com
- **Google Cloud**: https://console.cloud.google.com

---

## 📊 By the Numbers

- **5** Platforms
- **14** API Endpoints  
- **8** Test Scripts
- **7** Documentation Files
- **33** Total Files Created

---

## 🎉 You're Ready!

**Status**: ✅ Complete & Ready
**Action**: Update .env.local → npm run dev → Test!

---

*Keep this file handy for quick reference!*
