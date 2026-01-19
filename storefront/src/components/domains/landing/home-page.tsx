import { Navbar } from '@/components/common/navbar'
import { HeroCarousel } from '@/components/domains/landing/hero-carousel'
import { FeaturedProducts } from '@/components/domains/products/featured-products'
import { CategoryCards } from '@/components/domains/category/category-cards'
import { WhyUsSection } from '@/components/domains/landing/why-us-section'
import { Testimonials } from '@/components/domains/landing/testimonials'
import { ContactSection } from '@/components/domains/landing/contact-section'
import { Footer } from '@/components/common/footer'

export function HomePage() {
  return (
    <div id="home" className="min-h-screen">
      <Navbar />
      <main>
        <HeroCarousel />
        <FeaturedProducts />
        <CategoryCards />
        <WhyUsSection />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
      {/* Mobile bottom navigation spacing */}
      <div className="md:hidden h-16" />
    </div>
  )
}
