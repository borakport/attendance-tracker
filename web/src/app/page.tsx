'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { APP_CONFIG, ROUTES } from '@/constants';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER);
    const authToken = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    
    if (userData && authToken) {
      const user = JSON.parse(userData);
      // Redirect based on role
      switch (user.role) {
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
    } else {
      router.push(ROUTES.LOGIN);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}
