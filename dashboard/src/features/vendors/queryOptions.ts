import { vendorsApi } from '@/api/services/vendors'
import { queryOptions } from '@tanstack/react-query'

export const getVendorsQueryOptions = queryOptions({
  queryKey: ['vendors'],
  queryFn: () => vendorsApi.list(), // Ensure this returns array of objects
  refetchOnWindowFocus: false,
})
