const redis = require('redis');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testRedisConnection() {
  const client = redis.createClient({
    url: process.env.REDIS_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to Redis successfully!');
    
    await client.set('test_key', 'test_value');
    const value = await client.get('test_key');
    console.log('📝 Redis test value:', value);
    
    await client.disconnect();
    console.log('✅ Redis connection closed successfully');
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    process.exit(1);
  }
}

testRedisConnection();
