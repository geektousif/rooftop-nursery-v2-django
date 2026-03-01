import { apiClient } from '../client'

export const authenticateImageUploadApi = async () => {
  const res = await apiClient.get('/admin/images/authenticate/')
  return res
}

export const uploadImageApi = async (data: any) => {
  const res = await apiClient.post('/admin/images/', data)
  return res
}

export const deleteImageApi = async (id: string) => {
  const res = await apiClient.delete(`/admin/images/${id}/`)
  return res
}

export const setPrimaryImageApi = async (id: string) => {
  const res = await apiClient.patch(`/admin/images/${id}/set_primary_image/`)
  return res
}
