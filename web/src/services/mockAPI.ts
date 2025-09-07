import { User, Course, AttendanceRecord } from '@/types';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data store
class MockDataStore {
  private users: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@school.edu',
      role: 'admin',
      permissions: ['read', 'write', 'delete'],
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@school.edu',
      role: 'instructor',
      permissions: ['read', 'write'],
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'John Smith',
      email: 'john.smith@student.school.edu',
      role: 'student',
      permissions: ['read'],
      createdAt: new Date().toISOString(),
    },
  ];

  private courses: Course[] = [
    {
      id: '1',
      name: 'Computer Science 101',
      code: 'CS101',
      description: 'Introduction to Computer Science',
      instructorId: '2',
      instructorName: 'Dr. Sarah Johnson',
      studentCount: 25,
      schedule: [
        {
          id: '1',
          courseId: '1',
          dayOfWeek: 1, // Monday
          startTime: '09:00',
          endTime: '10:30',
          room: 'CS-101'
        },
        {
          id: '2',
          courseId: '1',
          dayOfWeek: 3, // Wednesday
          startTime: '09:00',
          endTime: '10:30',
          room: 'CS-101'
        },
        {
          id: '3',
          courseId: '1',
          dayOfWeek: 5, // Friday
          startTime: '09:00',
          endTime: '10:30',
          room: 'CS-101'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private attendanceRecords: AttendanceRecord[] = [];

  // User operations
  async getUsers(filters?: { role?: string; search?: string }): Promise<User[]> {
    await delay(500);
    let filtered = [...this.users];
    
    if (filters?.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }

  async getUserById(id: string): Promise<User | null> {
    await delay(300);
    return this.users.find(user => user.id === id) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    await delay(800);
    
    // Simulate validation
    if (this.users.some(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }
    
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await delay(600);
    
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  async deleteUser(id: string): Promise<void> {
    await delay(400);
    
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    this.users.splice(userIndex, 1);
  }

  // Course operations
  async getCourses(filters?: { instructorId?: string; search?: string }): Promise<Course[]> {
    await delay(500);
    let filtered = [...this.courses];
    
    if (filters?.instructorId) {
      filtered = filtered.filter(course => course.instructorId === filters.instructorId);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(search) ||
        course.code.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }

  async getCourseById(id: string): Promise<Course | null> {
    await delay(300);
    return this.courses.find(course => course.id === id) || null;
  }

  async createCourse(courseData: Omit<Course, 'id'>): Promise<Course> {
    await delay(800);
    
    // Simulate validation
    if (this.courses.some(c => c.code === courseData.code)) {
      throw new Error('Course code already exists');
    }
    
    const newCourse: Course = {
      ...courseData,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    this.courses.push(newCourse);
    return newCourse;
  }

  // Attendance operations
  async getAttendanceRecords(courseId?: string, studentId?: string): Promise<AttendanceRecord[]> {
    await delay(400);
    let filtered = [...this.attendanceRecords];
    
    if (courseId) {
      filtered = filtered.filter(record => record.courseId === courseId);
    }
    
    if (studentId) {
      filtered = filtered.filter(record => record.studentId === studentId);
    }
    
    return filtered;
  }

  async markAttendance(data: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
    await delay(600);
    
    const record: AttendanceRecord = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    this.attendanceRecords.push(record);
    return record;
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalCourses: number;
    totalStudents: number;
    totalInstructors: number;
    recentActivities: Array<{
      id: string;
      action: string;
      user: string;
      time: string;
      type: 'user' | 'course' | 'attendance' | 'system';
    }>;
  }> {
    await delay(700);
    
    return {
      totalUsers: this.users.length,
      totalCourses: this.courses.length,
      totalStudents: this.users.filter(u => u.role === 'student').length,
      totalInstructors: this.users.filter(u => u.role === 'instructor').length,
      recentActivities: [
        {
          id: '1',
          action: 'New student enrolled in CS101',
          user: 'John Smith',
          time: '2 hours ago',
          type: 'course',
        },
        {
          id: '2',
          action: 'Attendance marked for Monday class',
          user: 'Dr. Sarah Johnson',
          time: '3 hours ago',
          type: 'attendance',
        },
        {
          id: '3',
          action: 'New instructor account created',
          user: 'Admin User',
          time: '5 hours ago',
          type: 'user',
        },
      ],
    };
  }
}

// Export singleton instance
export const mockAPI = new MockDataStore();

// Error simulation helper
export const simulateNetworkError = (probability: number = 0.1) => {
  if (Math.random() < probability) {
    throw new Error('Network error: Failed to connect to server');
  }
};

// API wrapper with error handling
export class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = '/api', timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // For now, use mock API
    // TODO: Replace with actual fetch when backend is ready
    return this.handleMockRequest<T>(endpoint, options);
  }

  private async handleMockRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Simulate network conditions
    if (process.env.NODE_ENV === 'development') {
      simulateNetworkError(0.05); // 5% chance of network error
    }

    const [path, method] = [endpoint, options.method || 'GET'];
    
    // Route to appropriate mock API method
    switch (true) {
      case path === '/users' && method === 'GET':
        return mockAPI.getUsers() as Promise<T>;
      case path.startsWith('/users/') && method === 'GET':
        const userId = path.split('/')[2];
        return mockAPI.getUserById(userId) as Promise<T>;
      case path === '/courses' && method === 'GET':
        return mockAPI.getCourses() as Promise<T>;
      case path === '/dashboard/stats' && method === 'GET':
        return mockAPI.getDashboardStats() as Promise<T>;
      default:
        throw new Error(`Mock API: Unhandled endpoint ${method} ${path}`);
    }
  }

  // Public API methods
  async getUsers(filters?: { role?: string; search?: string }) {
    return this.request<User[]>('/users');
  }

  async getUserById(id: string) {
    return this.request<User>(`/users/${id}`);
  }

  async getCourses(filters?: { instructorId?: string; search?: string }) {
    return this.request<Course[]>('/courses');
  }

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }
}

export const apiClient = new APIClient();
