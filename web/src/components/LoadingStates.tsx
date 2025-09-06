'use client';

import React from 'react';
import { Loader2, Wifi, WifiOff, AlertCircle } from 'lucide-react';

export interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'table' | 'form' | 'custom';
  count?: number;
  height?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  count = 1,
  height = 20,
  className = ''
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-white rounded border">
                <div className="animate-pulse flex items-center space-x-3 w-full">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'table':
        return (
          <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
            <div className="animate-pulse">
              {/* Header */}
              <div className="border-b p-4">
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              {/* Rows */}
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="border-b p-4">
                  <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="h-3 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'form':
        return (
          <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
            <div className="animate-pulse space-y-6">
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
              <div className="flex space-x-3 pt-4">
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={`animate-pulse ${className}`}>
            <div 
              className="bg-gray-200 rounded" 
              style={{ height: `${height}px` }}
            ></div>
          </div>
        );
    }
  };

  return <>{renderSkeleton()}</>;
};

export interface AdvancedLoadingProps {
  isLoading: boolean;
  error?: string | null;
  isEmpty?: boolean;
  loadingText?: string;
  emptyText?: string;
  emptySubText?: string;
  retryFunction?: () => void;
  children: React.ReactNode;
  skeleton?: LoadingSkeletonProps;
  showProgress?: boolean;
  progress?: number;
}

export const AdvancedLoading: React.FC<AdvancedLoadingProps> = ({
  isLoading,
  error,
  isEmpty = false,
  loadingText = 'Loading...',
  emptyText = 'No data available',
  emptySubText = 'There is nothing to display at the moment.',
  retryFunction,
  children,
  skeleton,
  showProgress = false,
  progress = 0
}) => {
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 text-center mb-4 max-w-md">{error}</p>
        {retryFunction && (
          <button
            onClick={retryFunction}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    if (skeleton) {
      return <LoadingSkeleton {...skeleton} />;
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="relative mb-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          {showProgress && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
        <p className="text-gray-600 text-center">{loadingText}</p>
        {showProgress && (
          <div className="w-64 bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyText}</h3>
        <p className="text-gray-600 text-center max-w-md">{emptySubText}</p>
      </div>
    );
  }

  // Success state
  return <>{children}</>;
};

// Network status indicator
export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 z-50">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">No internet connection</span>
      </div>
    </div>
  );
};

// Progress bar component
export interface ProgressBarProps {
  progress: number;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  variant = 'default',
  size = 'md',
  showPercentage = true
}) => {
  const getColorClasses = () => {
    switch (variant) {
      case 'success': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'error': return 'bg-red-600';
      default: return 'bg-blue-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-1';
      case 'lg': return 'h-4';
      default: return 'h-2';
    }
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${getSizeClasses()}`}>
        <div 
          className={`${getColorClasses()} ${getSizeClasses()} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
};
