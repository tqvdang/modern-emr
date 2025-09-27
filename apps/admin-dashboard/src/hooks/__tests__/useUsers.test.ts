import { renderHook, act, waitFor } from '@testing-library/react'
import { useUsers } from '../useUsers'

// Mock the API client
jest.mock('@/lib/api', () => ({
  adminApiClient: {
    getUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  },
}))

import { adminApiClient } from '@/lib/api'

const mockUsers = [
  {
    id: 1,
    uuid: 'user-1',
    username: 'admin',
    email: 'admin@test.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    uuid: 'user-2',
    username: 'staff',
    email: 'staff@test.com',
    firstName: 'Staff',
    lastName: 'User',
    role: 'staff',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
]

describe('useUsers Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches users on mount', async () => {
    ;(adminApiClient.getUsers as jest.Mock).mockResolvedValue(mockUsers)

    const { result } = renderHook(() => useUsers())

    expect(result.current.loading).toBe(true)
    expect(result.current.users).toEqual([])

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.users).toEqual(mockUsers)
    expect(result.current.error).toBeNull()
    expect(adminApiClient.getUsers).toHaveBeenCalledTimes(1)
  })

  it('handles fetch error', async () => {
    const mockError = new Error('Failed to fetch users')
    ;(adminApiClient.getUsers as jest.Mock).mockRejectedValue(mockError)

    const { result } = renderHook(() => useUsers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.users).toEqual([])
    expect(result.current.error).toBe('Failed to fetch users')
  })

  it('creates a new user', async () => {
    const newUser = {
      id: 3,
      uuid: 'user-3',
      username: 'newuser',
      email: 'new@test.com',
      firstName: 'New',
      lastName: 'User',
      role: 'staff',
      status: 'active',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    }

    ;(adminApiClient.getUsers as jest.Mock).mockResolvedValue(mockUsers)
    ;(adminApiClient.createUser as jest.Mock).mockResolvedValue(newUser)

    const { result } = renderHook(() => useUsers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      const success = await result.current.createUser({
        username: 'newuser',
        email: 'new@test.com',
        firstName: 'New',
        lastName: 'User',
        role: 'staff',
        password: 'password123',
      })
      expect(success).toBe(true)
    })

    expect(adminApiClient.createUser).toHaveBeenCalledWith({
      username: 'newuser',
      email: 'new@test.com',
      firstName: 'New',
      lastName: 'User',
      role: 'staff',
      password: 'password123',
    })

    expect(result.current.users).toContainEqual(newUser)
  })

  it('updates an existing user', async () => {
    const updatedUser = { ...mockUsers[0], firstName: 'Updated' }

    ;(adminApiClient.getUsers as jest.Mock).mockResolvedValue(mockUsers)
    ;(adminApiClient.updateUser as jest.Mock).mockResolvedValue(updatedUser)

    const { result } = renderHook(() => useUsers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      const success = await result.current.updateUser(1, { firstName: 'Updated' })
      expect(success).toBe(true)
    })

    expect(adminApiClient.updateUser).toHaveBeenCalledWith(1, { firstName: 'Updated' })

    const updatedUsers = result.current.users
    expect(updatedUsers.find(u => u.id === 1)?.firstName).toBe('Updated')
  })

  it('deletes a user', async () => {
    ;(adminApiClient.getUsers as jest.Mock).mockResolvedValue(mockUsers)
    ;(adminApiClient.deleteUser as jest.Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useUsers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      const success = await result.current.deleteUser(1)
      expect(success).toBe(true)
    })

    expect(adminApiClient.deleteUser).toHaveBeenCalledWith(1)
    expect(result.current.users.find(u => u.id === 1)).toBeUndefined()
  })

  it('handles create user error', async () => {
    const mockError = new Error('Failed to create user')
    ;(adminApiClient.getUsers as jest.Mock).mockResolvedValue(mockUsers)
    ;(adminApiClient.createUser as jest.Mock).mockRejectedValue(mockError)

    const { result } = renderHook(() => useUsers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      const success = await result.current.createUser({
        username: 'newuser',
        email: 'new@test.com',
        firstName: 'New',
        lastName: 'User',
        role: 'staff',
        password: 'password123',
      })
      expect(success).toBe(false)
    })

    expect(result.current.error).toBe('Failed to create user')
  })

  it('refreshes users list', async () => {
    ;(adminApiClient.getUsers as jest.Mock).mockResolvedValue(mockUsers)

    const { result } = renderHook(() => useUsers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(adminApiClient.getUsers).toHaveBeenCalledTimes(1)

    await act(async () => {
      await result.current.refreshUsers()
    })

    expect(adminApiClient.getUsers).toHaveBeenCalledTimes(2)
  })
})