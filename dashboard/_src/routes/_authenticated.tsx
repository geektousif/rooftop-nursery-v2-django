import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'
import { apiClient } from 'src/api/client'
import { fetchUser } from '_src/features/auth/auth.api'
import { DashboardLayout } from '_src/components/layout/DashboardLayout'
// import { AuthProvider } from '@/contexts/AuthContext'

// Session validation interval: 30 minutes
// const MAX_SESSION_AGE = 55 * 60 * 1000 // 55 minutes in milliseconds

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    const { auth } = context

    if (!auth.isAuthenticated || !auth.user) {
      throw redirect({
        to: '/login',
        search: {
          // Save current location for redirect after login
          redirect: location.pathname,
        },
      })
    }

    // const now = Date.now()
    // const sessionAge = auth.lastValidatedAt
    //   ? now - auth.lastValidatedAt
    //   : Infinity

    // // Proactively validate/refresh if session is potentially stale
    // if (sessionAge > MAX_SESSION_AGE) {
    //   console.log('⏰ Proactively validating session...')

    //   try {
    //     // Validate session with backend
    //     const { data } = await fetchUser()
    //     console.log('DATA', data)

    //     // Update user data and timestamp
    //     // Success - update user and timestamp
    //     auth.setUser(data)
    //     console.log('✅ Session refreshed proactively')
    //   } catch (error: any) {
    //     // Clear auth state
    //     // Only logout if it's actually a 401 (refresh token expired)
    //     if (error?.response?.status === 401) {
    //       console.log('❌ Refresh token expired, logging out')
    //       auth.clearAuth()
    //       toast.error('Session expired. Please login again.')
    //       throw redirect({
    //         to: '/login',
    //         search: { redirect: location.pathname, session_expired: 'true' },
    //       })
    //     }
    //     // For other errors (network, 500, etc.), log but allow through
    //     // The interceptor will handle them on actual API calls
    //     console.warn(
    //       '⚠️ Session validation failed, but allowing through:',
    //       error.message,
    //     )
    //     // User can still navigate, and interceptor will handle issues on next API call
    //   }
    // } else {
    //   console.log(
    //     `✅ Session still fresh (${Math.floor(sessionAge / 1000 / 60)}m old)`,
    //   )
    // }
  },
  component: () => <DashboardLayout />,
})
