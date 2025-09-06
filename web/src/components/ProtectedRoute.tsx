'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Permission } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: ('admin' | 'instructor' | 'student')[];
  requiredPermission?: Permission;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  requiredPermission 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Check role access
    if (requiredRole && !requiredRole.includes(user.role)) {
      // Redirect to their appropriate dashboard
      switch (user.role) {
        case 'admin':
          router.push('/dashboard');
          break;
        case 'instructor':
          router.push('/instructor-dashboard');
          break;
        case 'student':
          router.push('/student-dashboard');
          break;
        default:
          router.push('/login');
      }
      return;
    }

    // Check permission access
    if (requiredPermission && !user.permissions.includes(requiredPermission)) {
      // Redirect to unauthorized page or their dashboard
      switch (user.role) {
        case 'admin':
          router.push('/dashboard');
          break;
        case 'instructor':
          router.push('/instructor-dashboard');
          break;
        case 'student':
          router.push('/student-dashboard');
          break;
        default:
          router.push('/login');
      }
      return;
    }
  }, [user, isLoading, requiredRole, requiredPermission, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check role access
  if (requiredRole && !requiredRole.includes(user.role)) {
    return null;
  }

  // Check permission access
  if (requiredPermission && !user.permissions.includes(requiredPermission)) {
    return null;
  }

  return <>{children}</>;
}
