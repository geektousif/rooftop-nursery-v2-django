import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { CustomLoader } from '@/components/common/custom-loader'
import { ProductDetailPage } from '@/components/product-detail-page'
import { CartDrawer } from '@/components/domains/cart/cart-drawer'

export const Route = createFileRoute('/products/$id')({
  component: ProductPage,
})

export default function ProductPage() {
  const { id } = Route.useParams()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <CustomLoader />
  }

  return (
    <>
      <ProductDetailPage productId={id} />
      <CartDrawer />
    </>
  )
}
