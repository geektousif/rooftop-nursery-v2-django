import ExampleWithProviders from '@/components/crud/CategoryCRUD'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/categories')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <ExampleWithProviders />
    </div>
  )
}
