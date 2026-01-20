# Discord Bot Setup Guide

## 🚨 Issue Identified: INVALID/EXPIRED TOKEN

Your Discord bot token is **expired or revoked**. Discord is returning `401 Unauthorized`.

## ✅ Solution: Get a Fresh Token

### Step 1: Access Discord Developer Portal
1. Go to: https://discord.com/developers/applications
2. Log in with your Discord account

### Step 2: Select or Create Application
- **If you have an existing bot:** Click on your application name
- **If you need to create a new bot:**
  - Click "New Application"
  - Give it a name (e.g., "SocialFlyAI Bot")
  - Click "Create"

### Step 3: Get Your Bot Token
1. Click **"Bot"** in the left sidebar
2. If you don't have a bot yet, click **"Add Bot"** → **"Yes, do it!"**
3. Click **"Reset Token"** button
4. Click **"Yes, do it!"** to confirm
5. **COPY THE TOKEN IMMEDIATELY** (you'll only see it once!)
6. The token should look like: `MTxxxxxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 4: Configure Bot Permissions
In the same Bot page, scroll down to **"Bot Permissions"** and enable:
- ✅ Send Messages
- ✅ Send Messages in Threads
- ✅ Attach Files
- ✅ Embed Links
- ✅ Read Message History
- ✅ Use External Emojis

### Step 5: Add Bot to Your Server
1. Click **"OAuth2"** → **"URL Generator"** in the left sidebar
2. Under **SCOPES**, check:
   - ✅ `bot`
3. Under **BOT PERMISSIONS**, select the same permissions as Step 4
4. Copy the generated URL at the bottom
5. Paste it in your browser
6. Select your server and click **"Authorize"**

### Step 6: Update Your .env File
1. Open `d:\Programme\Atyuttama\NovaLink\socialflyai\.env`
2. Replace the `DISCORD_BOT_TOKEN` value with your new token:
   ```env
   DISCORD_BOT_TOKEN=YOUR_NEW_TOKEN_HERE
   ```
3. Save the file

### Step 7: Restart the Application
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 8: Verify Token is Valid
Visit: http://localhost:3000/api/discord/verify-token

You should see:
```json
{
  "success": true,
  "message": "Token is valid! ✓",
  "bot": {
    "username": "YourBotName",
    "verified": true
  }
}
```

### Step 9: Test Sending a Message
1. Get a channel ID from your Discord server:
   - Enable Developer Mode: Settings → Advanced → Developer Mode
   - Right-click on a channel → Copy ID
2. Use the SocialFlyAI UI to send a test message

## 📝 Additional Notes

- **Token Security**: Never share your bot token publicly or commit it to git
- **Token Format**: Must have 3 parts separated by dots (`.`)
- **Common Issues**:
  - Bot not in server → Follow Step 5
  - Missing permissions → Follow Step 4
  - Wrong channel ID → Make sure the bot can see the channel

## 🔍 Debugging Commands

Test token validity:
```bash
curl http://localhost:3000/api/discord/verify-token
```

Check environment config:
```bash
curl http://localhost:3000/api/health
```

## ⚠️ Why This Happened

Discord bot tokens can become invalid due to:
1. **Token Reset**: Someone reset the token in Discord Developer Portal
2. **Token Exposure**: Token was committed to git or shared publicly (Discord auto-revokes)
3. **Application Deleted**: The Discord application was deleted
4. **Account Issues**: Discord account issues or violations

The fix is simple: **Get a fresh token** following the steps above!
