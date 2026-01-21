# Database Setup Guide

## Quick Start - Option 1: Use Neon (Recommended - Free Tier)

1. Go to https://console.neon.tech/
2. Sign up for a free account
3. Create a new project named "socialflyai"
4. Copy the connection string from the dashboard
5. Update `.env.local`:
   ```
   DATABASE_URL="postgresql://username:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require"
   ```
6. Run: `npx prisma db push`
7. Run: `npx prisma generate`

## Option 2: Use Supabase (Free Tier)

1. Go to https://supabase.com/
2. Create a new project
3. Go to Project Settings > Database
4. Copy the "Connection string" (Direct connection)
5. Update `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
   ```
6. Run: `npx prisma db push`
7. Run: `npx prisma generate`

## Option 3: Local PostgreSQL

### Windows (using PostgreSQL)

1. Download and install PostgreSQL from https://www.postgresql.org/download/windows/
2. During installation:
   - Set password for postgres user (remember this)
   - Default port: 5432
3. After installation, open pgAdmin or psql
4. Create database:
   ```sql
   CREATE DATABASE socialflyai;
   ```
5. Update `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/socialflyai?schema=public"
   ```
6. Run: `npx prisma db push`
7. Run: `npx prisma generate`

### Windows (using Docker)

1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
2. Run PostgreSQL container:
   ```powershell
   docker run --name socialflyai-db `
     -e POSTGRES_PASSWORD=postgres `
     -e POSTGRES_DB=socialflyai `
     -p 5432:5432 `
     -d postgres:15
   ```
3. Update `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/socialflyai?schema=public"
   ```
4. Run: `npx prisma db push`
5. Run: `npx prisma generate`

## Verify Database Connection

Run the test script:
```bash
node test-db-connection.js
```

You should see:
```
✓ Successfully connected to database
✓ Database query successful
✓ Connection closed
```

## Initialize Database Schema

After configuring the DATABASE_URL:

1. Push schema to database:
   ```bash
   npx prisma db push
   ```

2. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

3. (Optional) Open Prisma Studio to view database:
   ```bash
   npx prisma studio
   ```

## Troubleshooting

### "Failed to identify your database"
- The old Prisma Cloud database URL is no longer valid
- Use one of the options above to set up a new database

### "Can't reach database server"
- Ensure PostgreSQL is running (for local setup)
- Check the DATABASE_URL format is correct
- For cloud databases, check firewall/security settings

### "password authentication failed"
- Double-check the password in DATABASE_URL
- Make sure there are no special characters that need encoding

### "database does not exist"
- Create the database first: `CREATE DATABASE socialflyai;`
- For cloud providers, use their web interface to create the database

## Production Deployment

For production (Vercel), use:
- **Neon** (recommended): Serverless PostgreSQL, Vercel integration
- **Supabase**: Full-featured, includes auth and storage
- **Railway**: Easy deployment, generous free tier
- **Vercel Postgres**: Built-in integration (paid)

Add the production DATABASE_URL to your Vercel environment variables.
