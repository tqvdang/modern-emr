import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppointmentScheduler from '../AppointmentScheduler'

// Mock the hooks
jest.mock('@/hooks/useAppointments', () => ({
  useAppointments: () => ({
    createAppointment: jest.fn().mockResolvedValue({
      id: 1,
      patientId: 1,
      providerId: 1,
      startDateTime: '2025-09-28T09:00:00Z',
      endDateTime: '2025-09-28T10:00:00Z',
      appointmentType: 'Initial Evaluation',
      status: 'Scheduled',
    }),
  }),
}))

const mockProps = {
  onClose: jest.fn(),
  selectedPatientId: 1,
  onAppointmentCreated: jest.fn(),
}

describe('AppointmentScheduler Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders appointment scheduler form', () => {
    render(<AppointmentScheduler {...mockProps} />)

    expect(screen.getByText(/schedule appointment/i)).toBeInTheDocument()
    expect(screen.getByText(/appointment details/i)).toBeInTheDocument()
  })

  it('progresses through scheduling steps', async () => {
    const user = userEvent.setup()
    render(<AppointmentScheduler {...mockProps} />)

    // Step 1: Fill appointment details
    await user.selectOptions(
      screen.getByRole('combobox', { name: /appointment type/i }),
      'Initial Evaluation'
    )
    await user.type(
      screen.getByRole('textbox', { name: /description/i }),
      'Initial physiotherapy evaluation'
    )

    // Should be able to proceed to next step
    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).not.toBeDisabled()

    await user.click(nextButton)

    // Step 2: Should show provider selection
    await waitFor(() => {
      expect(screen.getByText(/select provider/i)).toBeInTheDocument()
    })
  })

  it('validates required fields before proceeding', async () => {
    const user = userEvent.setup()
    render(<AppointmentScheduler {...mockProps} />)

    // Try to proceed without filling required fields
    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    // Should show validation messages
    await waitFor(() => {
      expect(screen.getByText(/appointment type is required/i)).toBeInTheDocument()
    })
  })

  it('allows provider selection', async () => {
    const user = userEvent.setup()
    render(<AppointmentScheduler {...mockProps} />)

    // Fill step 1
    await user.selectOptions(
      screen.getByRole('combobox', { name: /appointment type/i }),
      'Initial Evaluation'
    )
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Wait for providers to load and select one
    await waitFor(() => {
      expect(screen.getByText(/dr\. sarah johnson/i)).toBeInTheDocument()
    })

    await user.click(screen.getByText(/dr\. sarah johnson/i))

    // Should proceed to time slot selection
    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(screen.getByText(/select time slot/i)).toBeInTheDocument()
    })
  })

  it('allows time slot selection', async () => {
    const user = userEvent.setup()
    render(<AppointmentScheduler {...mockProps} />)

    // Complete steps 1 and 2
    await user.selectOptions(
      screen.getByRole('combobox', { name: /appointment type/i }),
      'Initial Evaluation'
    )
    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(screen.getByText(/dr\. sarah johnson/i)).toBeInTheDocument()
    })
    await user.click(screen.getByText(/dr\. sarah johnson/i))
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Select a time slot
    await waitFor(() => {
      expect(screen.getByText(/9:00 am/i)).toBeInTheDocument()
    })
    await user.click(screen.getByText(/9:00 am/i))

    // Should be able to proceed to confirmation
    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(screen.getByText(/confirm appointment/i)).toBeInTheDocument()
    })
  })

  it('shows appointment confirmation details', async () => {
    const user = userEvent.setup()
    render(<AppointmentScheduler {...mockProps} />)

    // Complete all steps
    await user.selectOptions(
      screen.getByRole('combobox', { name: /appointment type/i }),
      'Initial Evaluation'
    )
    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(screen.getByText(/dr\. sarah johnson/i)).toBeInTheDocument()
    })
    await user.click(screen.getByText(/dr\. sarah johnson/i))
    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(screen.getByText(/9:00 am/i)).toBeInTheDocument()
    })
    await user.click(screen.getByText(/9:00 am/i))
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Check confirmation details
    await waitFor(() => {
      expect(screen.getByText(/initial evaluation/i)).toBeInTheDocument()
      expect(screen.getByText(/dr\. sarah johnson/i)).toBeInTheDocument()
    })
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<AppointmentScheduler {...mockProps} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('allows navigation back to previous steps', async () => {
    const user = userEvent.setup()
    render(<AppointmentScheduler {...mockProps} />)

    // Go to step 2
    await user.selectOptions(
      screen.getByRole('combobox', { name: /appointment type/i }),
      'Initial Evaluation'
    )
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Should show back button
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })

    // Go back to step 1
    await user.click(screen.getByRole('button', { name: /back/i }))

    await waitFor(() => {
      expect(screen.getByText(/appointment details/i)).toBeInTheDocument()
    })
  })

  it('creates appointment when confirmed', async () => {
    const user = userEvent.setup()
    render(<AppointmentScheduler {...mockProps} />)

    // Complete all steps
    await user.selectOptions(
      screen.getByRole('combobox', { name: /appointment type/i }),
      'Initial Evaluation'
    )
    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(screen.getByText(/dr\. sarah johnson/i)).toBeInTheDocument()
    })
    await user.click(screen.getByText(/dr\. sarah johnson/i))
    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(screen.getByText(/9:00 am/i)).toBeInTheDocument()
    })
    await user.click(screen.getByText(/9:00 am/i))
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Confirm appointment
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm appointment/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /confirm appointment/i }))

    // Should call callbacks
    await waitFor(() => {
      expect(mockProps.onAppointmentCreated).toHaveBeenCalled()
      expect(mockProps.onClose).toHaveBeenCalled()
    })
  })
})