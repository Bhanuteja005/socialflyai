/**
 * Test Script for SocialFly AI - Social Media Integration
 * Run with: node tests/test-all-apis.js
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Test results collector
const results = {
  passed: [],
  failed: [],
};

// Helper function to log test results
function logTest(name, passed, details = '') {
  if (passed) {
    console.log(`✅ PASSED: ${name}`);
    results.passed.push(name);
  } else {
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Details: ${details}`);
    results.failed.push({ name, details });
  }
}

// Discord Tests
async function testDiscord() {
  console.log('\n📨 Testing Discord API...\n');

  try {
    // Test: Send text message
    const response = await axios.post(`${BASE_URL}/api/discord/send-message`, {
      channelId: 'YOUR_CHANNEL_ID',
      content: 'Test message from SocialFly AI',
    });

    logTest(
      'Discord - Send Text Message',
      response.data.success === true,
      response.data.message
    );
  } catch (error) {
    logTest(
      'Discord - Send Text Message',
      false,
      error.response?.data?.error || error.message
    );
  }

  try {
    // Test: Send message with media
    const formData = new FormData();
    formData.append('channelId', 'YOUR_CHANNEL_ID');
    formData.append('content', 'Test message with media');
    
    // Create a test file if it exists
    const testFilePath = path.join(__dirname, 'test-image.jpg');
    if (fs.existsSync(testFilePath)) {
      formData.append('files', fs.createReadStream(testFilePath));
      
      const response = await axios.post(
        `${BASE_URL}/api/discord/send-message-with-media`,
        formData,
        {
          headers: formData.getHeaders(),
        }
      );

      logTest(
        'Discord - Send Message with Media',
        response.data.success === true,
        response.data.message
      );
    } else {
      logTest(
        'Discord - Send Message with Media',
        false,
        'Test image file not found. Create tests/test-image.jpg to test this endpoint.'
      );
    }
  } catch (error) {
    logTest(
      'Discord - Send Message with Media',
      false,
      error.response?.data?.error || error.message
    );
  }
}

// Facebook Tests
async function testFacebook() {
  console.log('\n📘 Testing Facebook API...\n');

  try {
    // Test: Post to Facebook
    const response = await axios.post(`${BASE_URL}/api/facebook/post`, {
      message: 'Test post from SocialFly AI',
      link: 'https://example.com',
    });

    logTest(
      'Facebook - Create Post',
      response.data.success === true,
      response.data.message
    );
  } catch (error) {
    logTest(
      'Facebook - Create Post',
      false,
      error.response?.data?.error || error.message
    );
  }

  try {
    // Test: Get posts
    const response = await axios.get(`${BASE_URL}/api/facebook/posts?limit=5`);

    logTest(
      'Facebook - Get Posts',
      response.data.success === true,
      `Retrieved ${response.data.data?.length || 0} posts`
    );
  } catch (error) {
    logTest(
      'Facebook - Get Posts',
      false,
      error.response?.data?.error || error.message
    );
  }

  try {
    // Test: Upload media
    const formData = new FormData();
    const testFilePath = path.join(__dirname, 'test-image.jpg');
    
    if (fs.existsSync(testFilePath)) {
      formData.append('file', fs.createReadStream(testFilePath));
      formData.append('description', 'Test image upload');

      const response = await axios.post(
        `${BASE_URL}/api/facebook/upload-media`,
        formData,
        {
          headers: formData.getHeaders(),
        }
      );

      logTest(
        'Facebook - Upload Media',
        response.data.success === true,
        response.data.message
      );
    } else {
      logTest(
        'Facebook - Upload Media',
        false,
        'Test image file not found. Create tests/test-image.jpg to test this endpoint.'
      );
    }
  } catch (error) {
    logTest(
      'Facebook - Upload Media',
      false,
      error.response?.data?.error || error.message
    );
  }
}

// LinkedIn Tests
async function testLinkedIn() {
  console.log('\n💼 Testing LinkedIn API...\n');

  try {
    // Test: Get profile
    const response = await axios.get(`${BASE_URL}/api/linkedin/profile`);

    logTest(
      'LinkedIn - Get Profile',
      response.data.success === true,
      `Profile: ${response.data.data?.name || 'N/A'}`
    );
  } catch (error) {
    logTest(
      'LinkedIn - Get Profile',
      false,
      error.response?.data?.error || error.message
    );
  }

  try {
    // Test: Create text post
    const response = await axios.post(`${BASE_URL}/api/linkedin/text-post`, {
      text: 'Test post from SocialFly AI #Testing',
    });

    logTest(
      'LinkedIn - Create Text Post',
      response.data.success === true,
      response.data.message
    );
  } catch (error) {
    logTest(
      'LinkedIn - Create Text Post',
      false,
      error.response?.data?.error || error.message
    );
  }

  try {
    // Test: Create image post
    const response = await axios.post(`${BASE_URL}/api/linkedin/image-post`, {
      text: 'Test image post from SocialFly AI',
      imageUrl: 'https://via.placeholder.com/800x600',
    });

    logTest(
      'LinkedIn - Create Image Post',
      response.data.success === true,
      response.data.message
    );
  } catch (error) {
    logTest(
      'LinkedIn - Create Image Post',
      false,
      error.response?.data?.error || error.message
    );
  }
}

// X (Twitter) Tests
async function testX() {
  console.log('\n𝕏 Testing X (Twitter) API...\n');

  try {
    // Test: Get auth URL
    const response = await axios.get(`${BASE_URL}/api/x/auth-url`);

    logTest(
      'X - Generate Auth URL',
      response.data.url !== undefined,
      'Auth URL generated successfully'
    );

    console.log(`   Note: To complete X authentication, visit the URL and obtain the code.`);
  } catch (error) {
    logTest(
      'X - Generate Auth URL',
      false,
      error.response?.data?.error || error.message
    );
  }

  // Note: Cannot automatically test token exchange and posting without manual OAuth flow
  console.log(`   ⚠️  X - Exchange Token: Requires manual OAuth (skipped in automated test)`);
  console.log(`   ⚠️  X - Post Tweet: Requires authentication (skipped in automated test)`);
}

// YouTube Tests
async function testYouTube() {
  console.log('\n📺 Testing YouTube API...\n');

  try {
    // Test: Get auth URL
    const response = await axios.get(`${BASE_URL}/api/youtube/auth-url`);

    logTest(
      'YouTube - Generate Auth URL',
      response.data.url !== undefined,
      'Auth URL generated successfully'
    );

    console.log(`   Note: To complete YouTube authentication, visit the URL and obtain the code.`);
  } catch (error) {
    logTest(
      'YouTube - Generate Auth URL',
      false,
      error.response?.data?.error || error.message
    );
  }

  // Note: Cannot automatically test token exchange and upload without manual OAuth flow
  console.log(`   ⚠️  YouTube - Exchange Token: Requires manual OAuth (skipped in automated test)`);
  console.log(`   ⚠️  YouTube - Upload Video: Requires authentication (skipped in automated test)`);
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting SocialFly AI API Tests...');
  console.log('=========================================\n');

  await testDiscord();
  await testFacebook();
  await testLinkedIn();
  await testX();
  await testYouTube();

  // Print summary
  console.log('\n=========================================');
  console.log('📊 TEST SUMMARY');
  console.log('=========================================');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log('=========================================\n');

  if (results.failed.length > 0) {
    console.log('Failed Tests:');
    results.failed.forEach((test) => {
      console.log(`  - ${test.name}`);
      console.log(`    ${test.details}`);
    });
  }

  console.log('\n✨ Test run complete!\n');
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };
