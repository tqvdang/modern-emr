import { useState, useEffect } from 'react';
import { patientApiClient, PatientProfile, UpdatePatientProfileRequest } from '@/lib/api';

export const usePatientProfile = () => {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientApiClient.getPatientProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      console.error('Error fetching patient profile:', err);
      // Fallback to mock data if API fails
      setProfile({
        id: 1,
        firstName: 'John',
        lastName: 'Smith',
        middleName: 'Michael',
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        phoneHome: '(555) 123-4567',
        phoneMobile: '(555) 987-6543',
        email: 'john.smith@email.com',
        address: {
          street: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Jane Smith',
          relationship: 'Spouse',
          phone: '(555) 555-0123'
        },
        medicalHistory: {
          allergies: ['Penicillin', 'Shellfish'],
          medications: ['Ibuprofen 400mg', 'Multivitamin'],
          conditions: ['Lower back pain', 'Knee injury (2020)']
        },
        preferences: {
          language: 'en',
          communicationMethod: 'email',
          reminderSettings: {
            email: true,
            sms: true,
            push: false
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: UpdatePatientProfileRequest): Promise<boolean> => {
    try {
      setError(null);
      const updatedProfile = await patientApiClient.updatePatientProfile(updates);
      setProfile(updatedProfile);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      console.error('Error updating patient profile:', err);
      return false;
    }
  };

  const getProfileCompleteness = (): { percentage: number; missing: string[] } => {
    if (!profile) return { percentage: 0, missing: [] };

    const requiredFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phoneMobile'
    ];
    
    const optionalImportantFields = [
      'address.street', 'address.city', 'address.state', 'address.zipCode',
      'emergencyContact.name', 'emergencyContact.phone'
    ];

    const allFields = [...requiredFields, ...optionalImportantFields];
    let filledFields = 0;
    const missing: string[] = [];

    // Check required fields
    requiredFields.forEach(field => {
      const value = field.split('.').reduce((obj: any, key) => obj?.[key], profile);
      if (value && value.toString().trim()) {
        filledFields++;
      } else {
        missing.push(field);
      }
    });

    // Check optional important fields
    optionalImportantFields.forEach(field => {
      const value = field.split('.').reduce((obj: any, key) => obj?.[key], profile);
      if (value && value.toString().trim()) {
        filledFields++;
      } else {
        missing.push(field);
      }
    });

    const percentage = Math.round((filledFields / allFields.length) * 100);
    return { percentage, missing };
  };

  const getAge = (): number | null => {
    if (!profile?.dateOfBirth) return null;
    const birth = new Date(profile.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    getProfileCompleteness,
    getAge,
  };
};