import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { useLoading } from '@/contexts/LoadingContext';
import { useToast } from '@/contexts/ToastContext';

// Generic API hook for any API call
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    autoLoad?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { startLoading, stopLoading } = useLoading();
  const { addToast } = useToast();

  const {
    autoLoad = true,
    onSuccess,
    onError,
    showToast = true
  } = options;

  const execute = async () => {
    try {
      setIsLoading(true);
      startLoading();
      setError(null);

      const result = await apiCall();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      
      if (onError) {
        onError(error);
      }

      if (showToast) {
        addToast({
          type: 'error',
          title: 'Error',
          message: error.message
        });
      }

      throw error;
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  };

  useEffect(() => {
    if (autoLoad) {
      execute();
    }
  }, dependencies);

  return {
    data,
    error,
    isLoading,
    execute,
    refetch: execute
  };
}

// Authentication hooks
export function useLogin() {
  const { addToast } = useToast();
  
  return useApi(
    () => Promise.resolve(null), // Placeholder
    [],
    { 
      autoLoad: false,
      onSuccess: () => {
        addToast({
          type: 'success',
          title: 'Welcome!',
          message: 'Successfully logged in'
        });
      }
    }
  );
}

export function useLogout() {
  const { addToast } = useToast();
  
  return useApi(
    () => apiService.logout(),
    [],
    { 
      autoLoad: false,
      onSuccess: () => {
        addToast({
          type: 'success',
          title: 'Goodbye!',
          message: 'Successfully logged out'
        });
      }
    }
  );
}

// User hooks
export function useUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  return useApi(
    () => apiService.getUsers(params),
    [params?.page, params?.limit, params?.search, params?.role]
  );
}

export function useUserProfile() {
  return useApi(
    () => apiService.getUserProfile(),
    []
  );
}

// Course hooks
export function useCourses(params?: {
  page?: number;
  limit?: number;
  search?: string;
  instructorId?: string;
}) {
  return useApi(
    () => apiService.getCourses(params),
    [params?.page, params?.limit, params?.search, params?.instructorId]
  );
}

export function useCourseMembers(courseId: string) {
  return useApi(
    () => apiService.getCourseMembers(courseId),
    [courseId],
    { autoLoad: !!courseId }
  );
}

// Attendance hooks
export function useAttendance(params?: {
  page?: number;
  limit?: number;
  courseId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useApi(
    () => apiService.getAttendance(params),
    [
      params?.page,
      params?.limit,
      params?.courseId,
      params?.studentId,
      params?.startDate,
      params?.endDate
    ]
  );
}

export function useAttendanceReports(params: {
  courseId?: string;
  startDate: string;
  endDate: string;
}) {
  return useApi(
    () => apiService.getAttendanceReports(params),
    [params.courseId, params.startDate, params.endDate],
    { autoLoad: !!(params.startDate && params.endDate) }
  );
}

export function useAttendanceStats(params?: {
  courseId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useApi(
    () => apiService.getAttendanceStats(params),
    [params?.courseId, params?.userId, params?.startDate, params?.endDate]
  );
}

// Mutation hooks (for create, update, delete operations)
export function useMutation<T, P>(
  mutationFn: (params: P) => Promise<T>,
  options: {
    onSuccess?: (data: T, params: P) => void;
    onError?: (error: Error, params: P) => void;
    showToast?: boolean;
    successMessage?: string;
  } = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { startLoading, stopLoading } = useLoading();
  const { addToast } = useToast();

  const {
    onSuccess,
    onError,
    showToast = true,
    successMessage
  } = options;

  const mutate = async (params: P): Promise<T> => {
    try {
      setIsLoading(true);
      startLoading();
      setError(null);

      const result = await mutationFn(params);
      
      if (onSuccess) {
        onSuccess(result, params);
      }

      if (showToast && successMessage) {
        addToast({
          type: 'success',
          title: 'Success',
          message: successMessage
        });
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      
      if (onError) {
        onError(error, params);
      }

      if (showToast) {
        addToast({
          type: 'error',
          title: 'Error',
          message: error.message
        });
      }

      throw error;
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  };

  return {
    mutate,
    isLoading,
    error
  };
}

// Specific mutation hooks
export function useCreateUser() {
  return useMutation(
    (userData: Parameters<typeof apiService.createUser>[0]) => 
      apiService.createUser(userData),
    { successMessage: 'User created successfully' }
  );
}

export function useUpdateUser() {
  return useMutation(
    ({ id, data }: { id: string; data: Parameters<typeof apiService.updateUser>[1] }) => 
      apiService.updateUser(id, data),
    { successMessage: 'User updated successfully' }
  );
}

export function useDeleteUser() {
  return useMutation(
    (userId: string) => apiService.deleteUser(userId),
    { successMessage: 'User deleted successfully' }
  );
}

export function useCreateCourse() {
  return useMutation(
    (courseData: Parameters<typeof apiService.createCourse>[0]) => 
      apiService.createCourse(courseData),
    { successMessage: 'Course created successfully' }
  );
}

export function useUpdateCourse() {
  return useMutation(
    ({ id, data }: { id: string; data: Parameters<typeof apiService.updateCourse>[1] }) => 
      apiService.updateCourse(id, data),
    { successMessage: 'Course updated successfully' }
  );
}

export function useDeleteCourse() {
  return useMutation(
    (courseId: string) => apiService.deleteCourse(courseId),
    { successMessage: 'Course deleted successfully' }
  );
}

export function useMarkAttendance() {
  return useMutation(
    (data: Parameters<typeof apiService.markAttendance>[0]) => 
      apiService.markAttendance(data),
    { successMessage: 'Attendance marked successfully' }
  );
}

export function useUpdateAttendance() {
  return useMutation(
    ({ id, data }: { id: string; data: Parameters<typeof apiService.updateAttendance>[1] }) => 
      apiService.updateAttendance(id, data),
    { successMessage: 'Attendance updated successfully' }
  );
}

export function useFileUpload() {
  return useMutation(
    ({ file, endpoint }: { file: File; endpoint: string }) => 
      apiService.uploadFile(file, endpoint),
    { successMessage: 'File uploaded successfully' }
  );
}
