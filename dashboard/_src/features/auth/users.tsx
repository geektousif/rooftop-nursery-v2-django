import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/users')({
  beforeLoad: ({ context, location }) => {
    const requiredPermissions = 'users:read'
    if (!context.auth.hasPermission(requiredPermissions)) {
      throw redirect({
        to: '/unauthorized',
        search: {
          redirect: location.href,
          reason: 'insufficient_permissions',
        },
      })
    }
  },
  component: () => <Outlet />,
})
