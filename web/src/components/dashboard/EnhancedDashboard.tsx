'use client';

import React, { useState, useEffect } from 'react';
import { Users, BookOpen, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { apiClient } from '@/services/api';
import { useNotifications } from '@/contexts/NotificationContext';

interface DashboardStats {
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
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  change: number;
  changeType: 'increase' | 'decrease';
  isLoading?: boolean;
}

function StatCard({ title, value, icon, change, changeType, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          <div className="flex items-center mt-2">
            <span
              className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {changeType === 'increase' ? '+' : '-'}{Math.abs(change)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">from last month</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  activity: {
    id: string;
    action: string;
    user: string;
    time: string;
    type: 'user' | 'course' | 'attendance' | 'system';
  };
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'course':
        return 'bg-green-100 text-green-800';
      case 'attendance':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{activity.action}</h4>
        <p className="text-sm text-gray-600">by {activity.user}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">{activity.time}</p>
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
          {activity.type}
        </div>
      </div>
    </div>
  );
}

export function EnhancedDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { success, error } = useNotifications();

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getDashboardStats() as DashboardStats;
      setStats(data);
      setLastRefresh(new Date());
      success('Dashboard Updated', 'Latest data loaded successfully');
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      error('Load Failed', 'Unable to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadDashboardData();
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      change: 12,
      changeType: 'increase' as const,
    },
    {
      title: 'Active Courses',
      value: stats?.totalCourses || 0,
      icon: <BookOpen className="h-6 w-6 text-green-600" />,
      change: 8,
      changeType: 'increase' as const,
    },
    {
      title: 'Students',
      value: stats?.totalStudents || 0,
      icon: <Users className="h-6 w-6 text-purple-600" />,
      change: 15,
      changeType: 'increase' as const,
    },
    {
      title: 'Instructors',
      value: stats?.totalInstructors || 0,
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      change: 3,
      changeType: 'increase' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            change={card.change}
            changeType={card.changeType}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                      <div className="h-5 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
