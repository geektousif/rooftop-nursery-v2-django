import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
// import type { ProductCreateData, ProductFilters } from '@/types'
import { useAuth } from '_src/features/auth/auth.provider'
import { api } from 'src/api/services'

/**
 * Fetch products list.
 * Automatically uses the correct endpoint based on user role.
 */
export const useProducts = (filters?: any) => {
  const { user } = useAuth()
  const role = user?.role || 'vendor'

  return useQuery({
    queryKey: ['products', role, filters],
    queryFn: async () => {
      const { data } = await api.products.list(role, filters)
      return data
    },
    enabled: !!user, // Only fetch if user is logged in
  })
}

/**
 * Fetch single product.
 */
export const useProduct = (id: string) => {
  const { user } = useAuth()
  const role = user?.role || 'vendor'

  return useQuery({
    queryKey: ['product', role, id],
    queryFn: async () => {
      const { data } = await api.products.get(role, id)
      return data
    },
    enabled: !!id && !!user,
  })
}

/**
 * Create product mutation.
 */
export const useCreateProduct = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const role = user?.role || 'vendor'

  return useMutation({
    mutationFn: (data: any) => {
      return api.products.create(role, data)
    },
    onSuccess: () => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create product')
    },
  })
}

/**
 * Update product mutation.
 */
export const useUpdateProduct = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const role = user?.role || 'vendor'

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      return api.products.update(role, id, data)
    },
    onSuccess: (_, variables) => {
      // Invalidate both list and specific product
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({
        queryKey: ['product', role, variables.id],
      })
      toast.success('Product updated successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update product')
    },
  })
}

/**
 * Delete product mutation.
 */
export const useDeleteProduct = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const role = user?.role || 'vendor'

  return useMutation({
    mutationFn: (id: string) => {
      return api.products.delete(role, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete product')
    },
  })
}

/**
 * Bulk delete products (Admin only).
 */
export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: Array<string>) => {
      return api.products.bulkDelete(ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Products deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete products')
    },
  })
}
