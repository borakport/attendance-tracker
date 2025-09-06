'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Filter, Edit, Trash2, UserPlus, Shield, BookOpen, GraduationCap, Download, Upload, MoreVertical, Eye, Mail, Phone } from 'lucide-react';
import { apiService } from '../../services/api';
import CreateUserModal from '../../components/CreateUserModal';
import UserDetailsModal from '../../components/UserDetailsModal';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = selectedRole !== 'ALL' ? { role: selectedRole } : {};
      const response: any = await apiService.getUsers(params);
      setUsers(response.data || response || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Enhanced mock data
      setUsers([
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1-555-0123',
          role: 'STUDENT',
          emailVerified: true,
          lastLogin: '2025-09-05T10:00:00Z',
          createdAt: '2024-01-15T09:00:00Z',
          isActive: true,
          studentId: 'CS2024001',
          department: 'Computer Science',
          attendanceRate: 92,
          enrolledCourses: 4
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '+1-555-0124',
          role: 'INSTRUCTOR',
          emailVerified: true,
          lastLogin: '2025-09-04T15:30:00Z',
          createdAt: '2023-08-20T14:00:00Z',
          isActive: true,
          department: 'Mathematics',
          coursesTeaching: 3
        },
        {
          id: '3',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          phone: '+1-555-0125',
          role: 'ADMIN',
          emailVerified: true,
          lastLogin: '2025-09-05T09:00:00Z',
          createdAt: '2023-01-01T00:00:00Z',
          isActive: true
        },
        {
          id: '4',
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice@example.com',
          phone: '+1-555-0126',
          role: 'STUDENT',
          emailVerified: false,
          lastLogin: null,
          createdAt: '2024-02-10T11:00:00Z',
          isActive: false,
          studentId: 'CS2024002',
          department: 'Computer Science',
          attendanceRate: 78,
          enrolledCourses: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      await apiService.createUser(userData);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      // Add to mock data for demo
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        emailVerified: false,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      setUsers(prev => [newUser, ...prev]);
    }
  };

  const handleUpdateUser = async (userData: any) => {
    try {
      await apiService.updateUser(userData.id, userData);
      setUsers(prev => prev.map(user => user.id === userData.id ? { ...user, ...userData } : user));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      try {
        await Promise.all(selectedUsers.map(id => apiService.deleteUser(id)));
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
        setSelectedUsers([]);
      } catch (error) {
        console.error('Error deleting users:', error);
      }
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Last Login'],
      ...filteredUsers.map(user => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.role,
        user.isActive ? 'Active' : 'Inactive',
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'INSTRUCTOR':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'STUDENT':
        return <GraduationCap className="w-4 h-4 text-green-600" />;
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

  const sortUsers = (users: any[]) => {
    return [...users].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'name') {
        aValue = `${a.firstName} ${a.lastName}`;
        bValue = `${b.firstName} ${b.lastName}`;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const filteredUsers = sortUsers(
    users.filter((user: any) =>
      (selectedRole === 'ALL' || user.role === selectedRole) &&
      (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
              <p className="text-sm text-gray-600">Manage all system users and their permissions</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportUsers}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              <Upload size={16} />
              <span>Import</span>
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <UserPlus size={20} />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter((u: any) => u.role === 'ADMIN').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Instructors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter((u: any) => u.role === 'INSTRUCTOR').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter((u: any) => u.role === 'STUDENT').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter((u: any) => u.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admins</option>
            <option value="INSTRUCTOR">Instructors</option>
            <option value="STUDENT">Students</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="role">Sort by Role</option>
            <option value="createdAt">Sort by Date</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          {selectedUsers.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete ({selectedUsers.length})</span>
            </button>
          )}
        </div>

        {/* Enhanced Users Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(paginatedUsers.map(user => user.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(prev => [...prev, user.id]);
                            } else {
                              setSelectedUsers(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.studentId && (
                              <div className="text-xs text-gray-400">ID: {user.studentId}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center space-x-1 mb-1">
                            <Mail size={12} />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone size={12} />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRoleIcon(user.role)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                        {user.department && (
                          <div className="text-xs text-gray-500 mt-1">{user.department}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.emailVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.emailVerified ? 'Verified' : 'Pending'}
                          </span>
                          <div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye size={16} />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />
      
      <UserDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        user={selectedUser}
        onUpdate={handleUpdateUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}
