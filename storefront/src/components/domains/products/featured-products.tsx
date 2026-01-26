'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/domains/products/product-card'
import { mockProducts } from '@/lib/mock-data'
import { useState } from 'react'
import { motion } from 'framer-motion'

export function FeaturedProducts() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const featuredProducts = mockProducts.filter((product) => product.featured)

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  }

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + 1 >= featuredProducts.length ? 0 : prev + 1,
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? featuredProducts.length - 1 : prev - 1,
    )
  }

  return (
    <section id="products" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
              Featured Products
            </h2>
            <p className="text-muted-foreground">
              Handpicked favorites from our premium collection
            </p>
          </div>

          <div className="hidden md:flex gap-2">
            <Button size="sm" variant="outline" onClick={prevSlide}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={nextSlide}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Carousel */}
        <div className="hidden md:block relative overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{ x: -currentIndex * (100 / 3) + '%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="flex-shrink-0 w-1/3">
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Mobile Grid */}
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-center gap-2 mt-6">
          <Button size="sm" variant="outline" onClick={prevSlide}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={nextSlide}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
