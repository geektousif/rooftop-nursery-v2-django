import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { AuthState, User, UserRole } from '@/types'

interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<boolean>
  logout: () => void
  hasPermission: (permission: string) => boolean
  isAdmin: () => boolean
  isVendor: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@rooftopnursery.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@rooftopnursery.com',
      name: 'Admin User',
      role: 'admin_vendor',
      permissions: [
        'products.read',
        'products.write',
        'products.delete',
        'products.approve',
        'orders.read',
        'orders.write',
        'orders.cancel',
        'vendors.read',
        'vendors.write',
        'vendors.approve',
        'customers.read',
        'customers.write',
        'analytics.read',
        'settings.read',
        'settings.write',
        'inventory.read',
        'inventory.write',
      ],
      createdAt: '2024-01-01T00:00:00Z',
    },
  },
  'vendor@example.com': {
    password: 'vendor123',
    user: {
      id: '2',
      email: 'vendor@example.com',
      name: 'Green Gardens Nursery',
      role: 'vendor',
      permissions: [
        'products.read',
        'products.write',
        'orders.read',
        'analytics.read',
        'settings.read',
        'settings.write',
        'inventory.read',
        'inventory.write',
      ],
      createdAt: '2024-02-15T00:00:00Z',
    },
  },
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('rooftop_user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch {
        localStorage.removeItem('rooftop_user')
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe = false,
    ): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true }))

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      const mockUser = MOCK_USERS[email.toLowerCase()]
      if (mockUser && mockUser.password === password) {
        const { user } = mockUser

        if (rememberMe) {
          localStorage.setItem('rooftop_user', JSON.stringify(user))
        } else {
          sessionStorage.setItem('rooftop_user', JSON.stringify(user))
        }

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
        return true
      }

      setState((prev) => ({ ...prev, isLoading: false }))
      return false
    },
    [],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('rooftop_user')
    sessionStorage.removeItem('rooftop_user')
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }, [])

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!state.user) return false
      return state.user.permissions.includes(permission)
    },
    [state.user],
  )

  const isAdmin = useCallback((): boolean => {
    return state.user?.role === 'admin_vendor'
  }, [state.user])

  const isVendor = useCallback((): boolean => {
    return state.user?.role === 'vendor'
  }, [state.user])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasPermission,
        isAdmin,
        isVendor,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
