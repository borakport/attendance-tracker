// Test login integration
const testLogin = async () => {
  console.log('Testing login integration...');
  
  try {
    const response = await fetch('http://localhost:3001/api/v1/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'system.admin@gpsattendance.edu',
        password: 'Admin@2025!Secure'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User:', data.data.user);
      console.log('Access Token:', data.data.tokens.accessToken ? 'Present' : 'Missing');
      console.log('Refresh Token:', data.data.tokens.refreshToken ? 'Present' : 'Missing');
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testLogin();
