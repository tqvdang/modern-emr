const API_BASE_URL = 'http://localhost:5000/api/v1';

// Basic EMR types shared with other apps
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
  notes?: string;
  provider?: {
    id: number;
    firstName: string;
    lastName: string;
    specialization?: string;
  };
}

export interface CreateAppointmentRequest {
  providerId: number;
  startDateTime: string;
  endDateTime: string;
  appointmentType: string;
  description?: string;
}

// Patient-specific types
export interface PatientProfile {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  gender: string;
  phoneHome?: string;
  phoneMobile?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
  };
  preferences?: {
    language: string;
    communicationMethod: string;
    reminderSettings: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

export interface UpdatePatientProfileRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phoneHome?: string;
  phoneMobile?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferences?: {
    language: string;
    communicationMethod: string;
    reminderSettings: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

export interface MedicalRecord {
  id: number;
  appointmentId: number;
  date: string;
  type: string; // 'evaluation', 'treatment', 'note', 'assessment'
  provider: {
    id: number;
    firstName: string;
    lastName: string;
  };
  title: string;
  summary: string;
  details: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    vitals?: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: number;
      weight?: number;
    };
    attachments?: {
      id: string;
      type: 'image' | 'document' | 'audio';
      url: string;
      name: string;
    }[];
  };
  isAccessible: boolean; // Patient may not have access to all details
}

export interface AvailableTimeSlot {
  startDateTime: string;
  endDateTime: string;
  providerId: number;
  providerName: string;
  appointmentType: string;
}

export interface Provider {
  id: number;
  firstName: string;
  lastName: string;
  specialization?: string;
  bio?: string;
  credentials?: string[];
  availableAppointmentTypes: string[];
  rating?: number;
  reviewCount?: number;
}

export interface Bill {
  id: number;
  appointmentId: number;
  date: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  description: string;
  services: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  payments: {
    id: number;
    date: string;
    amount: number;
    method: string;
    status: string;
  }[];
}

export interface Message {
  id: number;
  fromType: 'patient' | 'provider' | 'staff';
  fromName: string;
  toType: 'patient' | 'provider' | 'staff';
  toName: string;
  subject: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
}

export interface SendMessageRequest {
  recipientId: number;
  recipientType: 'provider' | 'staff';
  subject: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

class PatientApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add patient authentication header when auth is implemented
        // 'Authorization': `Bearer ${getPatientToken()}`,
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

  // Patient Profile APIs - Using available backend endpoints
  async getPatientProfile(): Promise<PatientProfile> {
    try {
      // For now, get all patients and return the first one (simulating logged-in patient)
      // In a real app, this would be based on the authenticated patient ID
      const patients = await this.request<any[]>('/Patients');
      if (patients && patients.length > 0) {
        const patient = patients[0]; // Simulate logged-in patient
        
        // Transform backend patient data to PatientProfile format
        return {
          id: patient.id,
          firstName: patient.firstName || 'John',
          lastName: patient.lastName || 'Smith',
          middleName: patient.middleName,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          phoneHome: patient.phoneHome,
          phoneMobile: patient.phoneMobile,
          email: patient.email,
          address: {
            street: patient.street,
            city: patient.city,
            state: patient.state,
            zipCode: patient.postalCode,
            country: patient.countryCode || 'USA'
          },
          emergencyContact: {
            name: patient.emergencyContactName || '',
            relationship: patient.emergencyContactRelationship || '',
            phone: patient.emergencyContactPhone || ''
          },
          medicalHistory: {
            allergies: [],
            medications: [],
            conditions: []
          },
          preferences: {
            language: 'en',
            communicationMethod: 'email',
            reminderSettings: {
              email: patient.hipaaEmailAllowed || false,
              sms: patient.hipaaSmsAllowed || false,
              push: false
            }
          }
        };
      }
      
      // Fallback if no patients found
      throw new Error('No patient data available');
    } catch (error) {
      console.error('Failed to fetch patient profile:', error);
      throw error;
    }
  }

  async updatePatientProfile(profile: UpdatePatientProfileRequest): Promise<PatientProfile> {
    // For now, just return the current profile with updates
    // In a real implementation, this would update the patient record
    const currentProfile = await this.getPatientProfile();
    return {
      ...currentProfile,
      ...profile,
      address: profile.address ? { ...currentProfile.address, ...profile.address } : currentProfile.address,
      emergencyContact: profile.emergencyContact ? { ...currentProfile.emergencyContact, ...profile.emergencyContact } : currentProfile.emergencyContact,
      preferences: profile.preferences ? { ...currentProfile.preferences, ...profile.preferences } : currentProfile.preferences
    };
  }

