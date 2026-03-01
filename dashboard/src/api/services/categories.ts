import { apiClient } from '../client'

const categoryApi = {
  list: () => apiClient.get('/admin/categories/tree/').then((res) => res.data),
  create: (data: any) =>
    apiClient.post('/admin/categories/', data).then((res) => res.data),
  update: (id: string, data: any) =>
    apiClient.put(`/admin/categories/${id}/`, data).then((res) => res.data),
  delete: (id: string) =>
    apiClient.delete(`/admin/categories/${id}/`).then((res) => res.data),
}

export default categoryApi
