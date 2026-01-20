const axios = require('axios');

const baseUrl = 'http://localhost:3000';

async function testSocialFlyPlatform() {
  console.log('🚀 SOCIALFLY PLATFORM END-TO-END TEST 🚀\n');

  try {
    // Test 1: Check connected accounts
    console.log('1. Checking connected social accounts...');
    const accountsResponse = await axios.get(`${baseUrl}/api/social-accounts`, {
      headers: {
        'x-user-id': 'default-user',
      },
    });
    console.log(`✅ Found ${accountsResponse.data.accounts.length} connected accounts:`);
    accountsResponse.data.accounts.forEach(acc => {
      console.log(`   - ${acc.platform}: ${acc.accountName || 'Not named'} (${acc.isActive ? 'Active' : 'Inactive'})`);
    });
    console.log('');

    if (accountsResponse.data.accounts.length === 0) {
      console.log('⚠️  No accounts connected. Please connect at least one account via the dashboard.');
      return;
    }

    // Test 2: Create a test post for each connected account
    console.log('2. Creating test posts...');
    const testContent = `🎯 SocialFly Platform Test
    
This is an automated test post demonstrating the unified posting system.

✅ Multi-platform support
✅ Scheduling capabilities
✅ Unified dashboard

Test timestamp: ${new Date().toISOString()}

#SocialFlyAI #Automation #SocialMedia`;

    for (const account of accountsResponse.data.accounts.filter(a => a.isActive)) {
      try {
        console.log(`   Posting to ${account.platform}...`);
        const postResponse = await axios.post(`${baseUrl}/api/posts`, {
          socialAccountId: account.id,
          content: testContent,
        }, {
          headers: {
            'x-user-id': 'default-user',
          },
        });
        console.log(`   ✅ ${account.platform} - Post created (Status: ${postResponse.data.post.status})`);
      } catch (error) {
        console.log(`   ❌ ${account.platform} - Failed: ${error.response?.data?.error || error.message}`);
      }
    }
    console.log('');

    // Test 3: Retrieve posts
    console.log('3. Retrieving all posts...');
    const postsResponse = await axios.get(`${baseUrl}/api/posts`, {
      headers: {
        'x-user-id': 'default-user',
      },
    });
    console.log(`✅ Found ${postsResponse.data.posts.length} total posts`);
    
    const statuses = postsResponse.data.posts.reduce((acc, post) => {
      acc[post.status] = (acc[post.status] || 0) + 1;
      return acc;
    }, {});
    console.log('   Post statuses:', statuses);
    console.log('');

    // Test 4: Create a scheduled post
    console.log('4. Creating a scheduled post...');
    const linkedInAccount = accountsResponse.data.accounts.find(a => a.platform === 'linkedin' && a.isActive);
    
    if (linkedInAccount) {
      const scheduledTime = new Date(Date.now() + 3600000); // 1 hour from now
      try {
        const scheduledPostResponse = await axios.post(`${baseUrl}/api/posts`, {
          socialAccountId: linkedInAccount.id,
          content: `📅 Scheduled post test from SocialFly

This post was scheduled for ${scheduledTime.toLocaleString()}

#Scheduled #SocialFlyAI`,
          scheduledFor: scheduledTime.toISOString(),
        }, {
          headers: {
            'x-user-id': 'default-user',
          },
        });
        console.log(`✅ Scheduled post created for ${scheduledTime.toLocaleString()}`);
      } catch (error) {
        console.log(`❌ Scheduling failed: ${error.response?.data?.error || error.message}`);
      }
    } else {
      console.log('⚠️  No LinkedIn account connected - skipping scheduled post test');
    }
    console.log('');

    console.log('='.repeat(60));
    console.log('🎉 END-TO-END TEST COMPLETE');
    console.log('='.repeat(60));
    console.log('\n📊 Platform Status:');
    console.log(`   Connected Accounts: ${accountsResponse.data.accounts.filter(a => a.isActive).length}`);
    console.log(`   Total Posts: ${postsResponse.data.posts.length}`);
    console.log(`   Published: ${statuses.published || 0}`);
    console.log(`   Scheduled: ${statuses.scheduled || 0}`);
    console.log(`   Failed: ${statuses.failed || 0}`);
    console.log('\n🌐 Access your dashboard: http://localhost:3000/dashboard');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testSocialFlyPlatform();
