// src/lib/api/client.ts
import axios from 'axios'
import { notifications } from '@mantine/notifications'
import { env } from '@/env'
import { useAuthStore } from '@/features/auth/auth.provider'

const API_BASE_URL = env.VITE_API_BASE_URL

export const apiClient = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
})

// Helper to get CSRF token from cookie
// function getCsrfToken(): string | null {
//   const name = 'csrftoken'
//   const value = `; ${document.cookie}`
//   const parts = value.split(`; ${name}=`)
//   if (parts.length === 2) {
//     return parts.pop()?.split(';').shift() || null
//   }
//   return null
// }

export const onLogout = () => {
  window.location.href = '/login'
  useAuthStore.getState().clearAuth()
  notifications.show({
    message: 'Session expired. Please login again.',
    color: 'red',
  })
}

// Request interceptor (TODO: add CSRF token for non-GET requests)
apiClient.interceptors.request.use(
  (config) => {
    // Add CSRF token for mutating requests
    //     if (
    //       config.method &&
    //       !['get', 'head', 'options'].includes(config.method.toLowerCase())
    //     ) {
    //       const csrfToken = getCsrfToken()
    //       if (csrfToken) {
    //         config.headers['X-CSRFToken'] = csrfToken
    //       }
    //     }
    //     return config
    //   },

    return config
  },

  (error) => Promise.reject(error),
)

let refreshing = false
let queue: Array<() => void> = []

const refreshEndpoint = '/auth/token/refresh/'

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const status = error.response?.status

    if (status === 401 && !originalRequest.url?.includes(refreshEndpoint)) {
      if (originalRequest._retry) {
        onLogout()
        return Promise.reject(error)
      }

      if (refreshing) {
        // Wait for refresh to complete
        return new Promise((resolve, reject) => {
          queue.push(() => {
            apiClient(originalRequest).then(resolve).catch(reject)
          })
          //   resolve(apiClient(originalRequest))
          // })
        })
      }

      originalRequest._retry = true
      refreshing = true

      try {
        // Attempt to refresh token (uses refresh_token cookie)
        await apiClient.post(refreshEndpoint)

        queue.forEach((cb) => cb())
        queue = []

        // Retry original request
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed - redirect to login
        queue.forEach((cb) => cb())
        queue = []

        onLogout()

        return Promise.reject(refreshError)
      } finally {
        refreshing = false
      }
    }

    // console.log('reporting from axios interceptor: ', status)
    // Handle other errors
    const message =
      error?.response?.data?.errors?.[0]?.detail || 'Something went wrong'

    switch (status) {
      case 403:
        notifications.show({
          message: "You don't have permission to perform this action.",
          color: 'red',
        })
        break
      case 404:
        // Let component handle
        break
      case 500:
        notifications.show({
          message: 'Server error. Please try again later.',
          color: 'red',
        })
        break
      default:
        if (status !== 401) {
          // Don't show error for 401 (already handled)
          notifications.show({ message: message, color: 'red' })
        }
    }

    return Promise.reject(error)
  },
)
