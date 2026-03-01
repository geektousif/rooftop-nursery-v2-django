import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/admin/products/$productId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/admin/products/$productId"!</div>
}
