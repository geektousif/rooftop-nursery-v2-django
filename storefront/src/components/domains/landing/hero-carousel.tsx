"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

const heroSlides = [
  {
    id: 1,
    title: "Spring Bulbs Collection",
    subtitle: "Transform Your Garden",
    description:
      "Discover our premium selection of Dutch tulips, daffodils, and crocuses for stunning spring displays.",
    image: "/colorful-tulip-bulbs-in-a-wooden-box.jpg",
    cta: "Shop Bulbs",
    discount: "25% OFF",
  },
  {
    id: 2,
    title: "Heirloom Seeds",
    subtitle: "Grow Something Special",
    description: "Rare and heritage varieties that have been passed down through generations of gardeners.",
    image: "/heirloom-tomato-seeds-packet-with-colorful-tomatoe.jpg",
    cta: "Explore Seeds",
    discount: "New Arrivals",
  },
  {
    id: 3,
    title: "Herb Garden Essentials",
    subtitle: "Fresh Flavors Await",
    description: "Everything you need to create your own culinary herb garden, from seeds to starter plants.",
    image: "/herb-garden-kit-with-basil-oregano-thyme-seeds-and.jpg",
    cta: "Start Growing",
    discount: "Starter Kits",
  },
]

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const scrollToProducts = () => {
    const element = document.getElementById("products")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-muted">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/20 z-10" />
          <img
            src={heroSlides[currentSlide].image || "/placeholder.svg"}
            alt={heroSlides[currentSlide].title}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 z-20 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-lg">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-full mb-4"
                >
                  {heroSlides[currentSlide].discount}
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-2 text-balance"
                >
                  {heroSlides[currentSlide].title}
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl font-medium text-primary mb-4"
                >
                  {heroSlides[currentSlide].subtitle}
                </motion.p>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground mb-8 text-pretty"
                >
                  {heroSlides[currentSlide].description}
                </motion.p>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                  <Button size="lg" onClick={scrollToProducts} className="group">
                    {heroSlides[currentSlide].cta}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <Button
        size="sm"
        variant="outline"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-background/80 backdrop-blur"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-background/80 backdrop-blur"
        onClick={nextSlide}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? "bg-primary" : "bg-background/50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
