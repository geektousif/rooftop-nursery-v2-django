import { createFileRoute } from '@tanstack/react-router'
import { CartDrawer } from '@/components/domains/cart/cart-drawer'
import { CustomLoader } from '@/components/common/custom-loader'
import { HomePage } from '@/components/domains/landing/home-page'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <CustomLoader />
  }

  return (
    <>
      <HomePage />
      <CartDrawer />
    </>
  )
}
