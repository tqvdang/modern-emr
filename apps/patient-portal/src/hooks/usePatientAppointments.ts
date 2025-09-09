import { useState, useEffect } from 'react';
import { 
  patientApiClient, 
  Appointment, 
  CreateAppointmentRequest, 
  AvailableTimeSlot, 
  Provider 
} from '@/lib/api';

export const usePatientAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allAppointments, upcoming] = await Promise.all([
        patientApiClient.getPatientAppointments(),
        patientApiClient.getUpcomingAppointments()
      ]);
      setAppointments(allAppointments);
      setUpcomingAppointments(upcoming);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
      // Fallback to mock data if API fails
      const mockAppointments: Appointment[] = [
        {
          id: 1,
          uuid: 'apt-1',
          patientId: 1,
          providerId: 1,
          startDateTime: '2025-09-08T10:00:00Z',
          endDateTime: '2025-09-08T11:00:00Z',
          status: 'Confirmed',
          appointmentType: 'Physical Therapy Session',
          priority: 'Normal',
          title: 'PT Session - Lower Back',
          description: 'Follow-up physical therapy session for lower back pain',
          provider: {
            id: 1,
            firstName: 'Dr. Sarah',
            lastName: 'Johnson',
            specialization: 'Physical Therapy'
          }
        },
        {
          id: 2,
          uuid: 'apt-2',
          patientId: 1,
          providerId: 2,
          startDateTime: '2025-09-10T14:30:00Z',
          endDateTime: '2025-09-10T15:30:00Z',
          status: 'Pending',
          appointmentType: 'Consultation',
          priority: 'Normal',
          title: 'Consultation - Knee Assessment',
          description: 'Initial consultation for knee pain assessment',
          provider: {
            id: 2,
            firstName: 'Dr. Michael',
            lastName: 'Chen',
            specialization: 'Orthopedics'
          }
        },
        {
          id: 3,
          uuid: 'apt-3',
          patientId: 1,
          providerId: 1,
          startDateTime: '2025-09-05T09:00:00Z',
          endDateTime: '2025-09-05T10:00:00Z',
          status: 'Completed',
          appointmentType: 'Physical Therapy Session',
          priority: 'Normal',
          title: 'PT Session - Initial Assessment',
          description: 'Initial physical therapy assessment and treatment plan',
          provider: {
            id: 1,
            firstName: 'Dr. Sarah',
            lastName: 'Johnson',
            specialization: 'Physical Therapy'
          }
        }
      ];
      
      setAppointments(mockAppointments);
      setUpcomingAppointments(mockAppointments.filter(apt => 
        new Date(apt.startDateTime) > new Date() && apt.status !== 'Completed'
      ));
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      setError(null);
      const providersData = await patientApiClient.getProviders();
      setProviders(providersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
      console.error('Error fetching providers:', err);
      // Fallback to mock data
      setProviders([
        {
          id: 1,
          firstName: 'Dr. Sarah',
          lastName: 'Johnson',
          specialization: 'Physical Therapy',
          bio: 'Experienced physical therapist specializing in musculoskeletal rehabilitation and sports injuries.',
          credentials: ['DPT', 'OCS', 'CSCS'],
          availableAppointmentTypes: ['Initial Evaluation', 'Physical Therapy Session', 'Follow-up'],
          rating: 4.9,
          reviewCount: 127
        },
        {
          id: 2,
          firstName: 'Dr. Michael',
          lastName: 'Chen',
          specialization: 'Orthopedics',
          bio: 'Board-certified orthopedic specialist with expertise in joint replacement and sports medicine.',
          credentials: ['MD', 'Board Certified Orthopedic Surgery'],
          availableAppointmentTypes: ['Consultation', 'Follow-up', 'Surgery Consultation'],
          rating: 4.8,
          reviewCount: 203
        },
        {
          id: 3,
          firstName: 'Dr. Emily',
          lastName: 'Rodriguez',
          specialization: 'Physical Medicine & Rehabilitation',
          bio: 'Specialist in physical medicine and rehabilitation with focus on pain management.',
          credentials: ['MD', 'PM&R Board Certified'],
          availableAppointmentTypes: ['Consultation', 'Injection Therapy', 'Follow-up'],
          rating: 4.7,
          reviewCount: 89
        }
      ]);
    }
  };

  const fetchAvailableSlots = async (providerId?: number, date?: string, appointmentType?: string) => {
    try {
      setError(null);
      const slots = await patientApiClient.getAvailableTimeSlots(providerId, date, appointmentType);
      setAvailableSlots(slots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available slots');
      console.error('Error fetching available slots:', err);
      // Fallback to mock data
      const mockSlots: AvailableTimeSlot[] = [
        {
          startDateTime: '2025-09-09T09:00:00Z',
          endDateTime: '2025-09-09T10:00:00Z',
          providerId: 1,
          providerName: 'Dr. Sarah Johnson',
          appointmentType: 'Physical Therapy Session'
        },
        {
          startDateTime: '2025-09-09T10:30:00Z',
          endDateTime: '2025-09-09T11:30:00Z',
          providerId: 1,
          providerName: 'Dr. Sarah Johnson',
          appointmentType: 'Physical Therapy Session'
        },
        {
          startDateTime: '2025-09-09T14:00:00Z',
          endDateTime: '2025-09-09T15:00:00Z',
          providerId: 2,
          providerName: 'Dr. Michael Chen',
          appointmentType: 'Consultation'
        },
        {
          startDateTime: '2025-09-09T15:30:00Z',
          endDateTime: '2025-09-09T16:30:00Z',
          providerId: 2,
          providerName: 'Dr. Michael Chen',
          appointmentType: 'Consultation'
        }
      ];
      setAvailableSlots(mockSlots);
    }
  };

  const bookAppointment = async (appointmentData: CreateAppointmentRequest): Promise<Appointment | null> => {
    try {
      setBookingLoading(true);
      setError(null);
      const newAppointment = await patientApiClient.bookAppointment(appointmentData);
      
      // Update local state
      setAppointments(prev => [...prev, newAppointment]);
      if (new Date(newAppointment.startDateTime) > new Date()) {
        setUpcomingAppointments(prev => [...prev, newAppointment]);
      }
      
      return newAppointment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
      console.error('Error booking appointment:', err);
      return null;
    } finally {
      setBookingLoading(false);
    }
  };

  const rescheduleAppointment = async (appointmentId: number, newDateTime: string): Promise<boolean> => {
    try {
      setError(null);
      const updatedAppointment = await patientApiClient.rescheduleAppointment(appointmentId, newDateTime);
      
      // Update local state
      setAppointments(prev => prev.map(apt => apt.id === appointmentId ? updatedAppointment : apt));
      setUpcomingAppointments(prev => prev.map(apt => apt.id === appointmentId ? updatedAppointment : apt));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule appointment');
      console.error('Error rescheduling appointment:', err);
      return false;
    }
  };

  const cancelAppointment = async (appointmentId: number, reason?: string): Promise<boolean> => {
    try {
      setError(null);
      await patientApiClient.cancelAppointment(appointmentId, reason);
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'Cancelled' } : apt
      ));
      setUpcomingAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment');
      console.error('Error cancelling appointment:', err);
      return false;
    }
  };

  const getAppointmentStats = () => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    return {
      total: appointments.length,
      upcoming: upcomingAppointments.length,
      completed: appointments.filter(apt => apt.status === 'Completed').length,
      cancelled: appointments.filter(apt => apt.status === 'Cancelled').length,
      thisMonth: appointments.filter(apt => {
        const aptDate = new Date(apt.startDateTime);
        return aptDate >= thisMonth && aptDate < nextMonth;
      }).length,
      nextAppointment: upcomingAppointments
        .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())[0] || null
    };
  };

  const canCancelAppointment = (appointment: Appointment): boolean => {
    const appointmentTime = new Date(appointment.startDateTime);
    const now = new Date();
    const hoursDiff = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Can cancel if appointment is more than 24 hours away and not completed/cancelled
    return hoursDiff > 24 && !['Completed', 'Cancelled'].includes(appointment.status);
  };

  const canRescheduleAppointment = (appointment: Appointment): boolean => {
    const appointmentTime = new Date(appointment.startDateTime);
    const now = new Date();
    const hoursDiff = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Can reschedule if appointment is more than 48 hours away and not completed/cancelled
    return hoursDiff > 48 && !['Completed', 'Cancelled'].includes(appointment.status);
  };

  useEffect(() => {
    fetchAppointments();
    fetchProviders();
  }, []);

  return {
    appointments,
    upcomingAppointments,
    availableSlots,
    providers,
    loading,
    bookingLoading,
    error,
    fetchAppointments,
    fetchProviders,
    fetchAvailableSlots,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    getAppointmentStats,
    canCancelAppointment,
    canRescheduleAppointment,
  };
};