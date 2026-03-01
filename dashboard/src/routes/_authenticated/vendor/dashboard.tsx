import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/vendor/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/_vendor/dashboard"!</div>
}
