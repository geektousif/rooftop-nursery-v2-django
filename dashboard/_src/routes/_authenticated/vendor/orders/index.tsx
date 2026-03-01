import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/vendor/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/vendor/orders/"!</div>
}
