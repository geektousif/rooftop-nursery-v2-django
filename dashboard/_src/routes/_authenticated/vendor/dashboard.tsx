import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/vendor/dashboard')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { auth } = Route.useRouteContext()

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p className="text-gray-600">Manage all users in the system</p>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            View Users
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">System Settings</h2>
          <p className="text-gray-600">Configure system-wide settings</p>
          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Open Settings
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Reports</h2>
          <p className="text-gray-600">View system reports and analytics</p>
          <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            View Reports
          </button>
        </div>
      </div>

      <div className="mt-8 bg-gray-100 p-4 rounded">
        <h3 className="font-semibold">Your Info:</h3>
        <p>Username: {auth.user?.email}</p>
        <p>Roles: {auth.user?.role}</p>
        {/* <p>Permissions: {auth.user?.permissions.join(', ')}</p> */}
      </div>
    </div>
  )
}
