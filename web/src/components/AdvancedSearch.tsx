'use client';

import { useState } from 'react';
import { Search, Filter, X, Calendar, Users, GraduationCap, Clock } from 'lucide-react';

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
  onClear: () => void;
}

export default function AdvancedSearch({ onSearch, onClear }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    courseCode: '',
    instructor: '',
    attendanceRate: '',
    dateRange: {
      start: '',
      end: ''
    },
    status: '',
    studentId: '',
    department: ''
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateRangeChange = (key: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value
      }
    }));
  };

  const applyFilters = () => {
    onSearch(filters);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      courseCode: '',
      instructor: '',
      attendanceRate: '',
      dateRange: { start: '', end: '' },
      status: '',
      studentId: '',
      department: ''
    });
    onClear();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Basic Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students, courses, or sessions..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced
          </button>
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Course Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
              <select
                value={filters.courseCode}
                onChange={(e) => handleFilterChange('courseCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Courses</option>
                <option value="CS101">CS101 - Computer Science 101</option>
                <option value="MATH301">MATH301 - Advanced Mathematics</option>
                <option value="CS401">CS401 - Database Systems</option>
              </select>
            </div>

            {/* Instructor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
              <select
                value={filters.instructor}
                onChange={(e) => handleFilterChange('instructor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Instructors</option>
                <option value="sarah">Dr. Sarah Johnson</option>
                <option value="michael">Prof. Michael Chen</option>
                <option value="emily">Dr. Emily Davis</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                <option value="cs">Computer Science</option>
                <option value="math">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
              </select>
            </div>

            {/* Attendance Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Rate</label>
              <select
                value={filters.attendanceRate}
                onChange={(e) => handleFilterChange('attendanceRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any Rate</option>
                <option value="excellent">90-100% (Excellent)</option>
                <option value="good">75-89% (Good)</option>
                <option value="average">60-74% (Average)</option>
                <option value="poor">Below 60% (Poor)</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="excused">Excused</option>
              </select>
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
              <input
                type="text"
                placeholder="Enter student ID..."
                value={filters.studentId}
                onChange={(e) => handleFilterChange('studentId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

          </div>

          {/* Date Range */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <span className="text-gray-500">to</span>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Collapse
              </button>
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
