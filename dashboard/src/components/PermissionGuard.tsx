import { usePermissions } from '@/hooks/usePermissions'

interface PermissionGuardProps {
  children: React.ReactNode
  roles?: Array<string>
  permissions?: Array<string>
  requireAll?: boolean
  fallback?: React.ReactNode
}

export function PermissionGuard({
  children,
  roles = [],
  permissions = [],
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const { hasRole, hasPermission } = usePermissions()

  const hasRequiredRoles =
    roles.length === 0 || (requireAll && roles.every((role) => hasRole(role)))

  const hasRequiredPermissions =
    permissions.length === 0 ||
    (requireAll && permissions.every((permission) => hasPermission(permission)))

  if (hasRequiredRoles && hasRequiredPermissions) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
