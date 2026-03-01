import { productApi } from '@/api/services/products'
import ProductList from '@/components/crud/ProductTable'
import { UserRoles } from '@/utils/constants'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/products/')({
  //   loader: async () => {
  //     return await productApi.list(UserRoles.ADMIN)
  //   },
  component: RouteComponent,
})

function RouteComponent() {
  return <ProductList />
}
