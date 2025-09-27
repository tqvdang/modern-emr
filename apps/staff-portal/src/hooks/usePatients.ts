import { useState, useEffect } from 'react';
import { apiClient, Patient, CreatePatientRequest } from '@/lib/api';

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPatients();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patients');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (patientData: CreatePatientRequest): Promise<Patient | null> => {
    try {
      setError(null);
      const newPatient = await apiClient.createPatient(patientData);
      setPatients(prev => [...prev, newPatient]);
      return newPatient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create patient');
      console.error('Error creating patient:', err);
      return null;
    }
  };

  const updatePatient = async (id: number, patientData: Partial<CreatePatientRequest>): Promise<boolean> => {
    try {
      setError(null);
      const updatedPatient = await apiClient.updatePatient(id, patientData);
      setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patient');
      console.error('Error updating patient:', err);
      return false;
    }
  };

  const deletePatient = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await apiClient.deletePatient(id);
      setPatients(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete patient');
      console.error('Error deleting patient:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
  };
};