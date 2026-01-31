import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/users/manage')({
  beforeLoad: ({ context }) => {
    // Additional permission check at the page level
    if (!context.auth.hasPermission('users:write')) {
      throw new Error('You need write permissions to manage users')
    }
  },
  component: UserManagement,
})

function UserManagement() {
  const { auth } = Route.useRouteContext()

  const canEdit = auth.hasPermission('users:write')
  const canDelete = auth.hasPermission('users:delete')

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
              <td className="px-6 py-4 whitespace-nowrap">john@example.com</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  User
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {canEdit && (
                  <button className="text-blue-600 hover:text-blue-900 mr-4">
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold text-blue-800">Your Permissions:</h3>
        <ul className="text-blue-700 text-sm">
          {auth.user?.permissions.map((permission) => (
            <li key={permission}>✓ {permission}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
