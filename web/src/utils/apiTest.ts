import { apiClient, authAPI } from '@/services/api';

export const testAPIConnection = async () => {
  console.log('🔌 Testing API Connection...');
  
  try {
    // Test 1: Check if backend is reachable
    console.log('📡 Testing backend connectivity...');
    const response = await fetch('http://localhost:3001/health', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      console.log('✅ Backend is reachable');
    } else {
      console.warn('⚠️ Backend health check failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return { success: false, error: 'Backend not reachable' };
  }

  try {
    // Test 2: Test auth endpoint (expect 401 or validation error)
    console.log('🔐 Testing auth endpoint...');
    await authAPI.login({ email: 'test@example.com', password: 'test' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('400')) {
        console.log('✅ Auth endpoint responding (expected auth failure)');
      } else {
        console.warn('⚠️ Unexpected auth error:', error.message);
      }
    }
  }

  return { success: true, message: 'API integration ready' };
};

// Console helper for testing
if (typeof window !== 'undefined') {
  (window as any).testAPI = testAPIConnection;
  console.log('🛠️ API test available: Run testAPI() in console');
}
