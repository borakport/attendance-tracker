// Test login functionality
async function testLogin() {
  const loginData = {
    email: 'admin@smart-attendance.com', // Default admin email
    password: 'admin123' // Default admin password
  };

  try {
    console.log('🔐 Testing login with admin credentials...');
    console.log('📡 Making request to: http://localhost:3001/api/v1/auth/signin');
    
    const response = await fetch('http://localhost:3001/api/v1/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    console.log(`📊 Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('👤 User:', data.user);
      console.log('🔑 Token received:', !!data.tokens?.accessToken);
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.log('❌ Login failed:', errorData);
    }
  } catch (error) {
    console.error('🚨 Network error:', error.message);
  }
}

testLogin();
