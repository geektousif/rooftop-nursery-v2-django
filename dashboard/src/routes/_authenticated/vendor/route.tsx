import { UserRoles } from '@/utils/constants'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/vendor')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasRole([UserRoles.ADMIN, UserRoles.VENDOR])) {
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
