// Test the web frontend API integration
const testWebAPI = async () => {
  console.log('Testing Web Frontend API Integration...');
  
  try {
    // Test backend connectivity
    console.log('\n1. Testing backend health...');
    const authHealthResponse = await fetch('http://localhost:3001/health');
    const authHealth = await authHealthResponse.json();
    console.log('Auth Service:', authHealth);
    
    const attendanceHealthResponse = await fetch('http://localhost:3002/health');
    const attendanceHealth = await attendanceHealthResponse.json();
    console.log('Attendance Service:', attendanceHealth);
    
    // Test frontend API
    console.log('\n2. Testing frontend API...');
    const frontendResponse = await fetch('http://localhost:3000/api/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (frontendResponse.ok) {
      const frontendData = await frontendResponse.json();
      console.log('Frontend API:', frontendData);
    } else {
      console.log('Frontend API not available (expected for now)');
    }
    
    // Test admin login
    console.log('\n3. Testing admin login via API...');
    const loginResponse = await fetch('http://localhost:3001/api/v1/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@gps-attendance.com',
        password: 'SecurePassword123!'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login successful!');
      console.log('User:', loginData.data.user.firstName, loginData.data.user.lastName);
      console.log('Role:', loginData.data.user.role);
      console.log('Token received:', loginData.data.tokens.accessToken ? 'Yes' : 'No');
      
      // Test authenticated request
      console.log('\n4. Testing authenticated request...');
      const profileResponse = await fetch('http://localhost:3001/api/v1/auth/profile', {
        headers: {
          'Authorization': `Bearer ${loginData.data.tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('Profile retrieved:', profileData.data.email);
      } else {
        console.log('Profile request failed:', profileResponse.status);
      }
      
    } else {
      const errorData = await loginResponse.json();
      console.log('Login failed:', errorData.message);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
};

testWebAPI();
