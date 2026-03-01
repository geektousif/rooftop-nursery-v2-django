import { apiClient } from 'src/api/client'
// import type { Product, ProductCreateData, ProductFilters } from '@/types'

interface ProductListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Array<any>
}

/**
 * Product API - Works for both admin and vendor.
 * Backend handles filtering based on authentication.
 */
export const productApi = {
  /**
   * List products.
   * Backend route:
   * - Admin: GET /admin/products/
   * - Vendor: GET /vendor/products/ (auto-filtered to vendor's products)
   */
  list: (role: string, filters?: any) => {
    const endpoint =
      role === 'vendor' ? '/vendor/products/' : '/admin/products/'
    return apiClient.get<ProductListResponse>(endpoint, { params: filters })
  },

  /**
   * Get single product.
   * Backend route:
   * - Admin: GET /admin/products/:id/
   * - Vendor: GET /vendor/products/:id/ (404 if not owned)
   */
  get: (role: string, id: string) => {
    const endpoint =
      role === 'vendor' ? `/vendor/products/${id}/` : `/admin/products/${id}/`
    return apiClient.get<any>(endpoint)
  },

  /**
   * Create product.
   * Backend route:
   * - Admin: POST /admin/products/ (can set vendor)
   * - Vendor: POST /vendor/products/ (auto-assigns vendor)
   */
  create: (role: string, data: any) => {
    const endpoint =
      role === 'vendor' ? '/vendor/products/' : '/admin/products/'
    return apiClient.post<any>(endpoint, data)
  },

  /**
   * Update product.
   * Backend route:
   * - Admin: PUT /admin/products/:id/ (can update any)
   * - Vendor: PUT /vendor/products/:id/ (403 if not owned)
   */
  update: (role: string, id: string, data: Partial<any>) => {
    const endpoint =
      role === 'vendor' ? `/vendor/products/${id}/` : `/admin/products/${id}/`
    return apiClient.put<any>(endpoint, data)
  },

  /**
   * Delete product.
   * Backend route:
   * - Admin: DELETE /admin/products/:id/ (can delete any)
   * - Vendor: DELETE /vendor/products/:id/ (403 if not owned)
   */
  delete: (role: string, id: string) => {
    const endpoint =
      role === 'vendor' ? `/vendor/products/${id}/` : `/admin/products/${id}/`
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
