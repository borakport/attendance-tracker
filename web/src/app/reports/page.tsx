'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Filter, Calendar, BarChart3, TrendingUp, FileText, Users } from 'lucide-react';
import { apiService } from '../../services/api';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response: any = await apiService.getCourses();
      setCourses(response.data || response || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([
        { id: '1', name: 'Computer Science 101', code: 'CS101' },
        { id: '2', name: 'Advanced Mathematics', code: 'MATH301' },
        { id: '3', name: 'Database Systems', code: 'CS401' }
      ]);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const params: any = {
        type: reportType,
        startDate: dateRange.start,
        endDate: dateRange.end
      };
      
      if (selectedCourse !== 'ALL') {
        params.courseId = selectedCourse;
      }

      const response: any = await apiService.generateReport(reportType, params);
      
      // For demo purposes, create mock report data
      const mockReport = {
        id: Date.now().toString(),
        type: reportType,
        course: selectedCourse !== 'ALL' ? courses.find(c => c.id === selectedCourse) : null,
        dateRange: dateRange,
        generatedAt: new Date().toISOString(),
        data: getMockReportData(reportType)
      };
      
      setReports(prev => [mockReport, ...prev]);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockReportData = (type: string) => {
    switch (type) {
      case 'attendance':
        return {
          totalSessions: 15,
          averageAttendance: 85.6,
          presentCount: 320,
          lateCount: 45,
          absentCount: 60,
          trends: 'Attendance improving over time'
        };
      case 'performance':
        return {
          averageGrade: 78.5,
          passRate: 92.3,
          topPerformers: 8,
          strugglingStudents: 3
        };
      case 'engagement':
        return {
          activeParticipants: 89.2,
          discussionPosts: 245,
          assignmentSubmissions: 98.7,
          courseMaterials: 156
        };
      default:
        return {};
    }
  };

  const downloadReport = (report: any) => {
    // In a real app, this would download the actual report file
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.type}-report-${report.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'performance':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'engagement':
        return <BarChart3 className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-800">Reports & Analytics</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Report Generation Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="attendance">Attendance Report</option>
                <option value="performance">Performance Report</option>
                <option value="engagement">Engagement Report</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Courses</option>
                {courses.map((course: any) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <FileText size={20} />
            <span>{loading ? 'Generating...' : 'Generate Report'}</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">73</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Attendance</p>
                <p className="text-2xl font-semibold text-gray-900">85.6%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-semibold text-gray-900">3</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reports Generated</p>
                <p className="text-2xl font-semibold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Reports */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Generated Reports</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No reports generated yet. Use the form above to create your first report.
                    </td>
                  </tr>
                ) : (
                  reports.map((report: any) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getReportIcon(report.type)}
                          <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                            {report.type} Report
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.course ? `${report.course.code} - ${report.course.name}` : 'All Courses'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.dateRange.start && report.dateRange.end 
                          ? `${report.dateRange.start} to ${report.dateRange.end}`
                          : 'All Time'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => downloadReport(report)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <Download size={16} />
                          <span>Download</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
