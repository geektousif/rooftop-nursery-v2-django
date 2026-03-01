import { createFileRoute } from '@tanstack/react-router'
import ProductForm from '@/features/products/product-form'

export const Route = createFileRoute('/_authenticated/admin/products/form')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProductForm />
}
