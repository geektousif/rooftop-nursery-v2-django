import { createFileRoute, redirect } from '@tanstack/react-router'
import { apiClient } from '@/lib/api/client'

export const Route = createFileRoute('/_authenticated/me')({
  loader: async () => {
    try {
      const me = await apiClient.get('/auth/user/')

      return me
    } catch (error) {
      throw redirect({
        to: '/login',
      })
    }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { data } = Route.useLoaderData()

  return (
    <>
      <h1>Me</h1>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}
