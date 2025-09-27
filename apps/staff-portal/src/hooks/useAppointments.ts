import { useState, useEffect } from 'react';
import { apiClient, Appointment, CreateAppointmentRequest } from '@/lib/api';

export const useAppointments = (date?: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = date 
        ? await apiClient.getAppointmentsByDate(date)
        : await apiClient.getAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
      // Fallback to mock data if API fails
      setAppointments([
        {
          id: 1,
          uuid: 'uuid-1',
          patientId: 1,
          providerId: 1,
          startDateTime: '2025-09-07T09:00:00Z',
          endDateTime: '2025-09-07T10:00:00Z',
          status: 'Completed',
          appointmentType: 'Physical Therapy Evaluation',
          priority: 'Normal',
          title: 'John Smith - PT Evaluation',
          patient: {
            id: 1,
            uuid: 'patient-1',
            firstName: 'John',
            lastName: 'Smith',
            gender: 'Male',
            status: 'Active',
            createdAt: '2025-01-01T00:00:00Z'
          }
        },
        {
          id: 2,
          uuid: 'uuid-2',
          patientId: 2,
          providerId: 1,
          startDateTime: '2025-09-07T10:30:00Z',
          endDateTime: '2025-09-07T11:30:00Z',
          status: 'In Progress',
          appointmentType: 'Follow-up Session',
          priority: 'Normal',
          title: 'Maria Garcia - Follow-up',
          patient: {
            id: 2,
            uuid: 'patient-2',
            firstName: 'Maria',
            lastName: 'Garcia',
            gender: 'Female',
            status: 'Active',
            createdAt: '2025-01-01T00:00:00Z'
          }
        },
        {
          id: 3,
          uuid: 'uuid-3',
          patientId: 3,
          providerId: 1,
          startDateTime: '2025-09-07T14:00:00Z',
          endDateTime: '2025-09-07T15:00:00Z',
          status: 'Upcoming',
          appointmentType: 'Initial Consultation',
          priority: 'Normal',
          title: 'Robert Johnson - Initial',
          patient: {
            id: 3,
            uuid: 'patient-3',
            firstName: 'Robert',
            lastName: 'Johnson',
            gender: 'Male',
            status: 'Active',
            createdAt: '2025-01-01T00:00:00Z'
          }
        },
        {
          id: 4,
          uuid: 'uuid-4',
          patientId: 4,
          providerId: 1,
          startDateTime: '2025-09-07T15:30:00Z',
          endDateTime: '2025-09-07T16:30:00Z',
          status: 'Urgent',
          appointmentType: 'Walk-in Assessment',
          priority: 'High',
          title: 'Emergency Patient',
          patient: {
            id: 4,
            uuid: 'patient-4',
            firstName: 'Emergency',
            lastName: 'Patient',
            gender: 'Unknown',
            status: 'Active',
            createdAt: '2025-01-01T00:00:00Z'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: CreateAppointmentRequest): Promise<Appointment | null> => {
    try {
      setError(null);
      const newAppointment = await apiClient.createAppointment(appointmentData);
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
      console.error('Error creating appointment:', err);
      return null;
    }
  };

  const updateAppointmentStatus = async (id: number, status: string): Promise<boolean> => {
    try {
      setError(null);
      const updatedAppointment = await apiClient.updateAppointmentStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? updatedAppointment : a));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
      console.error('Error updating appointment:', err);
      return false;
    }
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => 
      apt.startDateTime.split('T')[0] === today
    );
  };

  const getAppointmentStats = () => {
    const today = getTodayAppointments();
    return {
      total: today.length,
      completed: today.filter(a => a.status === 'Completed').length,
      pending: today.filter(a => a.status === 'Upcoming').length,
      inProgress: today.filter(a => a.status === 'In Progress').length,
      urgent: today.filter(a => a.priority === 'High' || a.status === 'Urgent').length,
    };
  };

  useEffect(() => {
    fetchAppointments();
  }, [date]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointmentStatus,
    getTodayAppointments,
    getAppointmentStats,
  };
};