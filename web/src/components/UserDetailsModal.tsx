import React from 'react';
import { X, Save, Trash2, Shield, BookOpen, GraduationCap, Mail, Phone, Calendar, MapPin, AlertCircle } from 'lucide-react';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: (userData: any) => void;
  onDelete: (userId: string) => void;
}

export default function UserDetailsModal({ isOpen, onClose, user, onUpdate, onDelete }: UserDetailsModalProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState(user || {});

  React.useEffect(() => {
    setFormData(user || {});
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      onDelete(user.id);
      onClose();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'INSTRUCTOR':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'STUDENT':
        return <GraduationCap className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'INSTRUCTOR':
        return 'bg-blue-100 text-blue-800';
      case 'STUDENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-700">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  {getRoleIcon(user.role)}
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                    user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.emailVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              )}
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="INSTRUCTOR">Instructor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{user.phone}</span>
                      </div>
                    )}
                    {user.dateOfBirth && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{new Date(user.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{user.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Information */}
                {user.role === 'STUDENT' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Student ID</span>
                          <p className="font-semibold">{user.studentId || 'Not assigned'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Department</span>
                          <p className="font-semibold">{user.department || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Enrolled Courses</span>
                          <p className="font-semibold">{user.enrolledCourses || 0}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Attendance Rate</span>
                          <p className="font-semibold text-green-600">{user.attendanceRate || 0}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {user.recentActivity?.map((activity: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-sm">No recent activity</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Created</span>
                      <span className="text-sm font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Last Login</span>
                      <span className="text-sm font-medium">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className={`text-sm font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                      Send Email
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                      Reset Password
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100">
                      View Attendance
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                      Generate Report
                    </button>
                  </div>
                </div>

                {/* Alerts */}
                {user.alerts && user.alerts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h3>
                    <div className="space-y-2">
                      {user.alerts.map((alert: any, index: number) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-red-800">{alert.message}</p>
                            <p className="text-xs text-red-600">{alert.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
