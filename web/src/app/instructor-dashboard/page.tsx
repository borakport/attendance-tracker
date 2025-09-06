'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock,
  TrendingUp,
  FileText,
  Bell,
  Search,
  Plus,
  Menu,
  X,
  LogOut,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Home
} from 'lucide-react';
import { APP_CONFIG, ROUTES } from '@/constants';
import { User } from '@/types';

export default function InstructorDashboard() {
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
    if (parsedUser.role !== 'instructor') {
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const navigationItems = [
    { id: 'overview', name: 'Overview', icon: Home, description: 'Dashboard overview' },
    { id: 'my-courses', name: 'My Courses', icon: BookOpen, description: 'Your assigned courses' },
    { id: 'attendance', name: 'Attendance', icon: Clock, description: 'Mark and view attendance' },
    { id: 'students', name: 'My Students', icon: Users, description: 'Students in your courses' },
    { id: 'reports', name: 'Reports', icon: FileText, description: 'Course reports' },
    { id: 'schedule', name: 'Schedule', icon: Calendar, description: 'Class schedule' }
  ];

  const quickStats = [
    { title: 'My Courses', value: '6', change: '0%', icon: BookOpen, color: 'blue' },
    { title: 'Total Students', value: '186', change: '+3%', icon: Users, color: 'green' },
    { title: 'Today\'s Classes', value: '4', change: '0%', icon: Calendar, color: 'purple' },
    { title: 'Avg Attendance', value: '91.8%', change: '+2.1%', icon: TrendingUp, color: 'orange' }
  ];

  const todaysClasses = [
    { course: 'Computer Science 101', time: '09:00 AM', room: 'Lab A', students: 32, status: 'completed' },
    { course: 'Data Structures', time: '11:00 AM', room: 'Room 205', students: 28, status: 'completed' },
    { course: 'Web Development', time: '02:00 PM', room: 'Lab B', students: 24, status: 'upcoming' },
    { course: 'Database Systems', time: '04:00 PM', room: 'Room 301', students: 30, status: 'upcoming' }
  ];

  const recentAttendance = [
    { course: 'Computer Science 101', date: 'Today', present: 28, total: 32, percentage: 87.5 },
    { course: 'Data Structures', date: 'Today', present: 26, total: 28, percentage: 92.9 },
    { course: 'Web Development', date: 'Yesterday', present: 22, total: 24, percentage: 91.7 },
    { course: 'Database Systems', date: 'Yesterday', present: 29, total: 30, percentage: 96.7 }
  ];

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
            <GraduationCap className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Instructor Portal</span>
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
            <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Instructor</p>
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
                    ? 'bg-green-50 text-green-700 border-r-4 border-green-700'
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
          <div className="flex items-center justify-between h-16 px-4">
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
                  placeholder="Search courses, students..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Mark Attendance
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-3">
          {activeView === 'overview' && (
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                          <p className={`text-sm mt-1 ${
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Today's Classes */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Today's Classes</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {todaysClasses.map((class_, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{class_.course}</h4>
                            <p className="text-sm text-gray-600">{class_.time} • {class_.room}</p>
                            <p className="text-xs text-gray-500">{class_.students} students</p>
                          </div>
                          <div className="flex items-center">
                            {class_.status === 'completed' ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="h-5 w-5 mr-1" />
                                <span className="text-sm">Complete</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-orange-600">
                                <AlertCircle className="h-5 w-5 mr-1" />
                                <span className="text-sm">Upcoming</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Attendance */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Attendance</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {recentAttendance.map((record, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{record.course}</h4>
                            <p className="text-sm text-gray-600">{record.date}</p>
                            <p className="text-xs text-gray-500">
                              {record.present}/{record.total} students present
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              record.percentage >= 90 ? 'text-green-600' :
                              record.percentage >= 80 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {record.percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other views would be rendered here based on activeView */}
          {activeView !== 'overview' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <BookOpen className="h-12 w-12 mx-auto" />
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
