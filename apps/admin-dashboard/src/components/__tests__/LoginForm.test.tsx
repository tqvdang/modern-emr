import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../auth/LoginForm'

// Mock the API client
jest.mock('@/lib/api', () => ({
  adminApiClient: {
    login: jest.fn(),
  },
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Mock useRouter
const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

import { adminApiClient } from '@/lib/api'

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form elements', () => {
    render(<LoginForm />)

    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('submits form with email and password', async () => {
    const user = userEvent.setup()
    const mockLoginResponse = {
      user: { id: 1, email: 'admin@test.com', role: 'admin' },
      token: 'mock-token'
    }

    ;(adminApiClient.login as jest.Mock).mockResolvedValue(mockLoginResponse)

    render(<LoginForm />)

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'admin@test.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(adminApiClient.login).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'password123'
      })
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('adminToken', 'mock-token')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    expect(adminApiClient.login).not.toHaveBeenCalled()
  })

  it('shows error message for invalid credentials', async () => {
    const user = userEvent.setup()
    const mockError = new Error('Invalid credentials')

    ;(adminApiClient.login as jest.Mock).mockRejectedValue(mockError)

    render(<LoginForm />)

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'wrong@test.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })

    expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows loading state during login attempt', async () => {
    const user = userEvent.setup()
    let resolveLogin: (value: any) => void
    const loginPromise = new Promise(resolve => {
      resolveLogin = resolve
    })

    ;(adminApiClient.login as jest.Mock).mockReturnValue(loginPromise)

    render(<LoginForm />)

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'admin@test.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()

    // Resolve the promise to finish the test
    resolveLogin!({
      user: { id: 1, email: 'admin@test.com', role: 'admin' },
      token: 'mock-token'
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'invalid-email')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })

    expect(adminApiClient.login).not.toHaveBeenCalled()
  })
})