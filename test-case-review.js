// Simple test script to verify case review API endpoints
const BASE_URL = 'http://localhost:3000';

async function testCaseReviewAPI() {
  console.log('Testing Case Review API endpoints...\n');

  try {
    // Test 1: Get cases (should return empty array initially)
    console.log('1. Testing GET /api/cases...');
    const casesResponse = await fetch(`${BASE_URL}/api/cases`);
    console.log(`   Status: ${casesResponse.status}`);

    if (casesResponse.ok) {
      const casesData = await casesResponse.json();
      console.log(`   Response: ${JSON.stringify(casesData, null, 2)}`);
    } else {
      console.log(`   Error: ${await casesResponse.text()}`);
    }

    // Test 2: Get favorites (should return empty array initially)
    console.log('\n2. Testing GET /api/favorites...');
    const favoritesResponse = await fetch(`${BASE_URL}/api/favorites`);
    console.log(`   Status: ${favoritesResponse.status}`);

    if (favoritesResponse.ok) {
      const favoritesData = await favoritesResponse.json();
      console.log(`   Response: ${JSON.stringify(favoritesData, null, 2)}`);
    } else {
      console.log(`   Error: ${await favoritesResponse.text()}`);
    }

    console.log('\n✅ API endpoint tests completed!');
    console.log(
      'Note: Some endpoints require authentication, so 401 errors are expected.'
    );
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCaseReviewAPI();
