'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Users, PieChart } from 'lucide-react';

interface AttendanceChartProps {
  data: any[];
  type: 'weekly' | 'monthly' | 'course' | 'student';
}

export default function AttendanceChart({ data, type }: AttendanceChartProps) {
  const [viewType, setViewType] = useState<'bar' | 'line' | 'pie'>('bar');

  // Mock chart data generation
  const generateChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      present: Math.floor(Math.random() * 100 + 50),
      late: Math.floor(Math.random() * 20 + 5),
      absent: Math.floor(Math.random() * 30 + 10)
    }));
  };

  const chartData = generateChartData();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Attendance Analytics</h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewType('bar')}
            className={`px-3 py-1 rounded text-sm ${viewType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Bar
          </button>
          <button
            onClick={() => setViewType('line')}
            className={`px-3 py-1 rounded text-sm ${viewType === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Line
          </button>
          <button
            onClick={() => setViewType('pie')}
            className={`px-3 py-1 rounded text-sm ${viewType === 'pie' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Pie
          </button>
        </div>
      </div>

      {/* Simple Bar Chart Visualization */}
      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-12 text-sm font-medium text-gray-600">{item.day}</div>
            <div className="flex-1 flex space-x-1">
              <div 
                className="bg-green-500 rounded" 
                style={{ width: `${(item.present / 150) * 100}%`, height: '20px' }}
                title={`Present: ${item.present}`}
              />
              <div 
                className="bg-yellow-500 rounded" 
                style={{ width: `${(item.late / 150) * 100}%`, height: '20px' }}
                title={`Late: ${item.late}`}
              />
              <div 
                className="bg-red-500 rounded" 
                style={{ width: `${(item.absent / 150) * 100}%`, height: '20px' }}
                title={`Absent: ${item.absent}`}
              />
            </div>
            <div className="w-16 text-sm text-gray-600 text-right">
              {item.present + item.late + item.absent}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Present</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Late</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Absent</span>
        </div>
      </div>
    </div>
  );
}
