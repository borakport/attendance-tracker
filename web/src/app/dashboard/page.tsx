'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp,
  Calendar,
  Clock,
  FileText,
  Settings,
  Bell,
  Search,
  Plus,
  Menu,
  X,
  LogOut,
  Shield,
  ChevronRight,
  Activity,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { APP_CONFIG, ROUTES } from '@/constants';
import { User } from '@/types';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER);
    const authToken = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    
    if (!userData || !authToken) {
      router.push(ROUTES.LOGIN);
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push(ROUTES.LOGIN);
      return;
    }
    
    setUser(parsedUser);
    
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    router.push(ROUTES.LOGIN);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const navigationItems = [
    { id: 'overview', name: 'Overview', icon: Activity, description: 'System overview' },
    { id: 'users', name: 'User Management', icon: Users, description: 'Manage all users' },
    { id: 'courses', name: 'Course Management', icon: BookOpen, description: 'Manage courses' },
    { id: 'instructors', name: 'Instructors', icon: GraduationCap, description: 'Instructor management' },
    { id: 'students', name: 'Students', icon: UserCheck, description: 'Student management' },
    { id: 'attendance', name: 'Attendance Reports', icon: Clock, description: 'View attendance data' },
    { id: 'reports', name: 'System Reports', icon: FileText, description: 'Generate reports' },
    { id: 'settings', name: 'System Settings', icon: Settings, description: 'Configure system' }
  ];

  const quickStats = [
    { title: 'Total Users', value: '1,234', change: '+12%', icon: Users, color: 'blue' },
    { title: 'Active Courses', value: '89', change: '+5%', icon: BookOpen, color: 'green' },
    { title: 'Total Instructors', value: '45', change: '+3%', icon: GraduationCap, color: 'purple' },
    { title: 'System Health', value: '98.5%', change: '+0.2%', icon: TrendingUp, color: 'orange' }
  ];

  const recentActivities = [
    { action: 'New instructor registered', user: 'Dr. Sarah Johnson', time: '2 minutes ago', type: 'user' },
    { action: 'Course "Advanced Mathematics" created', user: 'Prof. Michael Chen', time: '15 minutes ago', type: 'course' },
    { action: 'System backup completed', user: 'System', time: '1 hour ago', type: 'system' },
    { action: 'Attendance report generated', user: 'Dr. Emily Davis', time: '2 hours ago', type: 'report' },
    { action: 'New student enrolled', user: 'John Smith', time: '3 hours ago', type: 'user' }
  ];

  const systemAlerts = [
    { message: 'Server storage at 85% capacity', severity: 'warning', time: '1 hour ago' },
    { message: 'Scheduled maintenance tonight at 2 AM', severity: 'info', time: '3 hours ago' },
    { message: 'Security scan completed successfully', severity: 'success', time: '6 hours ago' }
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
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Admin Portal</span>
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
            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">System Administrator</p>
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
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
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
                  placeholder="Search users, courses..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-4 py-3">
          {activeView === 'overview' && (
            isLoading ? (
              <DashboardSkeleton />
            ) : (
              <div className="space-y-3">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {quickStats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Recent Activities */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{activity.action}</h4>
                            <p className="text-sm text-gray-600">by {activity.user}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{activity.time}</p>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              activity.type === 'user' ? 'bg-blue-100 text-blue-800' :
                              activity.type === 'course' ? 'bg-green-100 text-green-800' :
                              activity.type === 'system' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.type}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* System Alerts */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {systemAlerts.map((alert, index) => (
                        <div key={index} className={`flex items-start p-3 rounded-lg ${
                          alert.severity === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                          alert.severity === 'info' ? 'bg-blue-50 border border-blue-200' :
                          'bg-green-50 border border-green-200'
                        }`}>
                          <div className="flex-shrink-0 mr-3">
                            {alert.severity === 'warning' ? (
                              <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            ) : alert.severity === 'info' ? (
                              <Bell className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Activity className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )
          )}

          {/* Other views would be rendered here based on activeView */}
          {activeView !== 'overview' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <Shield className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {navigationItems.find(item => item.id === activeView)?.name} Section
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
