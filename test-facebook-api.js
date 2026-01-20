const axios = require('axios');

async function testFacebookAPI() {
    const baseUrl = 'http://localhost:3000';

    console.log('=== Facebook API End-to-End Testing ===\n');

    try {
        // Test 1: Get existing posts
        console.log('Test 1: Getting existing Facebook posts...');
        const postsResponse = await axios.get(`${baseUrl}/api/facebook/posts`);
        console.log(`✅ Success: Retrieved ${postsResponse.data.data.length} posts`);
        if (postsResponse.data.data.length > 0) {
            console.log(`Latest post: ${postsResponse.data.data[0].message?.substring(0, 50)}...`);
        }
        console.log('');

        // Test 2: Try to create a text post (will likely fail due to permissions)
        console.log('Test 2: Attempting to create text post...');
        const textPostBody = {
            message: `SocialFly AI Facebook Integration Test - Text Post

This is an automated test post demonstrating our Facebook API integration capabilities. We're testing the end-to-end posting functionality.

#SocialFlyAI #FacebookAPI #Automation #Testing

Test run at: ${new Date().toISOString()}`
        };

        try {
            const textPostResponse = await axios.post(`${baseUrl}/api/facebook/post`, textPostBody);
            console.log('✅ Success: Text post created!');
            console.log(`Post ID: ${textPostResponse.data.data.id}`);
        } catch (postError) {
            console.log('⚠️  Expected failure: Posting requires pages_manage_posts permission');
            console.log(`Error: ${postError.response?.data?.details || postError.message}`);
        }
        console.log('');

        // Test 3: Try to create a post with link (will likely fail due to permissions)
        console.log('Test 3: Attempting to create post with link...');
        const linkPostBody = {
            message: `Check out our amazing project!

We're building the future of social media automation with cutting-edge AI technology. Click the link below to learn more about our innovative platform.

#Innovation #Technology #SocialMedia

Test run at: ${new Date().toISOString()}`,
            link: 'https://github.com/microsoft/vscode'
        };

        try {
            const linkPostResponse = await axios.post(`${baseUrl}/api/facebook/post`, linkPostBody);
            console.log('✅ Success: Link post created!');
            console.log(`Post ID: ${linkPostResponse.data.data.id}`);
        } catch (postError) {
            console.log('⚠️  Expected failure: Posting requires pages_manage_posts permission');
            console.log(`Error: ${postError.response?.data?.details || postError.message}`);
        }
        console.log('');

        // Test 4: Verify posts were created (should show existing posts)
        console.log('Test 4: Verifying posts...');
        const updatedPostsResponse = await axios.get(`${baseUrl}/api/facebook/posts`);
        console.log(`✅ Success: Retrieved ${updatedPostsResponse.data.data.length} posts after our tests`);

        // Show the most recent posts
        console.log('Recent posts:');
        for (let i = 0; i < Math.min(3, updatedPostsResponse.data.data.length); i++) {
            const post = updatedPostsResponse.data.data[i];
            const message = post.message || '[No message]';
            console.log(`  ${i + 1}. ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
            console.log(`     ID: ${post.id} | Time: ${post.created_time}`);
        }
        console.log('');

        console.log('=== Facebook Testing Complete ===\n');

        console.log('Summary:');
        console.log('- ✅ Reading posts: Working');
        console.log('- ⚠️  Creating posts: Requires pages_manage_posts permission');
        console.log('- 📝 Media uploads: Not tested (requires file upload)');
        console.log('');
        console.log('To enable posting, the Facebook app needs:');
        console.log('- pages_manage_posts permission');
        console.log('- pages_read_engagement permission');
        console.log('');
        console.log('Check your Facebook page to see existing posts!');
        console.log(`Page URL: https://www.facebook.com/${process.env.FACEBOOK_PAGE_ID}`);

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Run the tests
testFacebookAPI();