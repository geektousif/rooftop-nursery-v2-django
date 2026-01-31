import { apiClient } from './client'

/**
 * Get the correct API prefix based on user role.
 * This is the KEY to working with separate backend routes.
 */
export const getApiPrefix = (role?: string): string => {
  if (role === 'super_admin' || role === 'store_admin') {
    return '/admin'
  } else if (role === 'vendor') {
    return '/vendor'
  }
  return '' // Fallback for unauthenticated or customer
}

/**
 * Make role-aware API calls.
 * Automatically prefixes the endpoint with the correct role path.
 */
export const makeRoleAwareRequest = <T = any>(
  role: string | undefined,
  endpoint: string,
  options?: any,
) => {
  const prefix = getApiPrefix(role)
  const fullEndpoint = `${prefix}${endpoint}`

  return apiClient.get<T>(fullEndpoint, options)
}
