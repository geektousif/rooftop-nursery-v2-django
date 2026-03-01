import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { DashboardLayout } from '_src/components/layout/DashboardLayout'
import { UserRoles } from 'src/utils/constants'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasRole([UserRoles.ADMIN])) {
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

// function AdminLayout() {
//   return (
//     <div>
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//         <strong>Admin Area:</strong> You have administrative privileges.
//       </div>
//       <Outlet />
//     </div>
//   )
// }
