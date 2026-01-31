import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_admin')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasRole(['store_admin', 'super_admin'])) {
      throw redirect({
        to: '/unauthorized',
        search: {
          redirect: location.pathname,
          reason: 'insufficient_role',
        },
      })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div>
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <strong>Admin Area:</strong> You have administrative privileges.
      </div>
      <Outlet />
    </div>
  )
}
