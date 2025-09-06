'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, BookOpen, Users, Calendar, Edit, Trash2, Clock } from 'lucide-react';
import { apiService } from '../../services/api';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response: any = await apiService.getCourses();
      setCourses(response.data || response || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Use mock data for now if API fails
      setCourses([
        {
          id: '1',
          name: 'Introduction to Computer Science',
          code: 'CS101',
          description: 'Fundamentals of programming and computer science concepts',
          instructor: { firstName: 'Dr. Jane', lastName: 'Smith' },
          _count: { members: 25, sessions: 12 },
          createdAt: '2024-01-15',
          isActive: true
        },
        {
          id: '2',
          name: 'Advanced Mathematics',
          code: 'MATH301',
          description: 'Calculus, linear algebra, and differential equations',
          instructor: { firstName: 'Prof. John', lastName: 'Doe' },
          _count: { members: 18, sessions: 8 },
          createdAt: '2024-02-01',
          isActive: true
        },
        {
          id: '3',
          name: 'Database Systems',
          code: 'CS401',
          description: 'Database design, SQL, and data management',
          instructor: { firstName: 'Dr. Sarah', lastName: 'Wilson' },
          _count: { members: 30, sessions: 15 },
          createdAt: '2024-01-20',
          isActive: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await apiService.deleteCourse(courseId);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const filteredCourses = courses.filter((course: any) =>
    course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-800">Course Management</h1>
          </div>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {courses.filter((c: any) => c.isActive).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {courses.reduce((sum: number, c: any) => sum + (c._count?.members || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {courses.reduce((sum: number, c: any) => sum + (c._count?.sessions || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Loading courses...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No courses found
            </div>
          ) : (
            filteredCourses.map((course: any) => (
              <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                        <p className="text-sm text-gray-500">{course.code}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    <p>Instructor: {course.instructor?.firstName} {course.instructor?.lastName}</p>
                    <p>Created: {new Date(course.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{course._count?.members || 0}</div>
                      <div className="text-xs text-gray-500">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{course._count?.sessions || 0}</div>
                      <div className="text-xs text-gray-500">Sessions</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center space-x-1">
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 flex items-center justify-center space-x-1"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
