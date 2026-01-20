const axios = require('axios');

async function testDiscordIntegration() {
    const baseUrl = 'http://localhost:3000';
    const userId = 'default-user';

    console.log('=== Discord Integration End-to-End Test ===\n');
    console.log('📋 Prerequisites:');
    console.log('1. Discord bot token configured in .env.local');
    console.log('2. Bot added to your Discord server');
    console.log('3. Bot has permission to send messages');
    console.log('4. You have a channel ID (right-click channel → Copy Channel ID)');
    console.log('');

    // Prompt for channel ID (since we can't hardcode it)
    const channelId = process.argv[2];
    
    if (!channelId) {
        console.error('❌ Error: Please provide a Discord channel ID as an argument');
        console.error('');
        console.error('Usage: node test-discord-integration.js <CHANNEL_ID>');
        console.error('Example: node test-discord-integration.js 1234567890123456789');
        console.error('');
        console.error('To get your channel ID:');
        console.error('1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)');
        console.error('2. Right-click on a channel');
        console.error('3. Click "Copy Channel ID"');
        process.exit(1);
    }

    try {
        // Step 1: Connect Discord account
        console.log('Step 1: Connecting Discord account...');
        const connectResponse = await axios.post(`${baseUrl}/api/discord/connect`, {
            channelId,
            channelName: 'Test Channel',
            guildName: 'My Server',
        }, {
            headers: {
                'x-user-id': userId,
            },
        });

        console.log('✅ Discord connected successfully!');
        console.log(`Account ID: ${connectResponse.data.account.id}`);
        console.log(`Channel: ${connectResponse.data.account.accountName}`);
        console.log('');

        const socialAccountId = connectResponse.data.account.id;

        // Step 2: Post a test message
        console.log('Step 2: Posting test message to Discord...');
        const postResponse = await axios.post(`${baseUrl}/api/discord/post`, {
            socialAccountId,
            content: `🚀 SocialFly AI - End-to-End Test Success!

This is an automated test post from the SocialFly AI platform demonstrating:

✅ PostgreSQL Database Integration
✅ Prisma ORM for Data Management
✅ Discord API Integration
✅ Token Storage & Retrieval
✅ Automated Posting Workflow

Platform: SocialFly AI
Test Time: ${new Date().toLocaleString()}
Status: Production Ready 🎉

#SocialFlyAI #Discord #Automation #TestPost`,
        }, {
            headers: {
                'x-user-id': userId,
            },
        });

        console.log('✅ Message posted successfully!');
        console.log(`Post ID: ${postResponse.data.post.id}`);
        console.log(`Discord Message ID: ${postResponse.data.discordMessage.id}`);
        console.log(`Status: ${postResponse.data.post.status}`);
        console.log(`Published At: ${postResponse.data.post.publishedAt}`);
        console.log('');

        // Step 3: Verify post was saved to database
        console.log('Step 3: Verifying post in database...');
        const postsResponse = await axios.get(`${baseUrl}/api/posts`, {
            headers: {
                'x-user-id': userId,
            },
        });

        console.log(`✅ Found ${postsResponse.data.posts.length} post(s) in database`);
        if (postsResponse.data.posts.length > 0) {
            const latestPost = postsResponse.data.posts[0];
            console.log(`Latest post preview: "${latestPost.content.substring(0, 60)}..."`);
            console.log(`Platform: ${latestPost.socialAccount.platform}`);
            console.log(`Channel: ${latestPost.socialAccount.accountName}`);
        }
        console.log('');

        // Step 4: Get all social accounts
        console.log('Step 4: Listing all connected social accounts...');
        const accountsResponse = await axios.get(`${baseUrl}/api/social-accounts`, {
            headers: {
                'x-user-id': userId,
            },
        });

        console.log(`✅ Found ${accountsResponse.data.accounts.length} connected account(s)`);
        accountsResponse.data.accounts.forEach((account, index) => {
            console.log(`  ${index + 1}. ${account.platform}: ${account.accountName || 'Unnamed'} (${account.isActive ? 'Active' : 'Inactive'})`);
        });
        console.log('');

        console.log('====================================');
        console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');
        console.log('====================================');
        console.log('');
        console.log('✅ System Status:');
        console.log('  • PostgreSQL Database: Connected');
        console.log('  • Prisma ORM: Operational');
        console.log('  • Discord API: Integrated');
        console.log('  • Token Management: Functional');
        console.log('  • Posting System: Working');
        console.log('');
        console.log('💬 Check your Discord channel to see the posted message!');
        console.log('🌐 Visit http://localhost:3000/dashboard to see the web interface');
        console.log('');
        console.log('Next Steps:');
        console.log('1. Connect more social accounts (LinkedIn, Facebook, etc.)');
        console.log('2. Use the dashboard to create and schedule posts');
        console.log('3. Test posting to multiple platforms simultaneously');

    } catch (error) {
        console.error('');
        console.error('❌ TEST FAILED');
        console.error('================');
        console.error('');
        
        if (error.response?.data) {
            console.error('Error Details:', error.response.data.error || error.response.data);
            
            if (error.response.data.error?.includes('Cannot access Discord channel')) {
                console.error('');
                console.error('💡 Troubleshooting:');
                console.error('1. Make sure your bot is added to the Discord server');
                console.error('2. Verify the bot has "Send Messages" permission in the channel');
                console.error('3. Check that the channel ID is correct');
                console.error('4. Ensure Developer Mode is enabled in Discord settings');
            }
        } else {
            console.error('Error:', error.message);
        }
        
        console.error('');
        process.exit(1);
    }
}

// Run the tests
testDiscordIntegration();
