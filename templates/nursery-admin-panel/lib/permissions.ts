// Permission system for role-based access control
export type Permission =
  | 'view_dashboard'
  | 'manage_products'
  | 'manage_orders'
  | 'manage_customers'
  | 'manage_vendors'
  | 'manage_settings'
  | 'view_analytics'
  | 'manage_store_settings'
  | 'create_manual_orders'
  | 'manage_payouts'
  | 'manage_coupons'
  | 'manage_inventory'

export type UserRole = 'admin' | 'vendor'

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard',
    'manage_products',
    'manage_orders',
    'manage_customers',
    'manage_vendors',
    'manage_settings',
    'view_analytics',
    'manage_store_settings',
    'create_manual_orders',
    'manage_payouts',
    'manage_coupons',
    'manage_inventory',
  ],
  vendor: [
    'view_dashboard',
    'manage_products',
    'manage_orders',
    'view_analytics',
    'manage_settings',
  ],
}

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return rolePermissions[userRole]?.includes(permission) ?? false
}

export function getPermissionsByRole(role: UserRole): Permission[] {
  return rolePermissions[role] ?? []
}
