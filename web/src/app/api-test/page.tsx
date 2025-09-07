'use client';

import { useState, useEffect } from 'react';
import { apiClient, authAPI, courseAPI } from '@/services/api';

export default function APITestPage() {
  const [authStatus, setAuthStatus] = useState('Not tested');
  const [courseStatus, setCourseStatus] = useState('Not tested');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAuthentication = async () => {
    try {
      setAuthStatus('Testing...');
      addResult('Testing authentication...');
      
      // Test login with demo credentials
      const response = await authAPI.login({
        email: 'admin@test.com',
        password: 'password123'
      });
      
      addResult(`Login successful: ${response.user.name} (${response.user.role})`);
      setAuthStatus('✅ Success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addResult(`Login failed: ${message}`);
      setAuthStatus('❌ Failed');
    }
  };

  const testCourses = async () => {
    try {
      setCourseStatus('Testing...');
      addResult('Testing course API...');
      
      const courses = await courseAPI.getAll();
      addResult(`Courses fetched: ${courses.length} courses found`);
      setCourseStatus('✅ Success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addResult(`Course fetch failed: ${message}`);
      setCourseStatus('❌ Failed');
    }
  };

  const testProfile = async () => {
    try {
      addResult('Testing profile API...');
      const profile = await authAPI.getProfile();
      addResult(`Profile fetched: ${profile.name} (${profile.email})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addResult(`Profile fetch failed: ${message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setAuthStatus('Not tested');
    setCourseStatus('Not tested');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Integration Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            <div className="space-y-4">
              <div>
                <button
                  onClick={testAuthentication}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Test Authentication
                </button>
                <p className="text-sm text-gray-600 mt-1">Status: {authStatus}</p>
              </div>
              
              <div>
                <button
                  onClick={testCourses}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  Test Courses API
                </button>
                <p className="text-sm text-gray-600 mt-1">Status: {courseStatus}</p>
              </div>
              
              <div>
                <button
                  onClick={testProfile}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                >
                  Test Profile API
                </button>
              </div>
              
              <div>
                <button
                  onClick={clearResults}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                >
                  Clear Results
                </button>
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Base URL:</span>
                <span className="ml-2 text-gray-600">http://localhost:3001</span>
              </div>
              <div>
                <span className="font-medium">Auth Service:</span>
                <span className="ml-2 text-gray-600">/api/v1/auth</span>
              </div>
              <div>
                <span className="font-medium">Attendance Service:</span>
                <span className="ml-2 text-gray-600">/api/v1</span>
              </div>
              <div>
                <span className="font-medium">Token Storage:</span>
                <span className="ml-2 text-gray-600">localStorage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          <div className="bg-gray-100 rounded-lg p-4 h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 italic">No tests run yet. Click the test buttons above.</p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a 
            href="/login"
            className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
          >
            Go to Login Page
          </a>
        </div>
      </div>
    </div>
  );
}
