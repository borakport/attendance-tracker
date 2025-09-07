'use client';

import React from 'react';
import { useUsers, useCreateUser } from '@/hooks/useApi';
import { useToast } from '@/contexts/ToastContext';
import { useLoading } from '@/contexts/LoadingContext';

// Example component demonstrating the new infrastructure
export function UsersManagementExample() {
  const { addToast } = useToast();
  const { isLoading: globalLoading } = useLoading();
  
  // Using the data fetching hook
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useUsers({ page: 1, limit: 10 });

  // Using the mutation hook
  const {
    mutate: createUser,
    isLoading: creating,
    error: createError
  } = useCreateUser();

  const handleCreateUser = async () => {
    try {
      await createUser({
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: 'student'
      });
      
      // Refresh the users list after successful creation
      refetchUsers();
      
      addToast({
        type: 'success',
        title: 'Success!',
        message: 'User created successfully'
      });
    } catch (error) {
      // Error is automatically handled by the mutation hook
      console.error('Failed to create user:', error);
    }
  };

  const handleTestError = () => {
    addToast({
      type: 'error',
      title: 'Test Error',
      message: 'This is a test error message'
    });
  };

  const handleTestWarning = () => {
    addToast({
      type: 'warning',
      title: 'Test Warning', 
      message: 'This is a test warning message'
    });
  };

  const handleTestInfo = () => {
    addToast({
      type: 'info',
      title: 'Test Info',
      message: 'This is a test info message'
    });
  };

  if (usersLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Users</h3>
          <p className="text-red-600 mt-1">{usersError.message}</p>
          <button
            onClick={refetchUsers}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Frontend Infrastructure Demo</h1>
      
      {/* Global loading indicator */}
      {globalLoading && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800">Global loading is active...</p>
        </div>
      )}

      {/* Toast notification examples */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Toast Notifications</h2>
        <div className="space-x-2">
          <button
            onClick={handleTestInfo}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Show Info Toast
          </button>
          <button
            onClick={handleTestWarning}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Show Warning Toast
          </button>
          <button
            onClick={handleTestError}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Show Error Toast
          </button>
        </div>
      </div>

      {/* API hooks example */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">API Hooks Example</h2>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-2">Users Data</h3>
          {usersData ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Loaded {(usersData as any)?.data?.length || 0} users
              </p>
              <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(usersData, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500">No users data</p>
          )}
        </div>

        <div className="space-x-2">
          <button
            onClick={refetchUsers}
            disabled={usersLoading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {usersLoading ? 'Loading...' : 'Refresh Users'}
          </button>
          
          <button
            onClick={handleCreateUser}
            disabled={creating}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Test User'}
          </button>
        </div>

        {createError && (
          <div className="mt-4 text-red-600 text-sm">
            Create Error: {createError.message}
          </div>
        )}
      </div>

      {/* Form validation example */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Infrastructure Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800">✅ API Service</h3>
            <p className="text-sm text-green-600">Ready for backend integration</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800">✅ Context Providers</h3>
            <p className="text-sm text-green-600">Loading, Toast, Error handling active</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800">✅ TypeScript Types</h3>
            <p className="text-sm text-green-600">Full type safety implemented</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">🚀 Ready for Backend Integration</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• All API endpoints are configured and ready</li>
          <li>• TypeScript types match expected backend responses</li>
          <li>• Error handling and loading states are implemented</li>
          <li>• Form validation and user feedback systems are active</li>
          <li>• Mobile-responsive design patterns are in place</li>
        </ul>
      </div>
    </div>
  );
}

export default UsersManagementExample;
