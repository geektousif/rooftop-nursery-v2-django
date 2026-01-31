// User & Auth Types
export type UserRole = 'admin_vendor' | 'vendor';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  permissions: string[];
  phone?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Product Types
export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
  unit: string;
  unitValue: number;
  attributes: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categories: string[];
  tags: string[];
  attributes: Record<string, string>;
  variants: ProductVariant[];
  images: ProductImage[];
  status: 'active' | 'inactive' | 'pending';
  vendorId: string;
  vendorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  alt?: string;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  quantity: number;
  price: number;
  subtotal: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderTimelineEvent {
  id: string;
  status: string;
  description: string;
  timestamp: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// Vendor Types
export type VendorStatus = 'pending' | 'active' | 'suspended';

export interface Vendor {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  address: Address;
  status: VendorStatus;
  commissionRate: number;
  totalProducts: number;
  totalRevenue: number;
  createdAt: string;
}

export interface VendorPayout {
  id: string;
  vendorId: string;
  vendorName: string;
  totalSales: number;
  commissionRate: number;
  commissionAmount: number;
  payableAmount: number;
  status: 'pending' | 'paid';
  period: string;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: Address;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  image?: string;
  productCount: number;
}

// Analytics Types
export interface DashboardMetrics {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  activeVendors: number;
  vendorsChange: number;
  totalProducts: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

// Settings Types
export interface StoreSettings {
  storeName: string;
  logo?: string;
  email: string;
  phone: string;
  address: Address;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  minOrderValue?: number;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  order: number;
}

// Inventory Types
export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
  createdBy: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}
