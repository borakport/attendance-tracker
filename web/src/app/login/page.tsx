'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { DEMO_USERS, ROUTES, APP_CONFIG } from '@/constants';
import { validateForm, validationSchemas } from '@/utils/validation';
import { AccessibleInput, AccessibleButton } from '@/components/ui/Accessibility';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDemoUser, setSelectedDemoUser] = useState('');
  
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDemoUserSelect = (userId: string) => {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        password: user.password
      }));
      setSelectedDemoUser(userId);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

      // Mock authentication - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email (simulating database lookup)
      const authenticatedUser = DEMO_USERS.find(
        user => user.email === formData.email && user.password === formData.password
      );

      if (!authenticatedUser) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      // Store user data in localStorage (replace with proper auth management)
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, JSON.stringify({
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
        permissions: authenticatedUser.permissions
      }));
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, 'mock-jwt-token');

      // Redirect based on role from database
      switch (authenticatedUser.role) {
        case 'admin':
          router.push(ROUTES.ADMIN_DASHBOARD);
          break;
        case 'instructor':
          router.push(ROUTES.INSTRUCTOR_DASHBOARD);
          break;
        case 'student':
          router.push(ROUTES.STUDENT_DASHBOARD);
          break;
        default:
          router.push(ROUTES.LOGIN);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    } finally {
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

        {/* Demo User Selection (Development Only) */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">🚧 Development Mode</h3>
          <p className="text-xs text-yellow-700 mb-3">Quick login with demo users (will be removed in production)</p>
          <div className="relative">
            <select
              value={selectedDemoUser}
              onChange={(e) => handleDemoUserSelect(e.target.value)}
              className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">Select a demo user...</option>
              {DEMO_USERS.map((user) => (
                <option key={user.id} value={user.id}>
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
