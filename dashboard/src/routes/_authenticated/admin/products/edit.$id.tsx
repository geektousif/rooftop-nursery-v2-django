import { EditProduct } from '@/components/crud/EditProduct'
import { createFileRoute } from '@tanstack/react-router'
import { productDetailQueryOptions } from '@/features/products/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/_authenticated/admin/products/edit/$id')(
  {
    component: RouteComponent,
    loader: ({ context, params }) =>
      context.queryClient.ensureQueryData(productDetailQueryOptions(params.id)), // TODO: get ID from route params
  },
)

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useSuspenseQuery(productDetailQueryOptions(id))

  return <EditProduct product={data} />
}
