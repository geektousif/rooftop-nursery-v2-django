import { Navbar } from '@/components/common/navbar'
import { Footer } from '@/components/common/footer'
import { AccountProfilePage } from '@/components/domains/user-account/account-profile-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/account/')({ component: AccountPage })

export default function AccountPage() {
  return (
    <>
      <Navbar />
      <AccountProfilePage />
      <Footer />
    </>
  )
}
