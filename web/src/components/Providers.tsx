'use client';

import { LoadingProvider } from '@/contexts/LoadingContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotificationProvider } from '@/components/Notifications';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <LoadingProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </LoadingProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}
