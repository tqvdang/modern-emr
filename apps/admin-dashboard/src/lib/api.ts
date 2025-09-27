const API_BASE_URL = 'http://localhost:5000/api/v1';

export interface Patient {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  gender: string;
  phoneHome?: string;
  phoneMobile?: string;
  email?: string;
  status: string;
  createdAt: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  gender: string;
  phoneHome?: string;
  phoneMobile?: string;
  email?: string;
}

export interface Appointment {
  id: number;
  uuid: string;
  patientId: number;
  providerId: number;
  startDateTime: string;
  endDateTime: string;
  status: string;
  appointmentType: string;
  priority: string;
  title?: string;
  description?: string;
  patient?: Patient;
}

export interface CreateAppointmentRequest {
  patientId: number;
  providerId: number;
  startDateTime: string;
  endDateTime: string;
  appointmentType: string;
  priority: string;
  title?: string;
  description?: string;
}

// Admin-specific interfaces
export interface User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  isReadOnly: boolean;
  updatedAt: string;
}

export interface UpdateSystemConfigRequest {
  value: string;
}

export interface SystemHealth {
  status: string;
  version: string;
  uptime: number;
  database: {
    status: string;
    responseTime: number;
  };
  redis: {
    status: string;
    responseTime: number;
  };
  services: {
    name: string;
    status: string;
    responseTime?: number;
  }[];
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalPatients: number;
  totalAppointments: number;
  systemAlerts: number;
  apiCallsPerHour: number;
  systemLoad: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  entity: string;
  entityId?: string;
  changes?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface SecurityEvent {
  id: number;
  type: string;
  severity: string;
  description: string;
  ipAddress?: string;
  userId?: number;
  metadata?: Record<string, any>;
  timestamp: string;
  resolved: boolean;
}

class AdminApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token');
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return {} as T;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Basic Patient and Appointment APIs (inherited from staff portal)
  async getPatients(): Promise<Patient[]> {
    return this.request<Patient[]>('/Patients');
  }

  async getAppointments(): Promise<Appointment[]> {
    return this.request<Appointment[]>('/Appointments');
  }

  // User Management APIs (using Providers endpoint for now)
  async getUsers(): Promise<User[]> {
    try {
      // For now, return empty array since Providers endpoint requires auth
      // In the future, this would call '/Providers' after auth is implemented
      return [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }

  async getUser(id: number): Promise<User> {
    try {
      // Placeholder implementation
      throw new Error('User endpoint not implemented');
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  }

  async createUser(user: CreateUserRequest): Promise<User> {
    return this.request<User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: number, user: UpdateUserRequest): Promise<User> {
    return this.request<User>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async resetUserPassword(id: number): Promise<{ temporaryPassword: string }> {
    return this.request<{ temporaryPassword: string }>(`/admin/users/${id}/reset-password`, {
      method: 'POST',
    });
  }

  // System Configuration APIs
  async getSystemConfigs(): Promise<SystemConfig[]> {
    return this.request<SystemConfig[]>('/admin/system/config');
  }

  async getSystemConfig(key: string): Promise<SystemConfig> {
    return this.request<SystemConfig>(`/admin/system/config/${key}`);
  }

  async updateSystemConfig(key: string, config: UpdateSystemConfigRequest): Promise<SystemConfig> {
    return this.request<SystemConfig>(`/admin/system/config/${key}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // System Health and Monitoring
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const health = await this.healthCheck();
      return {
        status: health.status,
        version: '1.0.0',
        uptime: 86400, // 24 hours in seconds (mock value)
        database: {
          status: 'healthy',
          responseTime: 15
        },
        redis: {
          status: 'unknown',
          responseTime: 0
        },
        services: [
          {
            name: 'EMR API',
            status: health.status,
            responseTime: 10
          }
        ]
      };
    } catch (error) {
      console.error('Failed to get system health:', error);
      return {
        status: 'error',
        version: '1.0.0',
        uptime: 0,
        database: { status: 'error', responseTime: 0 },
        redis: { status: 'error', responseTime: 0 },
        services: []
      };
    }
  }

  async getSystemStats(): Promise<SystemStats> {
    try {
      const [patients, appointments, users] = await Promise.all([
        this.getPatients(),
        this.getAppointments(), 
        this.getUsers()
      ]);

      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'Active').length,
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        systemAlerts: 0, // Mock value
        apiCallsPerHour: 1250, // Mock value
        systemLoad: {
          cpu: 45.2,
          memory: 62.8,
          disk: 34.1
        }
      };
    } catch (error) {
      console.error('Failed to get system stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalPatients: 0,
        totalAppointments: 0,
        systemAlerts: 0,
        apiCallsPerHour: 0,
        systemLoad: {
          cpu: 0,
          memory: 0,
          disk: 0
        }
      };
    }
  }

  // Audit and Security APIs
  async getAuditLogs(limit: number = 100, offset: number = 0): Promise<{ logs: AuditLog[], total: number }> {
    return this.request<{ logs: AuditLog[], total: number }>(`/admin/audit/logs?limit=${limit}&offset=${offset}`);
  }

  async getSecurityEvents(limit: number = 50, offset: number = 0): Promise<{ events: SecurityEvent[], total: number }> {
    return this.request<{ events: SecurityEvent[], total: number }>(`/admin/security/events?limit=${limit}&offset=${offset}`);
  }

  async resolveSecurityEvent(id: number): Promise<void> {
    return this.request<void>(`/admin/security/events/${id}/resolve`, {
      method: 'POST',
    });
  }

  // System Maintenance
  async runSystemBackup(): Promise<{ jobId: string }> {
    return this.request<{ jobId: string }>('/admin/system/backup', {
      method: 'POST',
    });
  }

  async getBackupStatus(jobId: string): Promise<{ status: string, progress: number, message?: string }> {
    return this.request<{ status: string, progress: number, message?: string }>(`/admin/system/backup/${jobId}/status`);
  }

  // Authentication APIs
  async login(email: string, password: string): Promise<{ success: boolean, user?: any, token?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_token', data.accessToken);
          localStorage.setItem('admin_refresh_token', data.refreshToken);
          localStorage.setItem('admin_user', JSON.stringify(data.user));
        }
        return { success: true, user: data.user, token: data.accessToken };
      } else {
        const error = await response.json();
        console.error('Login failed:', error);
        return { success: false };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      
      // Call backend logout endpoint
      if (refreshToken) {
        try {
          await fetch(`${API_BASE_URL}/Auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
      
      // Clear local storage
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
    }
  }

  getCurrentUser(): any | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('admin_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // Basic health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const adminApiClient = new AdminApiClient();