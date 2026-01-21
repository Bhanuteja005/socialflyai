#!/usr/bin/env node

/**
 * Test database connection directly
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('Testing database connection...');
console.log('Connection string:', connectionString.replace(/:[^:@]*@/, ':****@'));

const client = new Client({
  connectionString,
});

client.connect()
  .then(() => {
    console.log('✓ Successfully connected to database');
    return client.query('SELECT NOW()');
  })
  .then((result) => {
    console.log('✓ Database query successful:', result.rows[0]);
    return client.end();
  })
  .then(() => {
    console.log('✓ Connection closed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('✗ Database connection failed:');
    console.error(err.message);
    process.exit(1);
  });
