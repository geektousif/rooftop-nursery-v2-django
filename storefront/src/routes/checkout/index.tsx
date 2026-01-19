'use client'

import { useState, useEffect } from 'react'
import { CustomLoader } from '@/components/common/custom-loader'
import { EnhancedCheckoutPage } from '@/components/domains/checkout/enhanced-checkout-page'
import { CartDrawer } from '@/components/domains/cart/cart-drawer'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/checkout/')({ component: Checkout })

export default function Checkout() {
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
      <EnhancedCheckoutPage />
      <CartDrawer />
    </>
  )
}
