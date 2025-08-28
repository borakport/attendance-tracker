/**
 * Test script to verify service-to-service connection
 * Run this to debug connection issues
 */

require('dotenv').config();
const crypto = require('crypto');

console.log('🧪 Testing Realtime Service Connection\n');
console.log('Environment Variables Check:');
console.log('---------------------------');
console.log('SERVICE_AUTH_KEY:', process.env.SERVICE_AUTH_KEY ? '✅ Configured' : '❌ Missing');
console.log('SERVICE_NAME:', process.env.SERVICE_NAME || 'Not set (will use default)');
console.log('REALTIME_SERVICE_URL:', process.env.REALTIME_SERVICE_URL || 'Not set (will use default)');
console.log('');

// Test token generation
function generateServiceToken(serviceName, apiKey) {
  const timestamp = Date.now();
  const data = `${serviceName}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', apiKey)
    .update(data)
    .digest('hex');
  
  return Buffer.from(JSON.stringify({
    service: serviceName,
    timestamp,
    signature
  })).toString('base64');
}

if (process.env.SERVICE_AUTH_KEY) {
  const testToken = generateServiceToken('attendance-service', process.env.SERVICE_AUTH_KEY);
  console.log('Test Token Generated:');
  console.log('--------------------');
  console.log('Token (first 50 chars):', testToken.substring(0, 50) + '...');
  console.log('Token length:', testToken.length);
  console.log('');
  
  // Try to connect
  console.log('Attempting Connection:');
  console.log('---------------------');
  const io = require('socket.io-client');
  
  const socket = io('http://localhost:3003/service', {
    auth: {
      serviceToken: testToken
    },
    transports: ['websocket', 'polling']
  });
  
  socket.on('connect', () => {
    console.log('✅ Successfully connected!');
    console.log('Socket ID:', socket.id);
    
    // Test emitting an event
    socket.emit('test:ping', { message: 'Hello from test script' });
    
    setTimeout(() => {
      socket.disconnect();
      process.exit(0);
    }, 2000);
  });
  
  socket.on('connect_error', (error) => {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  });
  
  setTimeout(() => {
    console.error('⏱️ Connection timeout - no response from server');
    process.exit(1);
  }, 10000);
} else {
  console.error('❌ Cannot test - SERVICE_AUTH_KEY not configured');
  process.exit(1);
}
