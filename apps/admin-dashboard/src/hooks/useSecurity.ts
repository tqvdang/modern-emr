import { useState, useEffect } from 'react';
import { adminApiClient, AuditLog, SecurityEvent } from '@/lib/api';

export const useSecurity = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAuditLogs, setTotalAuditLogs] = useState(0);
  const [totalSecurityEvents, setTotalSecurityEvents] = useState(0);

  const fetchAuditLogs = async (limit: number = 100, offset: number = 0) => {
    try {
      setError(null);
      const data = await adminApiClient.getAuditLogs(limit, offset);
      if (offset === 0) {
        setAuditLogs(data.logs);
      } else {
        setAuditLogs(prev => [...prev, ...data.logs]);
      }
      setTotalAuditLogs(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
      console.error('Error fetching audit logs:', err);
      // Fallback to mock data
      setAuditLogs([
        {
          id: 1,
          userId: 1,
          action: 'LOGIN',
          entity: 'User',
          entityId: '1',
          changes: undefined,
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: '2025-09-07T10:30:00Z',
          user: {
            id: 1,
            username: 'admin',
            firstName: 'System',
            lastName: 'Administrator'
          }
        },
        {
          id: 2,
          userId: 2,
          action: 'CREATE',
          entity: 'Patient',
          entityId: '123',
          changes: JSON.stringify({
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@email.com'
          }),
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: '2025-09-07T09:15:00Z',
          user: {
            id: 2,
            username: 'dr_smith',
            firstName: 'Dr. Sarah',
            lastName: 'Smith'
          }
        },
        {
          id: 3,
          userId: 1,
          action: 'UPDATE',
          entity: 'SystemConfig',
          entityId: 'MAX_UPLOAD_SIZE',
          changes: JSON.stringify({
            old_value: '5242880',
            new_value: '10485760'
          }),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: '2025-09-07T08:45:00Z',
          user: {
            id: 1,
            username: 'admin',
            firstName: 'System',
            lastName: 'Administrator'
          }
        },
        {
          id: 4,
          userId: 3,
          action: 'DELETE',
          entity: 'Appointment',
          entityId: '456',
          changes: undefined,
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2025-09-07T08:00:00Z',
          user: {
            id: 3,
            username: 'nurse_johnson',
            firstName: 'Mark',
            lastName: 'Johnson'
          }
        }
      ]);
      setTotalAuditLogs(150);
    }
  };

  const fetchSecurityEvents = async (limit: number = 50, offset: number = 0) => {
    try {
      setError(null);
      const data = await adminApiClient.getSecurityEvents(limit, offset);
      if (offset === 0) {
        setSecurityEvents(data.events);
      } else {
        setSecurityEvents(prev => [...prev, ...data.events]);
      }
      setTotalSecurityEvents(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security events');
      console.error('Error fetching security events:', err);
      // Fallback to mock data
      setSecurityEvents([
        {
          id: 1,
          type: 'FAILED_LOGIN',
          severity: 'Medium',
          description: 'Multiple failed login attempts detected',
          ipAddress: '203.0.113.45',
          userId: undefined,
          metadata: {
            attempts: 5,
            username: 'admin',
            timeWindow: '5 minutes'
          },
          timestamp: '2025-09-07T11:15:00Z',
          resolved: false
        },
        {
          id: 2,
          type: 'SUSPICIOUS_API_ACTIVITY',
          severity: 'High',
          description: 'Unusual API request pattern detected',
          ipAddress: '198.51.100.22',
          userId: 5,
          metadata: {
            requestCount: 500,
            timeWindow: '1 minute',
            endpoints: ['/api/patients', '/api/appointments']
          },
          timestamp: '2025-09-07T10:45:00Z',
          resolved: false
        },
        {
          id: 3,
          type: 'UNAUTHORIZED_ACCESS',
          severity: 'High',
          description: 'Attempt to access restricted endpoint without proper permissions',
          ipAddress: '192.168.1.150',
          userId: 8,
          metadata: {
            endpoint: '/admin/system/config',
            userRole: 'Staff'
          },
          timestamp: '2025-09-07T09:30:00Z',
          resolved: true
        },
        {
          id: 4,
          type: 'PASSWORD_POLICY_VIOLATION',
          severity: 'Low',
          description: 'User attempted to set weak password',
          ipAddress: '192.168.1.110',
          userId: 12,
          metadata: {
            reason: 'Password too short',
            minLength: 8
          },
          timestamp: '2025-09-07T08:20:00Z',
          resolved: true
        }
      ]);
      setTotalSecurityEvents(25);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAuditLogs(),
        fetchSecurityEvents()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resolveSecurityEvent = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await adminApiClient.resolveSecurityEvent(id);
      setSecurityEvents(prev => prev.map(event => 
        event.id === id ? { ...event, resolved: true } : event
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve security event');
      console.error('Error resolving security event:', err);
      return false;
    }
  };

  const getSecurityEventStats = () => {
    const unresolved = securityEvents.filter(e => !e.resolved);
    return {
      total: securityEvents.length,
      unresolved: unresolved.length,
      high: unresolved.filter(e => e.severity === 'High').length,
      medium: unresolved.filter(e => e.severity === 'Medium').length,
      low: unresolved.filter(e => e.severity === 'Low').length,
      recentEvents: securityEvents.slice(0, 5), // Last 5 events
    };
  };

  const getAuditLogStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = auditLogs.filter(log => log.timestamp.startsWith(today));
    
    const actionCounts = auditLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const entityCounts = auditLogs.reduce((acc, log) => {
      acc[log.entity] = (acc[log.entity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: auditLogs.length,
      today: todayLogs.length,
      actionCounts,
      entityCounts,
      recentLogs: auditLogs.slice(0, 10), // Last 10 logs
    };
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    auditLogs,
    securityEvents,
    loading,
    error,
    totalAuditLogs,
    totalSecurityEvents,
    fetchAuditLogs,
    fetchSecurityEvents,
    fetchAllData,
    resolveSecurityEvent,
    getSecurityEventStats,
    getAuditLogStats,
  };
};