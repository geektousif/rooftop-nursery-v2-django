import { useRouter } from '@tanstack/react-router'

export function usePermissions() {
  const router = useRouter()
  const auth = router.options.context.auth

  return {
    hasRole: auth.hasRole,
    hasAnyPermission: auth.hasAnyPermission,
    hasPermission: auth.hasPermission,

    isAdmin: auth.isAdmin,
    isVendor: auth.isVendor,

    user: auth.user,
  }
}

// import { useMemo } from 'react'

// function usePermissions() {
//   const { auth } = Route.useRouteContext()

//   const permissions = useMemo(
//     () => ({
//       canEditUsers: auth.hasPermission('users:write'),
//       canDeleteUsers: auth.hasPermission('users:delete'),
//       isAdmin: auth.hasRole('admin'),
//       isModerator: auth.hasAnyRole(['admin', 'moderator']),
//     }),
//     [auth.user?.roles, auth.user?.permissions],
//   )

//   return permissions
// }