  // Appointment APIs - Using available backend endpoints
  async getPatientAppointments(): Promise<Appointment[]> {
    try {
      // Get all appointments and filter for the current patient (simulated as patient ID 1)
      const allAppointments = await this.request<any[]>('/Appointments');
      const patientId = 1; // Simulate logged-in patient
      
      // Filter appointments for this patient and transform to expected format
      return allAppointments
        .filter(apt => apt.patientId === patientId)
        .map(apt => ({
          id: apt.id,
          uuid: apt.uuid,
          patientId: apt.patientId,
          providerId: apt.providerId,
          startDateTime: apt.startDateTime,
          endDateTime: apt.endDateTime,
          status: apt.status,
          appointmentType: apt.appointmentType,
          priority: apt.priority || 'Normal',
          title: apt.title,
          description: apt.description,
          provider: apt.patient ? undefined : {
            id: apt.providerId,
            firstName: 'Provider',
            lastName: 'Name',
            specialization: 'Physical Therapy'
          }
        }));
    } catch (error) {
      console.error('Failed to fetch patient appointments:', error);
      throw error;
    }
  }

  async getUpcomingAppointments(): Promise<Appointment[]> {
    try {
      const allAppointments = await this.getPatientAppointments();
      const now = new Date();
      
      return allAppointments.filter(apt => {
        const aptDate = new Date(apt.startDateTime);
        return aptDate > now && apt.status !== 'Completed' && apt.status !== 'Cancelled';
      });
    } catch (error) {
      console.error('Failed to fetch upcoming appointments:', error);
      throw error;
    }
  }

  async bookAppointment(appointment: CreateAppointmentRequest): Promise<Appointment> {
    return this.request<Appointment>('/patient/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  }

  async rescheduleAppointment(appointmentId: number, newDateTime: string): Promise<Appointment> {
    return this.request<Appointment>(`/patient/appointments/${appointmentId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ startDateTime: newDateTime }),
    });
  }

  async cancelAppointment(appointmentId: number, reason?: string): Promise<void> {
    return this.request<void>(`/patient/appointments/${appointmentId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // Provider and Scheduling APIs - Using available backend endpoints  
  async getProviders(): Promise<Provider[]> {
    try {
      // For now, the backend doesn't have provider endpoints that work without auth
      // So we'll return mock data consistent with the appointments
      return [
        {
          id: 1,
          firstName: 'Dr. Sarah',
          lastName: 'Johnson',
          specialization: 'Physical Therapy',
          bio: 'Experienced physical therapist specializing in musculoskeletal rehabilitation.',
          credentials: ['DPT', 'OCS'],
          availableAppointmentTypes: ['Physical Therapy Evaluation', 'Follow-up Session'],
          rating: 4.9,
          reviewCount: 127
        }
      ];
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      throw error;
    }
  }

  async getAvailableTimeSlots(providerId?: number, date?: string, appointmentType?: string): Promise<AvailableTimeSlot[]> {
    const params = new URLSearchParams();
    if (providerId) params.append('providerId', providerId.toString());
    if (date) params.append('date', date);
    if (appointmentType) params.append('appointmentType', appointmentType);
    
    return this.request<AvailableTimeSlot[]>(`/patient/availability?${params.toString()}`);
  }

  // Medical Records APIs
  async getMedicalRecords(): Promise<MedicalRecord[]> {
    return this.request<MedicalRecord[]>('/patient/records');
  }

  async getMedicalRecord(recordId: number): Promise<MedicalRecord> {
    return this.request<MedicalRecord>(`/patient/records/${recordId}`);
  }

  // Billing APIs
  async getBills(): Promise<Bill[]> {
    return this.request<Bill[]>('/patient/bills');
  }

  async getBill(billId: number): Promise<Bill> {
    return this.request<Bill>(`/patient/bills/${billId}`);
  }

  async payBill(billId: number, paymentMethod: string, amount: number): Promise<{ success: boolean, transactionId: string }> {
    return this.request<{ success: boolean, transactionId: string }>(`/patient/bills/${billId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, amount }),
    });
  }

  // Communication APIs
  async getMessages(): Promise<Message[]> {
    return this.request<Message[]>('/patient/messages');
  }

  async getMessage(messageId: number): Promise<Message> {
    return this.request<Message>(`/patient/messages/${messageId}`);
  }

  async sendMessage(message: SendMessageRequest): Promise<Message> {
    return this.request<Message>('/patient/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    return this.request<void>(`/patient/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const patientApiClient = new PatientApiClient();