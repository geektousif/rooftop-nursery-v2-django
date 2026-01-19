import { Navbar } from '@/components/common/navbar'
import { Footer } from '@/components/common/footer'
import { OrderHistoryPage } from '@/components/domains/user-account/order-history-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/account/orders')({
  component: OrdersPage,
})

export default function OrdersPage() {
  return (
    <>
      <Navbar />
      <OrderHistoryPage />
      <Footer />
    </>
  )
}
