'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { APP_CONFIG } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';

// Demo credentials for testing (from seeded database)
const DEMO_CREDENTIALS = [
  {
    name: 'System Administrator',
    email: 'system.admin@gpsattendance.edu',
    password: 'Admin@2025!Secure',
    role: 'admin'
  },
  {
    name: 'Dr. Emily Chen',
    email: 'emily.chen@university.edu',
    password: 'SecurePassword123!',
    role: 'instructor'
  },
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@student.edu',
    password: 'SecurePassword123!',
    role: 'student'
  }
];

export default function LoginPage() {
  console.log('🔄 LoginPage component rendering/mounting');
  
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTestUser, setSelectedTestUser] = useState('');
  
  const router = useRouter();

  // Debug: Log component mount
  useEffect(() => {
    console.log('🎯 LoginPage component mounted');
    return () => {
      console.log('🗑️ LoginPage component unmounting');
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTestUserSelect = (userId: string) => {
    const user = DEMO_CREDENTIALS.find(u => u.email === userId);
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        password: user.password
      }));
      setSelectedTestUser(userId);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    console.log('🔥 handleLogin called - START');
    e.preventDefault();
    
    // Prevent double submission
    if (loading) {
      console.log('⚠️ Login already in progress, ignoring duplicate call');
      return;
    }
    
    setLoading(true);
    setError('');

    // Clear any existing tokens to ensure fresh login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('smart-attendance-user');
      localStorage.removeItem('smart-attendance-token');
    }

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (!formData.email.includes('@')) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      console.log('🚀 About to call login API...');
      // Use real API authentication
      await login(formData.email, formData.password);
      console.log('✅ Login API call completed');
      
      // Redirect will be handled by the home page based on user role
      router.push('/');
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      console.log('🏁 handleLogin END - setting loading to false');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{APP_CONFIG.NAME}</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Test User Selection (Development Only) */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">🧪 Test Mode</h3>
          <p className="text-xs text-yellow-700 mb-3">Quick login with test users from your backend database</p>
          <div className="relative">
            <select
              value={selectedTestUser}
              onChange={(e) => handleTestUserSelect(e.target.value)}
              className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">Select a test user...</option>
              {DEMO_CREDENTIALS.map((user) => (
                <option key={user.email} value={user.email}>
                  {user.name} ({user.role}) - {user.email}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-waiting transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2025 Smart Attendance System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
