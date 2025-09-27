import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserForm from '../UserForm'

// Mock the validation module
jest.mock('@/lib/validation', () => ({
  validateEmail: (email: string) => email.includes('@'),
  validateRequired: (value: string) => value.length > 0,
}))

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'admin',
  status: 'active',
  lastLogin: '2025-09-27T10:00:00Z'
}

const mockProps = {
  user: mockUser,
  onSave: jest.fn(),
  onCancel: jest.fn(),
  isLoading: false,
}

describe('UserForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders user form with user data', () => {
    render(<UserForm {...mockProps} />)

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('admin')).toBeInTheDocument()
  })

  it('renders empty form when no user provided', () => {
    render(<UserForm {...mockProps} user={undefined} />)

    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue('')
  })

  it('calls onSave with form data when form is submitted', async () => {
    const user = userEvent.setup()
    render(<UserForm {...mockProps} user={undefined} />)

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Jane Smith')
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'jane@example.com')
    await user.selectOptions(screen.getByRole('combobox', { name: /role/i }), 'staff')

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(mockProps.onSave).toHaveBeenCalledWith({
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'staff',
        status: 'active'
      })
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<UserForm {...mockProps} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockProps.onCancel).toHaveBeenCalled()
  })

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup()
    render(<UserForm {...mockProps} user={undefined} />)

    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })

    expect(mockProps.onSave).not.toHaveBeenCalled()
  })

  it('shows loading state when isLoading is true', () => {
    render(<UserForm {...mockProps} isLoading={true} />)

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<UserForm {...mockProps} user={undefined} />)

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'invalid-email')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })

    expect(mockProps.onSave).not.toHaveBeenCalled()
  })

  it('updates existing user data', async () => {
    const user = userEvent.setup()
    render(<UserForm {...mockProps} />)

    // Clear and update name
    const nameInput = screen.getByRole('textbox', { name: /name/i })
    await user.clear(nameInput)
    await user.type(nameInput, 'John Updated')

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(mockProps.onSave).toHaveBeenCalledWith({
        ...mockUser,
        name: 'John Updated'
      })
    })
  })
})