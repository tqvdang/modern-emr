const API_BASE_URL = 'http://localhost:5000';

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

export interface Provider {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  title?: string;
  specialization?: string;
  email?: string;
  phone?: string;
  status: string;
}

export interface AvailableTimeSlot {
  id: string;
  startDateTime: string;
  endDateTime: string;
  duration: number;
  available: boolean;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
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

  // Patient APIs
  async getPatients(): Promise<Patient[]> {
    return this.request<Patient[]>('/Patients');
  }

  async getPatient(id: number): Promise<Patient> {
    return this.request<Patient>(`/Patients/${id}`);
  }

  async createPatient(patient: CreatePatientRequest): Promise<Patient> {
    return this.request<Patient>('/Patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  }

  async updatePatient(id: number, patient: Partial<CreatePatientRequest>): Promise<Patient> {
    return this.request<Patient>(`/Patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patient),
    });
  }

  async deletePatient(id: number): Promise<void> {
    return this.request<void>(`/Patients/${id}`, {
      method: 'DELETE',
    });
  }

  // Appointment APIs
  async getAppointments(): Promise<Appointment[]> {
    return this.request<Appointment[]>('/Appointments');
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return this.request<Appointment[]>(`/Appointments?date=${date}`);
  }

  async createAppointment(appointment: CreateAppointmentRequest): Promise<Appointment> {
    return this.request<Appointment>('/Appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    return this.request<Appointment>(`/Appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const apiClient = new ApiClient();