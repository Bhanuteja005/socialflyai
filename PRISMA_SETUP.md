# Prisma Data Platform Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Prisma Account
1. Go to https://console.prisma.io/
2. Sign up with GitHub/Google or email
3. Verify your email

### Step 2: Create Database
1. Click **"New Project"**
2. Name: `socialflyai`
3. Choose **PostgreSQL**
4. Select **Cloud** (hosted database)
5. Choose region (closest to you)
6. Click **"Create Project"**

### Step 3: Get Database URL
1. In your project dashboard, go to **"Connect"** tab
2. Copy the **"Database URL"** (it looks like this):
   ```
   postgresql://username:password@host:5432/database?sslmode=require
   ```

### Step 4: Update Environment
1. Open `.env.local`
2. Replace the DATABASE_URL with your actual URL:
   ```env
   DATABASE_URL="postgresql://your_actual_url_here"
   ```

### Step 5: Setup Database Schema
```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Test connection
node test-db-connection.js
```

### Step 6: Start Application
```bash
npm run dev
```

## 🎯 What You Get

✅ **Managed PostgreSQL Database**
- Automatic backups
- High availability
- SSL encryption
- No server management

✅ **Web Dashboard**
- View/edit data
- Run queries
- Monitor performance
- Manage migrations

✅ **API Access**
- RESTful API endpoints
- GraphQL API
- Real-time subscriptions

## 📊 Database Management

### View Data in Browser
1. Go to https://console.prisma.io/
2. Select your project
3. Click **"Data"** tab
4. Browse tables: `User`, `SocialAccount`, `Post`

### Run Queries
1. Click **"Query"** tab
2. Write SQL queries
3. Execute and see results

### Monitor Usage
- **"Metrics"** tab: Performance stats
- **"Logs"** tab: Query logs
- **"Settings"** tab: Configuration

## 🔧 Troubleshooting

### "Failed to identify your database"
- Check DATABASE_URL is correct
- Ensure SSL mode is included
- Verify credentials are valid

### "Connection timeout"
- Database might be paused (free tier)
- Go to console and click "Resume"
- Wait 30 seconds, then retry

### "Migration failed"
```bash
# Reset and try again
npx prisma db push --force-reset
```

## 💰 Pricing

- **Free Tier**: 1GB storage, 1 database
- **Pro**: $25/month - 10GB storage, multiple databases
- **Enterprise**: Custom pricing

## 🔄 Migration from Local

If you have local data to migrate:

1. Export from local database:
   ```bash
   pg_dump -U postgres -h localhost socialflyai > backup.sql
   ```

2. Import to Prisma:
   - Use the web dashboard **"Query"** tab
   - Run the SQL from backup.sql

## 📞 Support

- **Documentation**: https://www.prisma.io/docs
- **Community**: https://slack.prisma.io/
- **Issues**: https://github.com/prisma/prisma/issues

---

**Ready to get your database URL?** Follow the steps above and update your `.env.local`! 🚀