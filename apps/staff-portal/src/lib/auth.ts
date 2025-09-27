// Authentication and Authorization System
// This provides a foundation for JWT-based authentication across all EMR applications

export interface User {
  id: number;
  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Administrator' | 'Provider' | 'Staff' | 'Patient';
  permissions: string[];
  facilityId?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

class AuthService {
  private readonly TOKEN_KEY = 'emr_token';
  private readonly REFRESH_TOKEN_KEY = 'emr_refresh_token';
  private readonly USER_KEY = 'emr_user';

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Store tokens securely
      this.setToken(data.token);
      this.setRefreshToken(data.refreshToken);
      this.setUser(data.user);

      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setToken(data.token);
      
      return data.token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuth();
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const newToken = await this.refreshToken();
          if (newToken) {
            return this.getCurrentUser(); // Retry with new token
          }
        }
        throw new Error('Failed to get current user');
      }

      const user = await response.json();
      this.setUser(user);
      return user;
    } catch (error) {
      console.error('Get current user failed:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  hasPermission(permission: string): boolean {
    const user = this.getUser();
    return user?.permissions?.includes(permission) || false;
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  }

  // Token management
  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  private setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  // HTTP interceptor helper
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Role-based access control permissions
export const PERMISSIONS = {
  // Patient management
  PATIENTS_READ: 'patients:read',
  PATIENTS_WRITE: 'patients:write',
  PATIENTS_DELETE: 'patients:delete',
  
  // Appointment management  
  APPOINTMENTS_READ: 'appointments:read',
  APPOINTMENTS_WRITE: 'appointments:write',
  APPOINTMENTS_DELETE: 'appointments:delete',
  
  // Medical records
  RECORDS_READ: 'records:read',
  RECORDS_WRITE: 'records:write',
  
  // Administration
  ADMIN_USERS: 'admin:users',
  ADMIN_SYSTEM: 'admin:system',
  ADMIN_SECURITY: 'admin:security',
  ADMIN_REPORTS: 'admin:reports',
  
  // Billing
  BILLING_READ: 'billing:read',
  BILLING_WRITE: 'billing:write',
} as const;

// Role definitions with default permissions
export const ROLES = {
  Administrator: [
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.PATIENTS_WRITE,
    PERMISSIONS.PATIENTS_DELETE,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_WRITE,
    PERMISSIONS.APPOINTMENTS_DELETE,
    PERMISSIONS.RECORDS_READ,
    PERMISSIONS.RECORDS_WRITE,
    PERMISSIONS.ADMIN_USERS,
    PERMISSIONS.ADMIN_SYSTEM,
    PERMISSIONS.ADMIN_SECURITY,
    PERMISSIONS.ADMIN_REPORTS,
    PERMISSIONS.BILLING_READ,
    PERMISSIONS.BILLING_WRITE,
  ],
  Provider: [
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.PATIENTS_WRITE,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_WRITE,
    PERMISSIONS.RECORDS_READ,
    PERMISSIONS.RECORDS_WRITE,
    PERMISSIONS.BILLING_READ,
  ],
  Staff: [
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.PATIENTS_WRITE,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_WRITE,
    PERMISSIONS.BILLING_READ,
  ],
  Patient: [
    // Patients have limited access to their own data
  ],
} as const;

export const authService = new AuthService();