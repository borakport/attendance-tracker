// Test script to verify admin API endpoints
const AUTH_SERVICE_URL = 'http://localhost:3001';
const ATTENDANCE_SERVICE_URL = 'http://localhost:3002';

async function testEndpoint(url, description) {
  try {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`📡 URL: ${url}`);
    
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📝 Content-Type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`📦 Response:`, JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log(`📄 Response: ${text.substring(0, 200)}...`);
    }
    
  } catch (error) {
    console.error(`❌ Error testing ${description}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Testing Admin API Endpoints...\n');
  
  // Test service health
  await testEndpoint(`${AUTH_SERVICE_URL}/health`, 'Auth Service Health');
  await testEndpoint(`${ATTENDANCE_SERVICE_URL}/health`, 'Attendance Service Health');
  
  // Test admin endpoints (these will fail without auth, but we can see if they exist)
  await testEndpoint(`${AUTH_SERVICE_URL}/auth/admin/users/stats`, 'Admin User Stats');
  await testEndpoint(`${ATTENDANCE_SERVICE_URL}/admin/dashboard/stats`, 'Admin Dashboard Stats');
  
  console.log('\n✅ Test completed!');
}

main().catch(console.error);
