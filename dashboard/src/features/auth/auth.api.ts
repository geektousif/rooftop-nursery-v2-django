import { toast } from 'sonner'
import { apiClient } from '@/lib/api/client'

export const login = (email: string, password: string) => {
  return apiClient.post('/auth/login/', { email, password })
}

export const fetchUser = () => {
  return apiClient.get('/auth/user/')
}
