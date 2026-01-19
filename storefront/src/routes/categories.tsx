import { $api } from '@/lib/api/client'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

// const categoriesQueryOptions = $api.queryOptions('get', '/api/v1/category/', {})

const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('http://127.0.0.1:8000/api/v1/category/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return response.json()
    },
  })
export const Route = createFileRoute('/categories')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(categoriesQueryOptions())
  },
})

function RouteComponent() {
  const { data, isLoading, error } = useQuery(categoriesQueryOptions())

  if (!data || isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h1>Categories</h1>
      <ul>
        {data.map((category) => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>
    </div>
  )
}
