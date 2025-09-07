#!/usr/bin/env node

/**
 * Admin Endpoints Test Script
 * 
 * This script tests all admin endpoints to ensure they are properly configured
 * and accessible. Run this after starting the backend services.
 */

const https = require('https');
const http = require('http');

// Test configuration
const config = {
  authService: {
    host: 'localhost',
    port: 3001,
    baseUrl: '/api/auth'
  },
  attendanceService: {
    host: 'localhost',
    port: 3002,
    baseUrl: '/api/attendance'
  },
  // You'll need to get these from your actual login
  testCredentials: {
    adminEmail: 'admin@gps.edu',
    adminPassword: 'admin123',
    token: null, // Will be set after login
    serviceAuthKey: process.env.SERVICE_AUTH_KEY || 'your-128-char-service-auth-key-here'
  }
};

// HTTP request helper
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.port === 443 ? https : http;
    const req = protocol.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test cases
const tests = [
  // Auth Service Health Check
  {
    name: 'Auth Service Health Check',
    method: 'GET',
    service: 'authService',
    path: '/health',
    expectStatus: 200
  },
  
  // Attendance Service Health Check
  {
    name: 'Attendance Service Health Check',
    method: 'GET',
    service: 'attendanceService',
    path: '/health',
    expectStatus: 200
  },
  
  // Auth Service Admin Routes (require authentication)
  {
    name: 'Get All Users',
    method: 'GET',
    service: 'authService',
    path: '/admin/users?page=1&limit=5',
    requireAuth: true,
    expectStatus: 200
  },
  
  {
    name: 'Get User Statistics',
    method: 'GET',
    service: 'authService',
    path: '/admin/users/stats',
    requireAuth: true,
    expectStatus: 200
  },
  
  {
    name: 'Get Roles and Permissions',
    method: 'GET',
    service: 'authService',
    path: '/admin/roles',
    requireAuth: true,
    expectStatus: 200
  },
  
  // Attendance Service Admin Routes (require authentication)
  {
    name: 'Get Dashboard Statistics',
    method: 'GET',
    service: 'attendanceService',
    path: '/admin/stats',
    requireAuth: true,
    expectStatus: 200
  },
  
  {
    name: 'Get All Courses',
    method: 'GET',
    service: 'attendanceService',
    path: '/admin/courses?page=1&limit=5',
    requireAuth: true,
    expectStatus: 200
  },
  
  {
    name: 'Get All Sessions',
    method: 'GET',
    service: 'attendanceService',
    path: '/admin/sessions?page=1&limit=5',
    requireAuth: true,
    expectStatus: 200
  },
  
  {
    name: 'Get Attendance Records',
    method: 'GET',
    service: 'attendanceService',
    path: '/admin/attendance?page=1&limit=5',
    requireAuth: true,
    expectStatus: 200
  }
];

// Login function
async function login() {
  console.log('🔐 Attempting to login as admin...');
  
  const loginOptions = {
    hostname: config.authService.host,
    port: config.authService.port,
    path: `${config.authService.baseUrl}/login`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const loginData = {
    email: config.testCredentials.adminEmail,
    password: config.testCredentials.adminPassword
  };
  
  try {
    const response = await makeRequest(loginOptions, loginData);
    
    if (response.statusCode === 200 && response.data.success) {
      config.testCredentials.token = response.data.data.tokens.access.token;
      console.log('✅ Login successful!');
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message || 'Unknown error');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

// Run a single test
async function runTest(test) {
  const serviceConfig = config[test.service];
  
  const options = {
    hostname: serviceConfig.host,
    port: serviceConfig.port,
    path: `${serviceConfig.baseUrl}${test.path}`,
    method: test.method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  // Add authentication headers if required
  if (test.requireAuth && config.testCredentials.token) {
    options.headers['Authorization'] = `Bearer ${config.testCredentials.token}`;
    options.headers['X-Service-Auth'] = config.testCredentials.serviceAuthKey;
  }
  
  try {
    const response = await makeRequest(options, test.data);
    
    const passed = response.statusCode === test.expectStatus;
    const status = passed ? '✅' : '❌';
    
    console.log(`${status} ${test.name}`);
    console.log(`   URL: ${test.method} ${serviceConfig.host}:${serviceConfig.port}${serviceConfig.baseUrl}${test.path}`);
    console.log(`   Status: ${response.statusCode} (expected ${test.expectStatus})`);
    
    if (!passed) {
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    } else if (response.data && response.data.data) {
      // Show some sample data for successful responses
      if (Array.isArray(response.data.data)) {
        console.log(`   Data: Array with ${response.data.data.length} items`);
      } else if (typeof response.data.data === 'object') {
        const keys = Object.keys(response.data.data);
        console.log(`   Data: Object with keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
      }
    }
    
    console.log('');
    return passed;
  } catch (error) {
    console.log(`❌ ${test.name}`);
    console.log(`   Error: ${error.message}`);
    console.log('');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Admin Endpoints Test Suite');
  console.log('=====================================');
  console.log('');
  
  // Check if services are running
  console.log('📡 Checking service connectivity...');
  
  const healthTests = tests.filter(t => t.path === '/health');
  let servicesRunning = 0;
  
  for (const test of healthTests) {
    const passed = await runTest(test);
    if (passed) servicesRunning++;
  }
  
  if (servicesRunning < healthTests.length) {
    console.log('❌ Some services are not running. Please start the backend services first.');
    console.log('   Run: npm run dev in the backend directory');
    process.exit(1);
  }
  
  console.log('✅ All services are running!');
  console.log('');
  
  // Attempt login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without admin authentication.');
    console.log('   Please ensure you have an admin user with the credentials in the script.');
    console.log('   Or run the database seeding script first.');
    process.exit(1);
  }
  
  console.log('');
  console.log('🧪 Running admin endpoint tests...');
  console.log('');
  
  // Run authenticated tests
  const authTests = tests.filter(t => t.requireAuth);
  let passedTests = 0;
  
  for (const test of authTests) {
    const passed = await runTest(test);
    if (passed) passedTests++;
  }
  
  // Summary
  console.log('📊 Test Summary');
  console.log('===============');
  console.log(`Total tests: ${authTests.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${authTests.length - passedTests}`);
  console.log(`Success rate: ${((passedTests / authTests.length) * 100).toFixed(1)}%`);
  
  if (passedTests === authTests.length) {
    console.log('');
    console.log('🎉 All admin endpoints are working correctly!');
    console.log('You can now use these endpoints in your web application.');
  } else {
    console.log('');
    console.log('⚠️  Some tests failed. Please check the service configurations and ensure:');
    console.log('   1. All services are running');
    console.log('   2. Database is properly seeded');
    console.log('   3. Environment variables are set correctly');
    console.log('   4. Service authentication keys match');
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Admin Endpoints Test Script');
  console.log('');
  console.log('Usage: node test-admin-endpoints.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --auth-only    Test only auth service endpoints');
  console.log('  --attendance-only Test only attendance service endpoints');
  console.log('');
  console.log('Environment Variables:');
  console.log('  SERVICE_AUTH_KEY    Service authentication key');
  console.log('');
  console.log('Before running:');
  console.log('  1. Start backend services: npm run dev');
  console.log('  2. Ensure database is seeded with admin user');
  console.log('  3. Update admin credentials in this script if needed');
  process.exit(0);
}

// Filter tests based on command line arguments
if (process.argv.includes('--auth-only')) {
  tests = tests.filter(t => t.service === 'authService');
}

if (process.argv.includes('--attendance-only')) {
  tests = tests.filter(t => t.service === 'attendanceService');
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test runner crashed:', error);
  process.exit(1);
});
