import categoryApi from '@/api/services/categories'
import { queryOptions } from '@tanstack/react-query'

export const getCategoriesQueryOptions = queryOptions({
  queryKey: ['categories'],
  queryFn: () => categoryApi.list(),
  refetchOnWindowFocus: false,
})
