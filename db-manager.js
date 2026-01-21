#!/usr/bin/env node

/**
 * Local Database Manager for SocialFly AI
 * Manages PostgreSQL database using Docker
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONTAINER_NAME = 'socialflyai-db';
const DB_NAME = 'socialflyai';
const DB_USER = 'postgres';
const DB_PASSWORD = 'postgres';
const DB_PORT = 5432;

function log(message, color = '\x1b[0m') {
  console.log(`${color}${message}\x1b[0m`);
}

function success(message) {
  log(`✅ ${message}`, '\x1b[32m');
}

function error(message) {
  log(`❌ ${message}`, '\x1b[31m');
}

function info(message) {
  log(`ℹ️  ${message}`, '\x1b[36m');
}

function warning(message) {
  log(`⚠️  ${message}`, '\x1b[33m');
}

function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    success('Docker is installed');
    return true;
  } catch (e) {
    error('Docker is not installed or not running');
    info('Please install Docker Desktop from: https://www.docker.com/products/docker-desktop');
    return false;
  }
}

function isContainerRunning() {
  try {
    const output = execSync(`docker ps -q -f name=${CONTAINER_NAME}`, { encoding: 'utf8' });
    return output.trim().length > 0;
  } catch (e) {
    return false;
  }
}

function isContainerExists() {
  try {
    const output = execSync(`docker ps -aq -f name=${CONTAINER_NAME}`, { encoding: 'utf8' });
    return output.trim().length > 0;
  } catch (e) {
    return false;
  }
}

function startDatabase() {
  info('Starting PostgreSQL database...');

  if (isContainerRunning()) {
    success('Database is already running');
    return;
  }

  if (isContainerExists()) {
    info('Starting existing container...');
    execSync(`docker start ${CONTAINER_NAME}`, { stdio: 'inherit' });
  } else {
    info('Creating new database container...');
    execSync(`docker run --name ${CONTAINER_NAME} -e POSTGRES_PASSWORD=${DB_PASSWORD} -e POSTGRES_DB=${DB_NAME} -p ${DB_PORT}:${DB_PORT} -d postgres:15`, { stdio: 'inherit' });
  }

  // Wait for database to be ready
  info('Waiting for database to be ready...');
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    try {
      execSync(`docker exec ${CONTAINER_NAME} pg_isready -U ${DB_USER} -d ${DB_NAME}`, { stdio: 'pipe' });
      success('Database is ready!');
      return;
    } catch (e) {
      attempts++;
      if (attempts < maxAttempts) {
        process.stdout.write('.');
        execSync('sleep 1');
      }
    }
  }

  error('Database failed to start within 30 seconds');
  process.exit(1);
}

function stopDatabase() {
  info('Stopping database...');

  if (!isContainerExists()) {
    warning('Database container does not exist');
    return;
  }

  execSync(`docker stop ${CONTAINER_NAME}`, { stdio: 'inherit' });
  success('Database stopped');
}

function removeDatabase() {
  info('Removing database container...');

  if (!isContainerExists()) {
    warning('Database container does not exist');
    return;
  }

  execSync(`docker rm ${CONTAINER_NAME}`, { stdio: 'inherit' });
  success('Database container removed');
}

function setupDatabase() {
  info('Setting up database schema...');

  try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    success('Database schema created');

    execSync('npx prisma generate', { stdio: 'inherit' });
    success('Prisma client generated');

  } catch (e) {
    error('Failed to setup database schema');
    console.error(e.message);
    process.exit(1);
  }
}

function testConnection() {
  info('Testing database connection...');

  const testScript = `
    const { Client } = require('pg');
    const client = new Client({
      host: 'localhost',
      port: ${DB_PORT},
      user: '${DB_USER}',
      password: '${DB_PASSWORD}',
      database: '${DB_NAME}'
    });

    client.connect()
      .then(() => {
        console.log('✅ Connected to database');
        return client.query('SELECT NOW()');
      })
      .then(result => {
        console.log('✅ Query successful:', result.rows[0]);
        return client.end();
      })
      .then(() => {
        console.log('✅ Connection closed');
        process.exit(0);
      })
      .catch(err => {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
      });
  `;

  const tempFile = path.join(__dirname, 'temp-test.js');
  fs.writeFileSync(tempFile, testScript);

  try {
    execSync(`node ${tempFile}`, { stdio: 'inherit' });
  } finally {
    fs.unlinkSync(tempFile);
  }
}

function showStatus() {
  info('Database Status:');

  if (isContainerRunning()) {
    success('Database is running');
    console.log(`📍 Host: localhost`);
    console.log(`🔌 Port: ${DB_PORT}`);
    console.log(`👤 User: ${DB_USER}`);
    console.log(`🗄️  Database: ${DB_NAME}`);
    console.log(`🔗 Connection: postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}`);
  } else if (isContainerExists()) {
    warning('Database container exists but is stopped');
    console.log('Run: npm run db:start');
  } else {
    warning('Database container does not exist');
    console.log('Run: npm run db:start');
  }
}

function showHelp() {
  console.log(`
🐘 SocialFly AI - Local Database Manager

USAGE:
  node db-manager.js <command>

COMMANDS:
  start     Start the PostgreSQL database
  stop      Stop the database
  restart   Restart the database
  remove    Remove the database container (⚠️  DELETES ALL DATA)
  setup     Setup database schema and generate Prisma client
  test      Test database connection
  status    Show database status
  help      Show this help message

QUICK START:
  1. npm run db:start    # Start database
  2. npm run db:setup    # Setup schema
  3. npm run dev         # Start the app

EXAMPLES:
  node db-manager.js start
  node db-manager.js setup
  node db-manager.js test
  `);
}

// Main execution
const command = process.argv[2];

if (!command) {
  showHelp();
  process.exit(1);
}

switch (command) {
  case 'start':
    if (!checkDocker()) process.exit(1);
    startDatabase();
    break;

  case 'stop':
    stopDatabase();
    break;

  case 'restart':
    stopDatabase();
    startDatabase();
    break;

  case 'remove':
    if (isContainerRunning()) {
      stopDatabase();
    }
    removeDatabase();
    break;

  case 'setup':
    if (!isContainerRunning()) {
      error('Database is not running. Run: npm run db:start');
      process.exit(1);
    }
    setupDatabase();
    break;

  case 'test':
    if (!isContainerRunning()) {
      error('Database is not running. Run: npm run db:start');
      process.exit(1);
    }
    testConnection();
    break;

  case 'status':
    showStatus();
    break;

  case 'help':
  default:
    showHelp();
    break;
}