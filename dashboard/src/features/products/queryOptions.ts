import { productApi } from '@/api/services/products'
import { UserRoles } from '@/utils/constants'
import {
  mutationOptions,
  useQueryClient,
  queryOptions,
} from '@tanstack/react-query'

export const updateProductsMutationOptions = mutationOptions({
  mutationFn: productApi.update,
  onSuccess: () => {
    useQueryClient().invalidateQueries(['products'])
  },
})

export const productDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['products', id],
    queryFn: () => productApi.get(UserRoles.ADMIN, id),
  })
