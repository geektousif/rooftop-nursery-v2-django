import { Product, Order, Customer, Vendor } from './types'

// Use mock API by default, override with NEXT_PUBLIC_API_URL for production
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/mock'

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const { params, ...fetchOptions } = options

  // Build URL with query params
  const url = new URL(`${API_BASE}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }

  // Add auth token if available
  const token = localStorage.getItem('auth_token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'API Error')
  }

  return response.json()
}

// Products API
export const productsAPI = {
  getAll: (params?: { search?: string; category?: string; status?: string }) => {
    const queryParams: Record<string, string> = {}
    if (params?.search) queryParams.q = params.search
    if (params?.category) queryParams.category = params.category
    if (params?.status) queryParams.status = params.status
    return apiFetch('/products', { params: queryParams })
  },
  getById: (id: string) => {
    // For mock, return product from list
    return apiFetch('/products', { params: {} }).then((data: any) => {
      const product = data.products?.find((p: Product) => p.id === id)
      if (!product) throw new Error('Product not found')
      return product
    })
  },
  create: (data: Partial<Product>) =>
    apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Product>) => {
    // Mock update - return updated product
    return Promise.resolve({ ...data, id })
  },
  delete: (id: string) => {
    // Mock delete
    return Promise.resolve({ success: true })
  },
  getPending: () => apiFetch('/products', { params: { status: 'pending_approval' } }),
}

// Orders API
export const ordersAPI = {
  getAll: (params?: { status?: string; search?: string }) =>
    apiFetch('/orders', { params }),
  getById: (id: string) => {
    // For mock, return order from list
    return apiFetch('/orders').then((data: any) => {
      const order = data.orders?.find((o: Order) => o.id === id)
      if (!order) throw new Error('Order not found')
      return order
    })
  },
  create: (data: Partial<Order>) =>
    apiFetch('/orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Order>) => {
    // Mock update
    return Promise.resolve({ ...data, id })
  },
  updateStatus: (id: string, status: string) => {
    // Mock status update
    return Promise.resolve({ id, status })
  },
  getInvoice: (id: string) => {
    // Mock invoice - would generate PDF in real implementation
    return Promise.resolve({ id, url: '/api/mock/invoices/' + id + '.pdf' })
  },
}

// Customers API
export const customersAPI = {
  getAll: (params?: { search?: string; status?: string }) => {
    const queryParams: Record<string, string> = {}
    if (params?.search) queryParams.q = params.search
    return apiFetch('/customers', { params: queryParams })
  },
  getById: (id: string) => {
    // For mock, return customer from list
    return apiFetch('/customers').then((data: any) => {
      const customer = data.customers?.find((c: Customer) => c.id === id)
      if (!customer) throw new Error('Customer not found')
      return customer
    })
  },
}

// Vendors API
export const vendorsAPI = {
  getAll: (params?: { status?: string }) => apiFetch('/vendors', { params }),
  getById: (id: string) => {
    // For mock, return vendor from list
    return apiFetch('/vendors').then((data: any) => {
      const vendor = data.vendors?.find((v: Vendor) => v.id === id)
      if (!vendor) throw new Error('Vendor not found')
      return vendor
    })
  },
  approve: (id: string) => {
    // Mock approve
    return Promise.resolve({ id, status: 'approved' })
  },
  reject: (id: string) => {
    // Mock reject
    return Promise.resolve({ id, status: 'rejected' })
  },
  getPayouts: () => Promise.resolve([]),
  markPaid: (vendorId: string) => {
    // Mock payout
    return Promise.resolve({ vendorId, status: 'paid' })
  },
}

// Analytics API
export const analyticsAPI = {
  getDashboard: () => apiFetch('/analytics'),
  getSalesData: (params?: { period?: string }) =>
    apiFetch('/analytics', { params }),
  getMetrics: () => apiFetch('/analytics'),
}

// Image Upload API
export const imageAPI = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiFetch('/uploads', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    })
  },
}

export default apiFetch
