import { UserRoles } from '@/utils/constants'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      const redirectTo = context.auth.hasRole(UserRoles.ADMIN)
        ? '/admin/dashboard'
        : '/vendor/dashboard'

      // TODO  Redirect to dashboard
      return redirect({ to: redirectTo })
    }
  },
  component: Outlet,
})
