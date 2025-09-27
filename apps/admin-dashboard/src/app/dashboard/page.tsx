'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiClient, User as ApiUser } from '../../lib/api';

interface SystemMetrics {
  totalUsers: number;
  totalPatients: number;
  totalAppointments: number;
  systemUptime: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

// Helper function to format uptime seconds to readable string
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days} days, ${hours} hours`;
  } else if (hours > 0) {
    return `${hours} hours, ${minutes} minutes`;
  } else {
    return `${minutes} minutes`;
  }
}

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    totalPatients: 0,
    totalAppointments: 0,
    systemUptime: '0 days',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  const tabs = ['overview', 'users', 'reports', 'settings'];

  useEffect(() => {
    // Check authentication on component mount
    if (!adminApiClient.isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Get current user info
    const user = adminApiClient.getCurrentUser();
    setCurrentUser(user);

    const loadData = async () => {
      setLoading(true);
      try {
        // Load system metrics from real API
        const stats = await adminApiClient.getSystemStats();
        setMetrics({
          totalUsers: stats.totalUsers,
          totalPatients: stats.totalPatients,
          totalAppointments: stats.totalAppointments,
          systemUptime: formatUptime(86400), // 24 hours mock for now
        });

        // Load users from real API (currently returns empty array due to auth)
        const apiUsers = await adminApiClient.getUsers();
        const formattedUsers = apiUsers.map((apiUser: ApiUser) => ({
          id: apiUser.id,
          name: `${apiUser.firstName} ${apiUser.lastName}`,
          email: apiUser.email,
          role: apiUser.role || apiUser.userType || 'Staff',
          status: apiUser.status,
          lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' '), // Mock last login
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.error('Failed to load admin dashboard data:', error);
        // Fallback to empty data
        setMetrics({
          totalUsers: 0,
          totalPatients: 0,
          totalAppointments: 0,
          systemUptime: 'Unknown',
        });
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleQuickAction = (action: string) => {
    console.log('Admin action:', action);
  };

  const handleLogout = async () => {
    await adminApiClient.logout();
    router.push('/login');
  };

  if (!adminApiClient.isAuthenticated()) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">EMR Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-8">
              <div className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                      selectedTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-4">
                {currentUser && (
                  <span className="text-sm text-gray-600">
                    Welcome, {currentUser.firstName || currentUser.username}
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
              <p className="mt-1 text-sm text-gray-600">
                Monitor system performance and key metrics.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{metrics.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">🏥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Patients</p>
                    <p className="text-2xl font-semibold text-gray-900">{metrics.totalPatients}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">📅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Appointments</p>
                    <p className="text-2xl font-semibold text-gray-900">{metrics.totalAppointments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">⚡</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">System Uptime</p>
                    <p className="text-lg font-semibold text-gray-900">{metrics.systemUptime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleQuickAction('Add User')}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">➕</span>
                      <div>
                        <p className="font-medium text-gray-900">Add New User</p>
                        <p className="text-sm text-gray-500">Create a new system user</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleQuickAction('System Backup')}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💾</span>
                      <div>
                        <p className="font-medium text-gray-900">Run System Backup</p>
                        <p className="text-sm text-gray-500">Backup system data</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">User logged in</p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">System backup completed</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Database maintenance scheduled</p>
                      <p className="text-xs text-gray-500">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'users' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Manage system users and permissions.
                </p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Add User
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">System Users</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
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
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          No users found. Users endpoint requires authentication.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.lastLogin}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Delete
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
        )}

        {selectedTab === 'reports' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">System Reports</h2>
            <p className="mt-1 text-sm text-gray-600">
              Generate and view system analytics and reports.
            </p>
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-500">Reporting interface coming soon...</p>
              <p className="text-sm text-gray-400 mt-2">This will connect to the EMR backend API at localhost:5000</p>
            </div>
          </div>
        )}

        {selectedTab === 'settings' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
            <p className="mt-1 text-sm text-gray-600">
              Configure system-wide settings and preferences.
            </p>
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-500">Settings interface coming soon...</p>
              <p className="text-sm text-gray-400 mt-2">This will connect to the EMR backend API at localhost:5000</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}