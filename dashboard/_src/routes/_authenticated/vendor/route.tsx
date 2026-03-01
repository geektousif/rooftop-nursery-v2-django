import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/vendor')({
  beforeLoad: ({ context, location }) => {
    const allowedRoles = ['store_admin', 'super_admin', 'vendor']
    if (!context.auth.hasRole(allowedRoles)) {
      throw redirect({
        to: '/unauthorized',
        search: {
          redirect: location.pathname,
          reason: 'insufficient_role',
        },
      })
    }
  },
  component: ModeratorLayout,
})

function ModeratorLayout() {
  const { auth } = Route.useRouteContext()

  return (
    <div>
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
        <strong>Moderator Area:</strong> Role: {auth.user?.role}
      </div>
      <Outlet />
    </div>
  )
}
