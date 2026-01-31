import { createStore, useStore } from 'zustand'
import { createContext, useContext, useState } from 'react'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { login } from './auth.api'
import type { PropsWithChildren } from 'react'
import type { StoreApi } from 'zustand'
import { apiClient } from '@/lib/api/client'

interface User {
  id: string
  email: string
  full_name: string
  role: 'super_admin' | 'admin' | 'vendor'
  permissions: Array<string>
  vendor?: {
    id: string
    business_name: string
    is_platform_vendor: boolean
  }
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  lastValidatedAt: number | null // timestamp

  // forceLogout: () => Promise<void>
  // Actions
  setUser: (user: User) => void
  clearAuth: () => void
  updateLastValidatedAt: () => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>

  // Permission helpers

  hasRole: (role: string | Array<string>) => boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: Array<string>) => boolean
  isAdmin: () => boolean
  isVendor: () => boolean
}

// export const useAuthStore = create<AuthState>((set, get) => ({
//   user: null,
//   isLoading: true,
//   isAuthenticated: false,

//   login: async (email, password) => {
//     const { data } = await apiClient.post('/auth/login/', { email, password })
//     set({ user: data.user, isAuthenticated: true })
//   },

//   logout: async () => {
//     await apiClient.post('/auth/logout/')
//     set({ user: null, isAuthenticated: false })
//   },

//   fetchUser: async () => {
//     try {
//       set({ isLoading: true })
//       const { data } = await apiClient.get('/auth/user/')
//       set({ user: data, isAuthenticated: true, isLoading: false })
//     } catch (error) {
//       set({ user: null, isAuthenticated: false, isLoading: false })
//     }
//   },

//   hasPermission: (permission) => {
//     const { user } = get()
//     return user?.permissions?.includes(permission) || false
//   },
// }))

const AuthContext = createContext<StoreApi<AuthState> | null>(null)

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [store] = useState(() =>
    createStore<AuthState>()(
      persist(
        (set, get) => ({
          user: null,
          isAuthenticated: false,
          lastValidatedAt: null,

          setUser: (user) =>
            set({
              user,
              isAuthenticated: true,
              lastValidatedAt: Date.now(),
            }),

          clearAuth: () =>
            set({
              user: null,
              isAuthenticated: false,
              lastValidatedAt: null,
            }),

          updateLastValidatedAt: () => set({ lastValidatedAt: Date.now() }),

          login: async (email: string, password: string) => {
            const { data } = await login(email, password)

            // if (!data.user) {
            //   toast.error('Invalid credentials')
            //   return
            // }
            console.log(data)

            set({
              user: data.user,
              isAuthenticated: true,
              lastValidatedAt: Date.now(),
            })
          },

          logout: async () => {
            try {
              await apiClient.post('/auth/logout/')
            } catch (error) {
              console.error('Logout error:', error)
            } finally {
              set({
                user: null,
                isAuthenticated: false,
                lastValidatedAt: null,
              })
            }
          },

          // Permission helpers
          hasRole: (role: string | Array<string>) => {
            const { user } = get()
            if (!user) return false

            if (Array.isArray(role)) {
              return role.includes(user.role)
            }
            return user.role === role
          },

          hasPermission: (permission: string) => {
            const { user } = get()
            if (!user?.permissions) return false
            if (user.permissions.includes('*')) return true

            return user.permissions.includes(permission)
          },

          hasAnyPermission: (permissions: Array<string>) => {
            const { user } = get()
            if (!user) return false
            return permissions.some((perm) => user.permissions.includes(perm))
          },

          isAdmin: () => {
            const { user } = get()
            if (!user) return false
            return ['super_admin', 'store_admin'].includes(user.role)
          },

          isVendor: () => {
            const { user } = get()
            if (!user) return false
            return ['vendor', 'store_admin', 'super_admin'].includes(user.role)
          },
        }),
        {
          name: 'auth-storage', // Key in sessionStorage
          // Use sessionStorage (cleared when browser closes)
          // Change to localStorage if you want persistence across browser restarts
          storage: {
            getItem: (name) => {
              const str = sessionStorage.getItem(name)
              return str ? JSON.parse(str) : null
            },
            setItem: (name, value) => {
              sessionStorage.setItem(name, JSON.stringify(value))
            },
            removeItem: (name) => {
              sessionStorage.removeItem(name)
            },
          },
          // Only persist these fields (not functions)
          partialize: (state) => ({
            user: state.user,
            isAuthenticated: state.isAuthenticated,
            lastValidatedAt: state.lastValidatedAt,
          }),
        },
      ),
    ),
  )

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>
}

function useAuthStore<T>(selector: (state: AuthState) => T) {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuthStore must be used within a <AuthProvider />')
  }

  return useStore(context, selector)
}

export const useAuth = () => useAuthStore((state) => state)

// CRITICAL: Export getState for use in TanStack Router beforeLoad
export function getAuthState(): AuthState {
  // This won't work directly - need workaround
  throw new Error(
    'Use useAuthStore.getState() is not possible with context pattern. Use router context instead.',
  )
}

export { AuthProvider, useAuthStore }
