'use client'

import { useState, useEffect } from 'react'
import { CustomLoader } from '@/components/common/custom-loader'
import { CheckoutSuccessEnhanced } from '@/components/domains/checkout/checkout-success-enhanced'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/checkout/success')({
  component: CheckoutSuccess,
})

export default function CheckoutSuccess() {
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

  return <CheckoutSuccessEnhanced isGuest={true} />
}
