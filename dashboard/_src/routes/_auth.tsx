import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      // TODO  Redirect to dashboard
      return redirect({ to: '/' })
    }
  },

  component: () => <Outlet />,
})
