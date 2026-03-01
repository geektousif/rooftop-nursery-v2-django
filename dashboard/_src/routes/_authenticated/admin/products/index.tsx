import { createFileRoute } from '@tanstack/react-router'
import Products from '_src/features/products/products'

export const Route = createFileRoute('/_authenticated/admin/products/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Products />
}
