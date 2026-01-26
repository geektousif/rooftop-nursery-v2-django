'use client'

import { useState, useEffect } from 'react'
import { CustomLoader } from '@/components/common/custom-loader'
import { ProductsPage } from '@/components/domains/products/products-page'
import { CartDrawer } from '@/components/domains/cart/cart-drawer'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/products/')({ component: Products })

export default function Products() {
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
      <ProductsPage />
      <CartDrawer />
    </>
  )
}
