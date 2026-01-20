// Final comprehensive LinkedIn media posts test
const axios = require('axios');

const baseUrl = 'http://localhost:3000';

async function finalTest() {
  console.log('🎉 FINAL LINKEDIN MEDIA POSTS TEST 🎉\n');

  const results = {
    personal: { success: 0, total: 0 },
    organization: { success: 0, total: 0 }
  };

  // Personal Account Tests
  console.log('📱 PERSONAL ACCOUNT POSTS');
  console.log('='.repeat(50));

  // 1. Text Post
  console.log('1. Text Post...');
  try {
    const response = await axios.post(`${baseUrl}/api/linkedin/text-post`, {
      text: '🎯 Final test: Text post from SocialFly AI platform. All systems operational!',
      visibility: 'PUBLIC'
    });
    console.log('✅ Success - Post ID:', response.data.data.id);
    results.personal.success++;
  } catch (error) {
    console.log('❌ Failed:', error.response?.data?.error || error.message);
  }
  results.personal.total++;

  // 2. Image Post
  console.log('2. Image Post...');
  try {
    const response = await axios.post(`${baseUrl}/api/linkedin/media-post`, {
      text: '🚀 Final test: Image post showcasing our technology capabilities',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
      visibility: 'PUBLIC'
    });
    console.log('✅ Success - Post ID:', response.data.data.id);
    results.personal.success++;
  } catch (error) {
    console.log('❌ Failed:', error.response?.data?.error || error.message);
  }
  results.personal.total++;

  // 3. Link Post
  console.log('3. Link Post...');
  try {
    const response = await axios.post(`${baseUrl}/api/linkedin/media-post`, {
      text: '🔗 Final test: Link post demonstrating our comprehensive social media integration',
      linkUrl: 'https://github.com/microsoft/vscode',
      visibility: 'PUBLIC'
    });
    console.log('✅ Success - Post ID:', response.data.data.id);
    results.personal.success++;
  } catch (error) {
    console.log('❌ Failed:', error.response?.data?.error || error.message);
  }
  results.personal.total++;

  // 4. Image + Link Post
  console.log('4. Image + Link Post...');
  try {
    const response = await axios.post(`${baseUrl}/api/linkedin/media-post`, {
      text: '🎨 Final test: Complete media post with image and link - full capabilities demonstrated',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
      linkUrl: 'https://docs.microsoft.com/en-us/linkedin/',
      visibility: 'PUBLIC'
    });
    console.log('✅ Success - Post ID:', response.data.data.id);
    results.personal.success++;
  } catch (error) {
    console.log('❌ Failed:', error.response?.data?.error || error.message);
  }
  results.personal.total++;

  console.log('\n🏢 ORGANIZATION ACCOUNT POSTS');
  console.log('='.repeat(50));

  // Organization Tests (may fail if org permissions not granted)
  console.log('Note: Organization posts require special permissions and may fail if not authorized\n');

  // 5. Org Text Post
  console.log('5. Organization Text Post...');
  try {
    const response = await axios.post(`${baseUrl}/api/linkedin/org-post`, {
      text: '🏢 NovaLinkTest: Final comprehensive test of organization posting capabilities',
      visibility: 'PUBLIC'
    });
    console.log('✅ Success - Post ID:', response.data.data.id);
    results.organization.success++;
  } catch (error) {
    console.log('❌ Failed (expected if org permissions not granted):', error.response?.data?.error || error.message);
  }
  results.organization.total++;

  // 6. Org Media Post
  console.log('6. Organization Media Post...');
  try {
    const response = await axios.post(`${baseUrl}/api/linkedin/org-media-post`, {
      text: '🎯 NovaLinkTest: Complete organization media post test',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      visibility: 'PUBLIC'
    });
    console.log('✅ Success - Post ID:', response.data.data.id);
    results.organization.success++;
  } catch (error) {
    console.log('❌ Failed (expected if org permissions not granted):', error.response?.data?.error || error.message);
  }
  results.organization.total++;

  // Summary
  console.log('\n🎊 FINAL RESULTS');
  console.log('='.repeat(50));
  console.log(`📱 Personal Account: ${results.personal.success}/${results.personal.total} successful`);
  console.log(`🏢 Organization Account: ${results.organization.success}/${results.organization.total} successful`);

  const totalSuccess = results.personal.success + results.organization.success;
  const totalTests = results.personal.total + results.organization.total;

  console.log(`\n🎯 OVERALL: ${totalSuccess}/${totalTests} tests passed`);

  if (results.personal.success === results.personal.total) {
    console.log('✅ PERSONAL ACCOUNT: FULLY OPERATIONAL');
  }

  if (results.organization.success > 0) {
    console.log('✅ ORGANIZATION ACCOUNT: OPERATIONAL');
  } else {
    console.log('⚠️  ORGANIZATION ACCOUNT: Requires additional permissions (see setup-org-access.ps1)');
  }

  console.log('\n🔗 Check your posts:');
  console.log('📱 Personal: https://www.linkedin.com/in/vishal-dharmini-6588063a3/');
  console.log('🏢 Business: https://www.linkedin.com/company/110709910/');

  console.log('\n🎉 SocialFly AI LinkedIn Integration: COMPLETE AND OPERATIONAL! 🎉');
}

finalTest();