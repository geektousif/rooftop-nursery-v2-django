import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/vendor/products/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/vendor/products/"!</div>
}
