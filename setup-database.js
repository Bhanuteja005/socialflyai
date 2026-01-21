#!/usr/bin/env node

/**
 * Quick Database Setup Script
 * Sets up a Neon PostgreSQL database for SocialFly AI
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 SocialFly AI - Database Setup');
console.log('==================================\n');

console.log('This script will help you set up a free PostgreSQL database.\n');

console.log('Choose your database provider:');
console.log('1. Neon (Recommended - Free, no credit card required)');
console.log('2. Supabase (Free tier available)');
console.log('3. Local PostgreSQL with Docker');
console.log('4. Exit\n');

rl.question('Enter your choice (1-4): ', (choice) => {
  switch (choice) {
    case '1':
      setupNeon();
      break;
    case '2':
      setupSupabase();
      break;
    case '3':
      setupLocalDocker();
      break;
    case '4':
    default:
      console.log('Goodbye!');
      rl.close();
      break;
  }
});

function setupNeon() {
  console.log('\n🌟 Setting up Neon PostgreSQL Database');
  console.log('=====================================\n');

  console.log('Steps to create your Neon database:');
  console.log('1. Go to: https://neon.tech');
  console.log('2. Click "Sign up" (use GitHub, Google, or email)');
  console.log('3. Create a new project named "socialflyai"');
  console.log('4. In the dashboard, click "Connection string"');
  console.log('5. Copy the connection string\n');

  console.log('Example connection string format:');
  console.log('postgresql://username:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require\n');

  rl.question('Do you have your Neon connection string? (y/n): ', (hasString) => {
    if (hasString.toLowerCase() === 'y') {
      rl.question('Paste your connection string: ', (connectionString) => {
        updateEnvFile(connectionString);
        setupDatabase(connectionString);
      });
    } else {
      console.log('\nNo problem! Here are the complete steps:\n');
      console.log('1. Visit: https://console.neon.tech/');
      console.log('2. Sign up for free (no credit card required)');
      console.log('3. Create project: "socialflyai"');
      console.log('4. Get connection string from dashboard');
      console.log('5. Run this script again and paste the string\n');
      console.log('For now, you can test YouTube features without database.');
      console.log('Run: node test-youtube.js');
      rl.close();
    }
  });
}

function setupSupabase() {
  console.log('\n🗄️ Setting up Supabase PostgreSQL Database');
  console.log('=========================================\n');

  console.log('Steps to create your Supabase database:');
  console.log('1. Go to: https://supabase.com');
  console.log('2. Click "Start your project"');
  console.log('3. Sign up (free tier available)');
  console.log('4. Create a new project named "socialflyai"');
  console.log('5. Wait for project to be ready (~2 minutes)');
  console.log('6. Go to Settings > Database');
  console.log('7. Copy the "Connection string" (Direct connection)\n');

  console.log('Example connection string format:');
  console.log('postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres\n');

  rl.question('Do you have your Supabase connection string? (y/n): ', (hasString) => {
    if (hasString.toLowerCase() === 'y') {
      rl.question('Paste your connection string: ', (connectionString) => {
        updateEnvFile(connectionString);
        setupDatabase(connectionString);
      });
    } else {
      console.log('\nComplete setup instructions available in DATABASE_SETUP.md');
      rl.close();
    }
  });
}

function setupLocalDocker() {
  console.log('\n🐳 Setting up Local PostgreSQL with Docker');
  console.log('==========================================\n');

  console.log('Run these commands in PowerShell:\n');
  console.log('# Start PostgreSQL container');
  console.log('docker run --name socialflyai-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=socialflyai -p 5432:5432 -d postgres:15\n');
  console.log('# Wait 10 seconds, then run:');
  console.log('npx prisma db push\n');
  console.log('# Then start the app:');
  console.log('npm run dev\n');

  const localUrl = 'postgresql://postgres:postgres@localhost:5432/socialflyai?schema=public';
  updateEnvFile(localUrl);
  console.log('✅ Environment file updated with local database URL');
  console.log('Run the Docker command above, then: npx prisma db push');

  rl.close();
}

function updateEnvFile(connectionString) {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '.env.local');

  try {
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Replace the DATABASE_URL line
    const databaseUrlRegex = /DATABASE_URL="[^"]*"/;
    envContent = envContent.replace(databaseUrlRegex, `DATABASE_URL="${connectionString}"`);

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env.local with database URL');
  } catch (error) {
    console.error('❌ Failed to update .env.local:', error.message);
  }
}

function setupDatabase(connectionString) {
  console.log('\n🔧 Setting up database schema...');

  const { exec } = require('child_process');

  exec('npx prisma generate', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Prisma generate failed:', error);
      return;
    }
    console.log('✅ Prisma client generated');

    exec('npx prisma db push', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Database push failed:', error);
        console.log('This might be normal if the database is new. Try again in a moment.');
        return;
      }
      console.log('✅ Database schema created');
      console.log('\n🎉 Setup complete! You can now run:');
      console.log('npm run dev');
      console.log('Then visit: http://localhost:3000/dashboard');
    });
  });

  rl.close();
}