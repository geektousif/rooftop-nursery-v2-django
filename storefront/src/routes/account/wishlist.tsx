import { Navbar } from '@/components/common/navbar'
import { Footer } from '@/components/common/footer'
import { WishlistPage } from '@/components/domains/user-account/wishlist-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/account/wishlist')({
  component: WishlistRoute,
})

export default function WishlistRoute() {
  return (
    <>
      <Navbar />
      <WishlistPage />
      <Footer />
    </>
  )
}
