'use client';

import { LoadingProvider } from '@/contexts/LoadingContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotificationProvider } from '@/components/Notifications';
import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <LoadingProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </LoadingProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
