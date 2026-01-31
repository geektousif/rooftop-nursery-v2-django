'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, LoginRequest, LoginResponse } from '@/lib/types'
import { hasPermission, Permission, UserRole } from '@/lib/permissions'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  hasPermission: (permission: Permission) => boolean
  isAdmin: () => boolean
  isVendor: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage/cookie
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already logged in via API call
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        })
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('[v0] Auth initialization error:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data: LoginResponse = await response.json()
      setUser(data.user)
      localStorage.setItem('auth_token', data.token)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_token')
    // Call logout endpoint
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {})
  }

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false
    return hasPermission(user.role as UserRole, permission)
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin'
  }

  const isVendor = (): boolean => {
    return user?.role === 'vendor'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission: checkPermission,
        isAdmin,
        isVendor,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
