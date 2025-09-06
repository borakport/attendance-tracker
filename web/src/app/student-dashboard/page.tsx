'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Calendar, 
  Clock,
  TrendingUp,
  FileText,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Users,
  CheckCircle,
  XCircle,
  Home,
  Award,
  AlertTriangle
} from 'lucide-react';
import { APP_CONFIG, ROUTES } from '@/constants';
import { User } from '@/types';

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER);
    const authToken = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    
    if (!userData || !authToken) {
      router.push(ROUTES.LOGIN);
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'student') {
      router.push(ROUTES.LOGIN);
      return;
    }
    
    setUser(parsedUser);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    router.push(ROUTES.LOGIN);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const navigationItems = [
    { id: 'overview', name: 'Overview', icon: Home, description: 'Dashboard overview' },
    { id: 'attendance', name: 'My Attendance', icon: Clock, description: 'View your attendance' },
    { id: 'courses', name: 'My Courses', icon: BookOpen, description: 'Enrolled courses' },
    { id: 'schedule', name: 'Schedule', icon: Calendar, description: 'Class schedule' }
  ];

  const quickStats = [
    { title: 'Enrolled Courses', value: '8', change: '0%', icon: BookOpen, color: 'blue' },
    { title: 'Attendance Rate', value: '96.5%', change: '+1.2%', icon: TrendingUp, color: 'green' },
    { title: 'Classes Today', value: '3', change: '0%', icon: Calendar, color: 'purple' },
    { title: 'Upcoming Exams', value: '2', change: '-1', icon: FileText, color: 'orange' }
  ];

  const todaysSchedule = [
    { course: 'Computer Science 101', time: '09:00 AM', room: 'Lab A', instructor: 'Dr. Smith', status: 'completed', attended: true },
    { course: 'Data Structures', time: '11:00 AM', room: 'Room 205', instructor: 'Prof. Johnson', status: 'completed', attended: true },
    { course: 'Web Development', time: '02:00 PM', room: 'Lab B', instructor: 'Dr. Brown', status: 'upcoming', attended: null },
    { course: 'Database Systems', time: '04:00 PM', room: 'Room 301', instructor: 'Prof. Wilson', status: 'upcoming', attended: null }
  ];

  const attendanceOverview = [
    { course: 'Computer Science 101', total: 24, attended: 23, percentage: 95.8, status: 'excellent' },
    { course: 'Data Structures', total: 22, attended: 22, percentage: 100, status: 'excellent' },
    { course: 'Web Development', total: 20, attended: 19, percentage: 95.0, status: 'excellent' },
    { course: 'Database Systems', total: 18, attended: 17, percentage: 94.4, status: 'good' },
    { course: 'Mathematics', total: 26, attended: 24, percentage: 92.3, status: 'good' },
    { course: 'Physics', total: 24, attended: 21, percentage: 87.5, status: 'warning' },
    { course: 'English', total: 20, attended: 20, percentage: 100, status: 'excellent' },
    { course: 'History', total: 22, attended: 19, percentage: 86.4, status: 'warning' }
  ];

  const upcomingExams = [
    { course: 'Data Structures', date: '2025-01-25', time: '10:00 AM', type: 'Final Exam', room: 'Hall A' },
    { course: 'Web Development', date: '2025-01-28', time: '02:00 PM', type: 'Project Presentation', room: 'Lab B' }
  ];

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Student Portal</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="h-5 w-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="ml-4 lg:ml-0 text-2xl font-bold text-gray-900 capitalize">
                {activeView.replace('-', ' ')}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6">
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                          <p className={`text-sm mt-2 ${
                            stat.change.startsWith('+') ? 'text-green-600' : 
                            stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {stat.change} from last month
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                          <IconComponent className={`h-6 w-6 text-${stat.color}-600`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Schedule */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {todaysSchedule.map((class_, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{class_.course}</h4>
                            <p className="text-sm text-gray-600">{class_.time} • {class_.room}</p>
                            <p className="text-xs text-gray-500">Instructor: {class_.instructor}</p>
                          </div>
                          <div className="flex items-center">
                            {class_.status === 'completed' ? (
                              class_.attended ? (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle className="h-5 w-5 mr-1" />
                                  <span className="text-sm">Present</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-red-600">
                                  <XCircle className="h-5 w-5 mr-1" />
                                  <span className="text-sm">Absent</span>
                                </div>
                              )
                            ) : (
                              <div className="flex items-center text-orange-600">
                                <Clock className="h-5 w-5 mr-1" />
                                <span className="text-sm">Upcoming</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upcoming Exams */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Upcoming Exams</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {upcomingExams.map((exam, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{exam.course}</h4>
                            <p className="text-sm text-gray-600">{exam.type}</p>
                            <p className="text-xs text-gray-500">{exam.date} • {exam.time} • {exam.room}</p>
                          </div>
                          <div className="flex items-center text-yellow-600">
                            <AlertTriangle className="h-5 w-5 mr-1" />
                            <span className="text-sm font-medium">Exam</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Overview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Attendance Overview</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attendanceOverview.map((record, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{record.course}</h4>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceColor(record.status)}`}>
                            {record.status}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {record.attended}/{record.total} classes
                          </span>
                          <span className={`text-lg font-bold ${
                            record.percentage >= 90 ? 'text-green-600' :
                            record.percentage >= 80 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {record.percentage}%
                          </span>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              record.percentage >= 90 ? 'bg-green-500' :
                              record.percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${record.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other views would be rendered here based on activeView */}
          {activeView !== 'overview' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <BookOpen className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {navigationItems.find(item => item.id === activeView)?.name} View
                </h3>
                <p className="text-gray-600 mb-4">
                  {navigationItems.find(item => item.id === activeView)?.description}
                </p>
                <p className="text-sm text-gray-500">
                  This section will be implemented with the backend API integration.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
