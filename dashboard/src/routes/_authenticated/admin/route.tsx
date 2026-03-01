import { UserRoles } from '@/utils/constants'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasRole(UserRoles.ADMIN)) {
      throw redirect({
        to: '/unauthorized',
        search: {
          redirect: location.pathname,
          reason: 'insufficient_role',
        },
      })
    }
  },
  component: Outlet,
})
