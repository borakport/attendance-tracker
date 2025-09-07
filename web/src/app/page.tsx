'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Wait for AuthContext to finish initializing
        if (authLoading) {
          console.log('⏳ AuthContext still loading, waiting...');
          return;
        }

        console.log('🔍 HomePage - Auth state:', {
          isAuthenticated,
          hasUser: !!user,
          userRole: user?.role
        });

        if (!isAuthenticated || !user) {
          console.log('❌ Not authenticated, redirecting to login');
          router.push(ROUTES.LOGIN);
          return;
        }

        console.log('👤 User authenticated with role:', user.role);

        // Redirect based on role (handle both uppercase and lowercase)
        const userRole = user.role.toLowerCase();
        switch (userRole) {
          case 'admin':
            console.log('🔐 Redirecting to admin dashboard...');
            router.push(ROUTES.ADMIN_DASHBOARD);
            break;
          case 'instructor':
            console.log('👨‍🏫 Redirecting to instructor dashboard...');
            router.push(ROUTES.INSTRUCTOR_DASHBOARD);
            break;
          case 'student':
            console.log('👨‍🎓 Redirecting to student dashboard...');
            router.push(ROUTES.STUDENT_DASHBOARD);
            break;
          default:
            console.log('❓ Unknown role, redirecting to login...');
            router.push(ROUTES.LOGIN);
        }
      } catch (error) {
        console.error('❌ Redirect error:', error);
        setError('Failed to redirect. Please try again.');
      }
    };

    handleRedirect();
  }, [router, user, isAuthenticated, authLoading]);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirect Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push(ROUTES.LOGIN)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while auth is being determined
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">
          {authLoading ? 'Checking authentication...' : 'Redirecting...'}
        </p>
        <p className="text-gray-500 text-sm mt-2">This should only take a moment</p>
      </div>
    </div>
  );
}
