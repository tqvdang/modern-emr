import { useState, useEffect } from 'react';
import { adminApiClient, User, CreateUserRequest, UpdateUserRequest } from '@/lib/api';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiClient.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
      // Fallback to mock data if API fails
      setUsers([
        {
          id: 1,
          uuid: 'user-1',
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'Administrator',
          status: 'Active',
          lastLogin: '2025-09-07T10:30:00Z',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-09-07T10:30:00Z'
        },
        {
          id: 2,
          uuid: 'user-2',
          username: 'dr_smith',
          email: 'smith@clinic.com',
          firstName: 'Dr. Sarah',
          lastName: 'Smith',
          role: 'Provider',
          status: 'Active',
          lastLogin: '2025-09-07T09:15:00Z',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-09-06T16:45:00Z'
        },
        {
          id: 3,
          uuid: 'user-3',
          username: 'nurse_johnson',
          email: 'johnson@clinic.com',
          firstName: 'Mark',
          lastName: 'Johnson',
          role: 'Staff',
          status: 'Active',
          lastLogin: '2025-09-07T08:00:00Z',
          createdAt: '2025-01-15T00:00:00Z',
          updatedAt: '2025-09-07T08:00:00Z'
        },
        {
          id: 4,
          uuid: 'user-4',
          username: 'receptionist',
          email: 'reception@clinic.com',
          firstName: 'Lisa',
          lastName: 'Williams',
          role: 'Staff',
          status: 'Inactive',
          lastLogin: '2025-09-05T17:30:00Z',
          createdAt: '2025-02-01T00:00:00Z',
          updatedAt: '2025-09-05T17:30:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserRequest): Promise<User | null> => {
    try {
      setError(null);
      const newUser = await adminApiClient.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      console.error('Error creating user:', err);
      return null;
    }
  };

  const updateUser = async (id: number, userData: UpdateUserRequest): Promise<boolean> => {
    try {
      setError(null);
      const updatedUser = await adminApiClient.updateUser(id, userData);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      console.error('Error updating user:', err);
      return false;
    }
  };

  const deleteUser = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await adminApiClient.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      console.error('Error deleting user:', err);
      return false;
    }
  };

  const resetUserPassword = async (id: number): Promise<string | null> => {
    try {
      setError(null);
      const result = await adminApiClient.resetUserPassword(id);
      return result.temporaryPassword;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
      console.error('Error resetting password:', err);
      return null;
    }
  };

  const getUserStats = () => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'Active').length,
      inactive: users.filter(u => u.status === 'Inactive').length,
      admins: users.filter(u => u.role === 'Administrator').length,
      providers: users.filter(u => u.role === 'Provider').length,
      staff: users.filter(u => u.role === 'Staff').length,
    };
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    getUserStats,
  };
};