import { apiClient } from '../client'

export const vendorsApi = {
  /**
   * List vendors.
   * Backend route:
   * - Admin: GET /admin/vendors/
   * - Vendor: GET /vendor/vendors/ (auto-filtered to vendor's vendors)
   */
  list: async () => {
    const res = await apiClient.get('/admin/vendors/')
    console.log('res', res)
    return res.data
  },
}
