'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const startLoading = useCallback((message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const updateLoadingMessage = useCallback((message: string) => {
    setLoadingMessage(message);
  }, []);

  const value = {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    setLoadingMessage: updateLoadingMessage
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <GlobalLoadingOverlay message={loadingMessage} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Global loading overlay component
function GlobalLoadingOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-xl">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-gray-900 font-medium">{message}</span>
      </div>
    </div>
  );
}

// Hook for managing async operations with loading states
export function useAsyncOperation<T = any>() {
  const { startLoading, stopLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (
    operation: () => Promise<T>,
    loadingMessage = 'Processing...'
  ) => {
    try {
      setError(null);
      startLoading(loadingMessage);
      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    execute,
    data,
    error,
    clearError: () => setError(null)
  };
}
