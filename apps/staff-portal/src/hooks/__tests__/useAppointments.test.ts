import { renderHook, act, waitFor } from '@testing-library/react'
import { useAppointments } from '../useAppointments'

// Mock the API client
jest.mock('@/lib/api', () => ({
  apiClient: {
    getAppointments: jest.fn(),
    getAppointmentsByDate: jest.fn(),
    createAppointment: jest.fn(),
    updateAppointmentStatus: jest.fn(),
  },
}))

import { apiClient } from '@/lib/api'

const mockAppointments = [
  {
    id: 1,
    uuid: 'uuid-1',
    patientId: 1,
    providerId: 1,
    startDateTime: '2025-09-27T09:00:00Z',
    endDateTime: '2025-09-27T10:00:00Z',
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
    startDateTime: '2025-09-27T10:30:00Z',
    endDateTime: '2025-09-27T11:30:00Z',
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
]

describe('useAppointments Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches appointments on mount', async () => {
    ;(apiClient.getAppointments as jest.Mock).mockResolvedValue(mockAppointments)

    const { result } = renderHook(() => useAppointments())

    expect(result.current.loading).toBe(true)
    expect(result.current.appointments).toEqual([])

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.appointments).toEqual(mockAppointments)
    expect(result.current.error).toBeNull()
    expect(apiClient.getAppointments).toHaveBeenCalledTimes(1)
  })

  it('fetches appointments by date when date is provided', async () => {
    const testDate = '2025-09-27'
    ;(apiClient.getAppointmentsByDate as jest.Mock).mockResolvedValue(mockAppointments)

    const { result } = renderHook(() => useAppointments(testDate))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(apiClient.getAppointmentsByDate).toHaveBeenCalledWith(testDate)
    expect(result.current.appointments).toEqual(mockAppointments)
  })

  it('handles fetch error gracefully', async () => {
    const mockError = new Error('Failed to fetch appointments')
    ;(apiClient.getAppointments as jest.Mock).mockRejectedValue(mockError)

    const { result } = renderHook(() => useAppointments())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch appointments')
    // Should fallback to mock data when API fails
    expect(result.current.appointments).toHaveLength(4) // Mock fallback data
  })

  it('creates a new appointment', async () => {
    const newAppointment = {
      id: 3,
      uuid: 'uuid-3',
      patientId: 3,
      providerId: 1,
      startDateTime: '2025-09-28T09:00:00Z',
      endDateTime: '2025-09-28T10:00:00Z',
      status: 'Scheduled',
      appointmentType: 'Initial Consultation',
      priority: 'Normal',
      title: 'New Patient - Initial',
    }

    ;(apiClient.getAppointments as jest.Mock).mockResolvedValue(mockAppointments)
    ;(apiClient.createAppointment as jest.Mock).mockResolvedValue(newAppointment)

    const { result } = renderHook(() => useAppointments())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      const createdAppointment = await result.current.createAppointment({
        patientId: 3,
        providerId: 1,
        startDateTime: '2025-09-28T09:00:00Z',
        endDateTime: '2025-09-28T10:00:00Z',
        appointmentType: 'Initial Consultation',
        priority: 'Normal',
      })
      expect(createdAppointment).toEqual(newAppointment)
    })

    expect(apiClient.createAppointment).toHaveBeenCalledWith({
      patientId: 3,
      providerId: 1,
      startDateTime: '2025-09-28T09:00:00Z',
      endDateTime: '2025-09-28T10:00:00Z',
      appointmentType: 'Initial Consultation',
      priority: 'Normal',
    })

    expect(result.current.appointments).toContainEqual(newAppointment)
  })

  it('updates appointment status', async () => {
    ;(apiClient.getAppointments as jest.Mock).mockResolvedValue(mockAppointments)
    ;(apiClient.updateAppointmentStatus as jest.Mock).mockResolvedValue({
      ...mockAppointments[0],
      status: 'Completed'
    })

    const { result } = renderHook(() => useAppointments())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      const success = await result.current.updateAppointmentStatus(1, 'Completed')
      expect(success).toBe(true)
    })

    expect(apiClient.updateAppointmentStatus).toHaveBeenCalledWith(1, 'Completed')

    const updatedAppointment = result.current.appointments.find(a => a.id === 1)
    expect(updatedAppointment?.status).toBe('Completed')
  })

  it('handles create appointment error', async () => {
    const mockError = new Error('Failed to create appointment')
    ;(apiClient.getAppointments as jest.Mock).mockResolvedValue(mockAppointments)
    ;(apiClient.createAppointment as jest.Mock).mockRejectedValue(mockError)

    const { result } = renderHook(() => useAppointments())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      const createdAppointment = await result.current.createAppointment({
        patientId: 3,
        providerId: 1,
        startDateTime: '2025-09-28T09:00:00Z',
        endDateTime: '2025-09-28T10:00:00Z',
        appointmentType: 'Initial Consultation',
        priority: 'Normal',
      })
      expect(createdAppointment).toBeNull()
    })

    expect(result.current.error).toBe('Failed to create appointment')
  })

  it('gets today appointments', async () => {
    const today = new Date().toISOString().split('T')[0]
    const todayAppointments = mockAppointments.filter(apt =>
      apt.startDateTime.split('T')[0] === today
    )

    ;(apiClient.getAppointments as jest.Mock).mockResolvedValue(mockAppointments)

    const { result } = renderHook(() => useAppointments())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const todayApts = result.current.getTodayAppointments()
    expect(todayApts).toEqual(todayAppointments)
  })

  it('calculates appointment statistics', async () => {
    ;(apiClient.getAppointments as jest.Mock).mockResolvedValue(mockAppointments)

    const { result } = renderHook(() => useAppointments())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const stats = result.current.getAppointmentStats()

    expect(stats).toHaveProperty('total')
    expect(stats).toHaveProperty('completed')
    expect(stats).toHaveProperty('pending')
    expect(stats).toHaveProperty('inProgress')
    expect(stats).toHaveProperty('urgent')

    expect(typeof stats.total).toBe('number')
    expect(typeof stats.completed).toBe('number')
    expect(typeof stats.pending).toBe('number')
    expect(typeof stats.inProgress).toBe('number')
    expect(typeof stats.urgent).toBe('number')
  })

  it('refreshes appointments list', async () => {
    ;(apiClient.getAppointments as jest.Mock).mockResolvedValue(mockAppointments)

    const { result } = renderHook(() => useAppointments())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(apiClient.getAppointments).toHaveBeenCalledTimes(1)

    await act(async () => {
      await result.current.fetchAppointments()
    })

    expect(apiClient.getAppointments).toHaveBeenCalledTimes(2)
  })
})