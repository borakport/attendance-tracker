'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Calendar, CheckCircle, XCircle, Clock, Users, BarChart3, Download, FileText, Table, File } from 'lucide-react';
import { apiService } from '../../services/api';

export default function AttendancePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    level: 'summary', // 'summary', 'sessions', 'detailed'
    scope: 'all', // 'all', 'student', 'lecturer', 'course'
    format: 'csv', // 'csv', 'json', 'html'
    selectedStudent: '',
    selectedLecturer: '',
    includeCourses: 'all', // 'all', 'selected'
    includeStudents: true,
    includeStats: true,
    dateRange: 'all' // 'all', 'custom'
  });

  useEffect(() => {
    fetchData();
  }, [selectedCourse, dateFilter]);

  // Enhanced export functions with flexible options
  const generateExportData = () => {
    const students = [
      // Mock student data - would come from API
      { id: '1', name: 'John Doe', email: 'john@example.com', studentId: 'STU001' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', studentId: 'STU002' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', studentId: 'STU003' },
      { id: '4', name: 'Alice Brown', email: 'alice@example.com', studentId: 'STU004' },
      { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', studentId: 'STU005' },
    ];

    const lecturers = [
      { id: '1', name: 'Dr. Sarah Johnson', email: 'sarah.johnson@university.edu', employeeId: 'EMP001' },
      { id: '2', name: 'Prof. Michael Chen', email: 'michael.chen@university.edu', employeeId: 'EMP002' },
      { id: '3', name: 'Dr. Emily Davis', email: 'emily.davis@university.edu', employeeId: 'EMP003' },
    ];

    // Generate detailed attendance records
    const detailedAttendance = sessions.flatMap(session => {
      const sessionLecturer = lecturers[Math.floor(Math.random() * lecturers.length)];
      return students.map(student => ({
        sessionId: session.id,
        sessionName: session.name,
        courseCode: session.course.code,
        courseName: session.course.name,
        lecturerId: sessionLecturer.employeeId,
        lecturerName: sessionLecturer.name,
        lecturerEmail: sessionLecturer.email,
        date: new Date(session.scheduledAt).toLocaleDateString(),
        time: new Date(session.scheduledAt).toLocaleTimeString(),
        duration: session.duration,
        studentId: student.studentId,
        studentName: student.name,
        studentEmail: student.email,
        status: Math.random() > 0.3 ? (Math.random() > 0.8 ? 'late' : 'present') : 'absent',
        checkInTime: Math.random() > 0.3 ? new Date(session.scheduledAt).toLocaleTimeString() : null
      }));
    });

    // Filter data based on scope
    let filteredAttendance = detailedAttendance;
    if (exportOptions.scope === 'student' && exportOptions.selectedStudent) {
      filteredAttendance = detailedAttendance.filter(record => record.studentId === exportOptions.selectedStudent);
    } else if (exportOptions.scope === 'lecturer' && exportOptions.selectedLecturer) {
      filteredAttendance = detailedAttendance.filter(record => record.lecturerId === exportOptions.selectedLecturer);
    }

    return { students, lecturers, detailedAttendance: filteredAttendance };
  };

  const exportToCSV = () => {
    const { students, lecturers, detailedAttendance } = generateExportData();

    if (exportOptions.scope === 'student') {
      // Individual student attendance history
      const selectedStudentData = students.find(s => s.studentId === exportOptions.selectedStudent);
      const headers = ['Date', 'Time', 'Course Code', 'Course Name', 'Session Name', 'Lecturer', 'Duration', 'Status', 'Check-in Time'];
      const csvData = detailedAttendance.map(record => [
        record.date,
        record.time,
        record.courseCode,
        record.courseName,
        record.sessionName,
        record.lecturerName,
        `${record.duration} min`,
        record.status,
        record.checkInTime || 'N/A'
      ]);

      const csvContent = [
        [`Student Attendance History - ${selectedStudentData?.name} (${exportOptions.selectedStudent})`],
        [`Export Date: ${new Date().toLocaleDateString()}`],
        [],
        headers,
        ...csvData
      ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');
      
      downloadFile(csvContent, `attendance-student-${exportOptions.selectedStudent}.csv`, 'text/csv');

    } else if (exportOptions.scope === 'lecturer') {
      // All students under selected lecturer
      const selectedLecturerData = lecturers.find(l => l.employeeId === exportOptions.selectedLecturer);
      const headers = ['Student ID', 'Student Name', 'Course Code', 'Course Name', 'Session Name', 'Date', 'Time', 'Status', 'Check-in Time'];
      const csvData = detailedAttendance.map(record => [
        record.studentId,
        record.studentName,
        record.courseCode,
        record.courseName,
        record.sessionName,
        record.date,
        record.time,
        record.status,
        record.checkInTime || 'N/A'
      ]);

      const csvContent = [
        [`Lecturer Students Attendance - ${selectedLecturerData?.name} (${exportOptions.selectedLecturer})`],
        [`Export Date: ${new Date().toLocaleDateString()}`],
        [],
        headers,
        ...csvData
      ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');
      
      downloadFile(csvContent, `attendance-lecturer-${exportOptions.selectedLecturer}.csv`, 'text/csv');

    } else if (exportOptions.level === 'summary') {
      // Course summary export
      const headers = ['Course Code', 'Course Name', 'Total Sessions', 'Total Students', 'Avg Attendance Rate', 'Present', 'Late', 'Absent'];
      const courseData = courses.map(course => {
        const courseSessions = sessions.filter(s => s.course.code === course.code);
        const totalPresent = courseSessions.reduce((acc, s) => acc + (s.attendanceStats?.present || 0), 0);
        const totalLate = courseSessions.reduce((acc, s) => acc + (s.attendanceStats?.late || 0), 0);
        const totalAbsent = courseSessions.reduce((acc, s) => acc + (s.attendanceStats?.absent || 0), 0);
        const total = totalPresent + totalLate + totalAbsent;
        const rate = total > 0 ? Math.round(((totalPresent + totalLate) / total) * 100) : 0;

        return [
          course.code,
          course.name,
          courseSessions.length,
          students.length,
          `${rate}%`,
          totalPresent,
          totalLate,
          totalAbsent
        ];
      });

      const csvContent = [headers, ...courseData].map(row => row.join(',')).join('\n');
      downloadFile(csvContent, 'attendance-summary.csv', 'text/csv');

    } else if (exportOptions.level === 'sessions') {
      // Session-level export
      const headers = ['Session Name', 'Course Code', 'Course Name', 'Date', 'Time', 'Duration', 'Total Students', 'Present', 'Late', 'Absent', 'Attendance Rate'];
      const csvData = sessions.map(session => [
        session.name,
        session.course.code,
        session.course.name,
        new Date(session.scheduledAt).toLocaleDateString(),
        new Date(session.scheduledAt).toLocaleTimeString(),
        `${session.duration} minutes`,
        session._count.attendances,
        session.attendanceStats.present,
        session.attendanceStats.late,
        session.attendanceStats.absent,
        `${getAttendanceRate(session.attendanceStats)}%`
      ]);

      const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
      downloadFile(csvContent, 'attendance-sessions.csv', 'text/csv');

    } else if (exportOptions.level === 'detailed') {
      // Individual student attendance records
      const headers = ['Student ID', 'Student Name', 'Student Email', 'Course Code', 'Course Name', 'Session Name', 'Lecturer', 'Date', 'Time', 'Duration', 'Status', 'Check-in Time'];
      const csvData = detailedAttendance.map(record => [
        record.studentId,
        record.studentName,
        record.studentEmail,
        record.courseCode,
        record.courseName,
        record.sessionName,
        record.lecturerName,
        record.date,
        record.time,
        `${record.duration} min`,
        record.status,
        record.checkInTime || 'N/A'
      ]);

      const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
      downloadFile(csvContent, 'attendance-detailed.csv', 'text/csv');
    }
  };

  const exportToJSON = () => {
    const { students, lecturers, detailedAttendance } = generateExportData();
    
    const exportData: any = {
      exportDate: new Date().toISOString(),
      exportLevel: exportOptions.level,
      exportScope: exportOptions.scope,
      filters: {
        course: selectedCourse,
        dateFilter: dateFilter,
        selectedStudent: exportOptions.selectedStudent,
        selectedLecturer: exportOptions.selectedLecturer
      },
      summary: {
        totalCourses: courses.length,
        totalSessions: sessions.length,
        totalStudents: students.length,
        totalLecturers: lecturers.length,
        overallStats: totalStats
      }
    };

    if (exportOptions.scope === 'student') {
      const selectedStudentData = students.find(s => s.studentId === exportOptions.selectedStudent);
      exportData.student = selectedStudentData;
      exportData.attendanceHistory = detailedAttendance;
      exportData.attendanceSummary = {
        totalSessions: detailedAttendance.length,
        present: detailedAttendance.filter(r => r.status === 'present').length,
        late: detailedAttendance.filter(r => r.status === 'late').length,
        absent: detailedAttendance.filter(r => r.status === 'absent').length
      };
    } else if (exportOptions.scope === 'lecturer') {
      const selectedLecturerData = lecturers.find(l => l.employeeId === exportOptions.selectedLecturer);
      exportData.lecturer = selectedLecturerData;
      exportData.studentsAttendance = detailedAttendance;
      exportData.lecturerSummary = {
        totalStudents: new Set(detailedAttendance.map(r => r.studentId)).size,
        totalSessions: new Set(detailedAttendance.map(r => r.sessionId)).size,
        totalRecords: detailedAttendance.length,
        attendanceBreakdown: {
          present: detailedAttendance.filter(r => r.status === 'present').length,
          late: detailedAttendance.filter(r => r.status === 'late').length,
          absent: detailedAttendance.filter(r => r.status === 'absent').length
        }
      };
    } else if (exportOptions.level === 'summary') {
      exportData.courses = courses.map(course => {
        const courseSessions = sessions.filter(s => s.course.code === course.code);
        const totalPresent = courseSessions.reduce((acc, s) => acc + (s.attendanceStats?.present || 0), 0);
        const totalLate = courseSessions.reduce((acc, s) => acc + (s.attendanceStats?.late || 0), 0);
        const totalAbsent = courseSessions.reduce((acc, s) => acc + (s.attendanceStats?.absent || 0), 0);
        
        return {
          ...course,
          sessionCount: courseSessions.length,
          attendance: { present: totalPresent, late: totalLate, absent: totalAbsent },
          attendanceRate: getAttendanceRate({ present: totalPresent, late: totalLate, absent: totalAbsent })
        };
      });
    } else if (exportOptions.level === 'sessions') {
      exportData.sessions = sessions.map(session => ({
        ...session,
        attendanceRate: getAttendanceRate(session.attendanceStats)
      }));
    } else if (exportOptions.level === 'detailed') {
      exportData.students = students;
      exportData.lecturers = lecturers;
      exportData.attendanceRecords = detailedAttendance;
    }

    let filename = 'attendance';
    if (exportOptions.scope === 'student') {
      filename += `-student-${exportOptions.selectedStudent}`;
    } else if (exportOptions.scope === 'lecturer') {
      filename += `-lecturer-${exportOptions.selectedLecturer}`;
    } else {
      filename += `-${exportOptions.level}`;
    }

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
  };

  const exportToPDF = () => {
    const { students, detailedAttendance } = generateExportData();
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Attendance Report - ${exportOptions.level.toUpperCase()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 30px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-box { text-align: center; padding: 10px; border: 1px solid #ddd; flex: 1; margin: 0 5px; }
          .small { font-size: 10px; }
          .present { color: #059669; }
          .late { color: #d97706; }
          .absent { color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Attendance Report - ${exportOptions.level.toUpperCase()}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Report Level: ${exportOptions.level.charAt(0).toUpperCase() + exportOptions.level.slice(1)}</p>
          ${selectedCourse !== 'ALL' ? `<p>Course Filter: ${selectedCourse}</p>` : ''}
          ${dateFilter ? `<p>Date Filter: ${dateFilter}</p>` : ''}
        </div>
    `;

    if (exportOptions.level === 'summary') {
      htmlContent += `
        <h2>Course Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Sessions</th>
              <th>Students</th>
              <th>Present</th>
              <th>Late</th>
              <th>Absent</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            ${courses.map(course => {
              const courseSessions = sessions.filter(s => s.course.code === course.code);
              const totalPresent = courseSessions.reduce((acc, s) => acc + (s.attendanceStats?.present || 0), 0);
              const totalLate = courseSessions.reduce((acc, s) => acc + (s.attendanceStats?.late || 0), 0);
              const totalAbsent = courseSessions.reduce((acc, s) => acc + (s.attendanceStats?.absent || 0), 0);
              const rate = getAttendanceRate({ present: totalPresent, late: totalLate, absent: totalAbsent });
              
              return `
                <tr>
                  <td>${course.code}</td>
                  <td>${course.name}</td>
                  <td>${courseSessions.length}</td>
                  <td>${students.length}</td>
                  <td class="present">${totalPresent}</td>
                  <td class="late">${totalLate}</td>
                  <td class="absent">${totalAbsent}</td>
                  <td>${rate}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else if (exportOptions.level === 'sessions') {
      htmlContent += `
        <h2>Session Details</h2>
        <table>
          <thead>
            <tr>
              <th>Session</th>
              <th>Course</th>
              <th>Date & Time</th>
              <th>Duration</th>
              <th>Present</th>
              <th>Late</th>
              <th>Absent</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.map(session => `
              <tr>
                <td>${session.name}</td>
                <td class="small">${session.course.code}<br/>${session.course.name}</td>
                <td class="small">${new Date(session.scheduledAt).toLocaleDateString()}<br/>${new Date(session.scheduledAt).toLocaleTimeString()}</td>
                <td>${session.duration} min</td>
                <td class="present">${session.attendanceStats.present}</td>
                <td class="late">${session.attendanceStats.late}</td>
                <td class="absent">${session.attendanceStats.absent}</td>
                <td>${getAttendanceRate(session.attendanceStats)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (exportOptions.level === 'detailed') {
      htmlContent += `
        <h2>Individual Student Records</h2>
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Course</th>
              <th>Session</th>
              <th>Date</th>
              <th>Status</th>
              <th>Check-in</th>
            </tr>
          </thead>
          <tbody>
            ${detailedAttendance.slice(0, 100).map(record => `
              <tr>
                <td>${record.studentId}</td>
                <td class="small">${record.studentName}<br/>${record.studentEmail}</td>
                <td class="small">${record.courseCode}<br/>${record.courseName}</td>
                <td class="small">${record.sessionName}</td>
                <td class="small">${record.date}<br/>${record.time}</td>
                <td class="${record.status}">${record.status.toUpperCase()}</td>
                <td class="small">${record.checkInTime || 'N/A'}</td>
              </tr>
            `).join('')}
            ${detailedAttendance.length > 100 ? `<tr><td colspan="7" style="text-align: center; font-style: italic;">... and ${detailedAttendance.length - 100} more records</td></tr>` : ''}
          </tbody>
        </table>
      `;
    }

    htmlContent += `
      </body>
      </html>
    `;

    downloadFile(htmlContent, `attendance-${exportOptions.level}.html`, 'text/html');
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchData();
  }, [selectedCourse, dateFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch courses for filter dropdown
      const coursesResponse: any = await apiService.getCourses();
      setCourses(coursesResponse.data || coursesResponse || []);
      
      // Fetch sessions with attendance data
      const params: any = {};
      if (selectedCourse !== 'ALL') params.courseId = selectedCourse;
      if (dateFilter) params.date = dateFilter;
      
      const sessionsResponse: any = await apiService.getSessions(params);
      setSessions(sessionsResponse.data || sessionsResponse || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Use mock data for now if API fails
      setCourses([
        { id: '1', name: 'Computer Science 101', code: 'CS101' },
        { id: '2', name: 'Advanced Mathematics', code: 'MATH301' },
        { id: '3', name: 'Database Systems', code: 'CS401' }
      ]);
      
      setSessions([
        {
          id: '1',
          name: 'Lecture 1: Introduction',
          course: { name: 'Computer Science 101', code: 'CS101' },
          scheduledAt: '2024-01-15T09:00:00Z',
          duration: 90,
          _count: { attendances: 25 },
          attendanceStats: { present: 20, late: 3, absent: 2 }
        },
        {
          id: '2',
          name: 'Lab Session 1',
          course: { name: 'Computer Science 101', code: 'CS101' },
          scheduledAt: '2024-01-17T14:00:00Z',
          duration: 120,
          _count: { attendances: 25 },
          attendanceStats: { present: 22, late: 1, absent: 2 }
        },
        {
          id: '3',
          name: 'Calculus Review',
          course: { name: 'Advanced Mathematics', code: 'MATH301' },
          scheduledAt: '2024-01-16T11:00:00Z',
          duration: 60,
          _count: { attendances: 18 },
          attendanceStats: { present: 15, late: 2, absent: 1 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceRate = (stats: any) => {
    const total = stats.present + stats.late + stats.absent;
    return total > 0 ? Math.round(((stats.present + stats.late) / total) * 100) : 0;
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalStats = sessions.reduce(
    (acc: any, session: any) => {
      acc.present += session.attendanceStats?.present || 0;
      acc.late += session.attendanceStats?.late || 0;
      acc.absent += session.attendanceStats?.absent || 0;
      return acc;
    },
    { present: 0, late: 0, absent: 0 }
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
            <h1 className="text-2xl font-semibold text-gray-800">Attendance Management</h1>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Export Records</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-semibold text-gray-900">{totalStats.present}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="text-2xl font-semibold text-gray-900">{totalStats.late}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-semibold text-gray-900">{totalStats.absent}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className={`text-2xl font-semibold ${getStatusColor(getAttendanceRate(totalStats))}`}>
                  {getAttendanceRate(totalStats)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Courses</option>
            {courses.map((course: any) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Session Attendance</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Loading sessions...
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No sessions found
                    </td>
                  </tr>
                ) : (
                  sessions.map((session: any) => {
                    const rate = getAttendanceRate(session.attendanceStats || { present: 0, late: 0, absent: 0 });
                    return (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{session.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{session.course?.code}</div>
                          <div className="text-sm text-gray-500">{session.course?.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(session.scheduledAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(session.scheduledAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {session.duration} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-4 text-sm">
                            <span className="flex items-center text-green-600">
                              <CheckCircle size={14} className="mr-1" />
                              {session.attendanceStats?.present || 0}
                            </span>
                            <span className="flex items-center text-yellow-600">
                              <Clock size={14} className="mr-1" />
                              {session.attendanceStats?.late || 0}
                            </span>
                            <span className="flex items-center text-red-600">
                              <XCircle size={14} className="mr-1" />
                              {session.attendanceStats?.absent || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getStatusColor(rate)}`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <Download className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Export Attendance Records</h3>
              </div>
              
              {/* Export Scope Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Export Scope</label>
                <div className="space-y-3">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      exportOptions.scope === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setExportOptions({...exportOptions, scope: 'all'})}
                  >
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        checked={exportOptions.scope === 'all'} 
                        onChange={() => {}}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">All Data</div>
                        <div className="text-sm text-gray-500">Export all courses, sessions, and students</div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      exportOptions.scope === 'student' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setExportOptions({...exportOptions, scope: 'student'})}
                  >
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        checked={exportOptions.scope === 'student'} 
                        onChange={() => {}}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Individual Student</div>
                        <div className="text-sm text-gray-500">Export attendance history for a specific student</div>
                        {exportOptions.scope === 'student' && (
                          <div className="mt-3">
                            <select 
                              value={exportOptions.selectedStudent}
                              onChange={(e) => setExportOptions({...exportOptions, selectedStudent: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select a student...</option>
                              <option value="STU001">STU001 - John Doe</option>
                              <option value="STU002">STU002 - Jane Smith</option>
                              <option value="STU003">STU003 - Bob Johnson</option>
                              <option value="STU004">STU004 - Alice Brown</option>
                              <option value="STU005">STU005 - Charlie Wilson</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      exportOptions.scope === 'lecturer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setExportOptions({...exportOptions, scope: 'lecturer'})}
                  >
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        checked={exportOptions.scope === 'lecturer'} 
                        onChange={() => {}}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Lecturer's Students</div>
                        <div className="text-sm text-gray-500">Export all students under a specific lecturer</div>
                        {exportOptions.scope === 'lecturer' && (
                          <div className="mt-3">
                            <select 
                              value={exportOptions.selectedLecturer}
                              onChange={(e) => setExportOptions({...exportOptions, selectedLecturer: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select a lecturer...</option>
                              <option value="EMP001">EMP001 - Dr. Sarah Johnson</option>
                              <option value="EMP002">EMP002 - Prof. Michael Chen</option>
                              <option value="EMP003">EMP003 - Dr. Emily Davis</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Level Selection (only for all data scope) */}
              {exportOptions.scope === 'all' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Export Level</label>
                  <div className="space-y-3">
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        exportOptions.level === 'summary' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setExportOptions({...exportOptions, level: 'summary'})}
                    >
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          checked={exportOptions.level === 'summary'} 
                          onChange={() => {}}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Course Summary</div>
                          <div className="text-sm text-gray-500">Total attendance stats per course</div>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        exportOptions.level === 'sessions' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setExportOptions({...exportOptions, level: 'sessions'})}
                    >
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          checked={exportOptions.level === 'sessions'} 
                          onChange={() => {}}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Session Details</div>
                          <div className="text-sm text-gray-500">Attendance data for each session</div>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        exportOptions.level === 'detailed' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setExportOptions({...exportOptions, level: 'detailed'})}
                    >
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          checked={exportOptions.level === 'detailed'} 
                          onChange={() => {}}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Individual Records</div>
                          <div className="text-sm text-gray-500">Each student's attendance per session</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      exportToCSV();
                      setShowExportModal(false);
                    }}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Table className="h-8 w-8 text-green-600 mb-2" />
                    <div className="text-sm font-medium text-gray-900">CSV</div>
                    <div className="text-xs text-gray-500 text-center">Excel compatible</div>
                  </button>
                  
                  <button
                    onClick={() => {
                      exportToJSON();
                      setShowExportModal(false);
                    }}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-8 w-8 text-blue-600 mb-2" />
                    <div className="text-sm font-medium text-gray-900">JSON</div>
                    <div className="text-xs text-gray-500 text-center">Structured data</div>
                  </button>
                  
                  <button
                    onClick={() => {
                      exportToPDF();
                      setShowExportModal(false);
                    }}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <File className="h-8 w-8 text-red-600 mb-2" />
                    <div className="text-sm font-medium text-gray-900">HTML</div>
                    <div className="text-xs text-gray-500 text-center">Print ready</div>
                  </button>
                </div>
              </div>

              {/* Export Preview */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Export Preview</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Scope:</strong> {
                    exportOptions.scope === 'all' ? 'All Data' :
                    exportOptions.scope === 'student' ? 'Individual Student' : 'Lecturer\'s Students'
                  }</div>
                  
                  {exportOptions.scope === 'student' && exportOptions.selectedStudent && (
                    <div><strong>Selected Student:</strong> {exportOptions.selectedStudent}</div>
                  )}
                  
                  {exportOptions.scope === 'lecturer' && exportOptions.selectedLecturer && (
                    <div><strong>Selected Lecturer:</strong> {exportOptions.selectedLecturer}</div>
                  )}
                  
                  {exportOptions.scope === 'all' && (
                    <div><strong>Level:</strong> {exportOptions.level.charAt(0).toUpperCase() + exportOptions.level.slice(1)}</div>
                  )}
                  
                  <div><strong>Filters:</strong> {selectedCourse !== 'ALL' ? `Course: ${selectedCourse}` : 'All courses'}{dateFilter ? `, Date: ${dateFilter}` : ''}</div>
                  
                  <div><strong>Will include:</strong></div>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {exportOptions.scope === 'student' && (
                      <>
                        <li>Complete attendance history for selected student</li>
                        <li>All courses and sessions attended</li>
                        <li>Attendance status and check-in times</li>
                        <li>Course and lecturer information</li>
                        <li>Attendance summary statistics</li>
                      </>
                    )}
                    
                    {exportOptions.scope === 'lecturer' && (
                      <>
                        <li>All students under selected lecturer</li>
                        <li>Attendance records for all their courses</li>
                        <li>Individual student performance data</li>
                        <li>Session and course details</li>
                        <li>Lecturer summary statistics</li>
                      </>
                    )}
                    
                    {exportOptions.scope === 'all' && exportOptions.level === 'summary' && (
                      <>
                        <li>{courses.length} courses with total attendance statistics</li>
                        <li>Aggregated present, late, and absent counts</li>
                        <li>Overall attendance rates per course</li>
                      </>
                    )}
                    
                    {exportOptions.scope === 'all' && exportOptions.level === 'sessions' && (
                      <>
                        <li>{sessions.length} sessions with detailed information</li>
                        <li>Date, time, and duration for each session</li>
                        <li>Attendance counts and rates per session</li>
                      </>
                    )}
                    
                    {exportOptions.scope === 'all' && exportOptions.level === 'detailed' && (
                      <>
                        <li>Individual student attendance records</li>
                        <li>Student information and contact details</li>
                        <li>Attendance status and check-in times</li>
                        <li>Session and course details for each record</li>
                        <li>Lecturer information for each session</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
