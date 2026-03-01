import { UserRoles } from '@/utils/constants'
import { apiClient } from '../client'

export const productApi = {
  /**
   * List products.
   * Backend route:
   * - Admin: GET /admin/products/
   * - Vendor: GET /vendor/products/ (auto-filtered to vendor's products)
   */

  list: async (role: string, params?: any) => {
    const endpoint =
      role === UserRoles.VENDOR ? '/vendor/products/' : '/admin/products/'
    const res = await apiClient.get(endpoint, { params })
    console.log('res', res)
    return res.data
  },

  /**
   * Get single product.
   * Backend route: GET /admin/products/:id/ (Admin can get any, Vendor can get owned)
   * Note: Vendors cannot access this endpoint for products they don't own, so it will return 404 instead of 403.
   * This simplifies frontend logic since we can treat 404 as "not found or not owned".
   * */
  get: (role: string, id: string) => {
    const endpoint =
      role === UserRoles.VENDOR
        ? `/vendor/products/${id}/`
        : `/admin/products/${id}/`
    return apiClient.get(endpoint)
  },

  /**
   * Create product.
   * Backend route:
   * - Admin: POST /admin/products/ (can set vendor)
   * - Vendor: POST /vendor/products/ (must set vendor)
   */
  create: (role: string, data: any) => {
    const endpoint =
      role === UserRoles.VENDOR ? '/vendor/products/' : '/admin/products/'
    return apiClient.post(endpoint, data)
  },

  /**
   * Update product.
   * Backend route:
   * - Admin: PUT /admin/products/:id/ (can update any)
   * - Vendor: PUT /vendor/products/:id/ (403 if not owned)
   */
  update: (role: string, id: string, data: any) => {
    const endpoint =
      role === UserRoles.VENDOR
        ? `/vendor/products/${id}/`
        : `/admin/products/${id}/`
    return apiClient.patch(endpoint, data)
  },
}

export const productVariantApi = {
  /**
   * List products.
   * Backend route:
   * - Admin: GET /admin/products/variants/ (can see all)
   * - Vendor: GET /vendor/products/variants/  (auto-filtered to vendor's products)
   */

  list: async (role: string, params?: any) => {
    const endpoint =
      role === UserRoles.VENDOR
        ? '/vendor/products/variants/'
        : '/admin/products/variants/'
    const res = await apiClient.get(endpoint, { params })
    console.log('res', res)
    return res
  },

  /**
   * Get single product.
   * Backend route:
   * - Admin: GET /admin/products/variants/:id/
   * - Vendor: GET /vendor/products/variants/:id/ (404 if not owned)
   */
  get: (role: string, id: string) => {
    const endpoint =
      role === UserRoles.VENDOR
        ? `/vendor/products/variants/${id}/`
        : `/admin/products/variants/${id}/`
    return apiClient.get(endpoint)
  },

  /**
   * Create product.
   * Backend route:
   * - Admin: POST /admin/products/variants/ (can set vendor)
   * - Vendor: POST /vendor/products/variants/  (auto-assigns vendor)
   */
  create: async (role: string, data: any) => {
    const endpoint =
      role === UserRoles.VENDOR
        ? '/vendor/products/variants/'
        : '/admin/products/variants/'
    const res = await apiClient.post(endpoint, data)

    console.log('res', res)

    return res
  },

  /**
   * Update product.
   * Backend route:
   * - Admin: PUT /admin/products/variants/:id/ (can update any)
   * - Vendor: PUT /vendor/products/variants/:id/ (403 if not owned)
   */
  update: async ({
    role,
    id,
    data,
  }: {
    role: string
    id: string
    data: any
  }) => {
    const endpoint =
      role === UserRoles.VENDOR
        ? `/vendor/products/variants/${id}/`
        : `/admin/products/variants/${id}/`
    return await apiClient.patch(endpoint, data)
  },

  /**
   * Delete product.
   * Backend route:
   * - Admin: DELETE /admin/products/:id/ (can delete any)
   * - Vendor: DELETE /vendor/products/:id/ (403 if not owned)
   */
  delete: (role: string, id: string) => {
    const endpoint =
      role === UserRoles.VENDOR
        ? `/vendor/products/variants/${id}/`
        : `/admin/products/variants/${id}/`
    return apiClient.delete(endpoint)
  },

  /**
   * Bulk operations (Admin only).
   * Backend route: POST /admin/products/bulk-delete/
   */
  bulkDelete: (ids: Array<string>) => {
    return apiClient.post('/admin/products/bulk-delete/', { ids })
  },
}
