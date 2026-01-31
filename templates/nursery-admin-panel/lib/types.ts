import { UserRole } from './permissions'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: AuthUser
  token: string
}

// Product Types
export interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  mrp: number
  stock: number
  unit: string
  unitValue: number
  attributes?: Record<string, string>
}

export interface Product {
  id: string
  name: string
  description: string
  sku: string
  images: string[]
  status: 'active' | 'inactive' | 'pending_approval'
  variants: ProductVariant[]
  categories: string[]
  tags: string[]
  vendor?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

// Order Types
export interface OrderItem {
  id: string
  productId: string
  variantId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export interface OrderAddress {
  street: string
  city: string
  state: string
  pincode: string
  country: string
  phone: string
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  shippingAddress: OrderAddress
  subtotal: number
  tax: number
  shippingCost: number
  discount: number
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
  shippedAt?: string
  deliveredAt?: string
}

// Customer Types
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  status: 'active' | 'inactive'
  createdAt: string
}

// Vendor Types
export interface Vendor {
  id: string
  businessName: string
  email: string
  phone: string
  commissionRate: number
  totalProducts: number
  totalRevenue: number
  status: 'pending' | 'approved' | 'suspended'
  createdAt: string
}

// Dashboard Types
export interface DashboardMetrics {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  activeVendors: number
  vendorsChange: number
  totalProducts: number
  productsChange: number
}

// Analytics Types
export interface SalesData {
  date: string
  revenue: number
  orders: number
}
