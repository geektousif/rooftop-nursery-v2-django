import { useState } from 'react'
import { Search, ShoppingCart, Menu, X, Leaf, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { useCartStore } from '@/store/cartStore'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const state = useCartStore()

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif font-bold text-xl text-foreground">
                Rooftop Nursery
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                to="/"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Products
              </Link>
              <button
                onClick={() => scrollToSection('categories')}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Categories
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <AnimatePresence>
                  {isSearchOpen ? (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 240, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="flex items-center"
                    >
                      <Input
                        placeholder="Search products..."
                        className="pr-10"
                        autoFocus
                        onBlur={() => setIsSearchOpen(false)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1"
                        onClick={() => setIsSearchOpen(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsSearchOpen(true)}
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  )}
                </AnimatePresence>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="relative"
                onClick={() => state.toggleCart()}
              >
                <ShoppingCart className="w-4 h-4" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>

              <Link to="/">
                <Button size="sm" variant="ghost">
                  <User className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              size="sm"
              variant="ghost"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border bg-background"
            >
              <div className="container mx-auto px-4 py-4 space-y-4">
                <div className="relative">
                  <Input placeholder="Search products..." className="pr-10" />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Products
                  </Link>
                  <button
                    onClick={() => scrollToSection('categories')}
                    className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Categories
                  </button>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contact
                  </button>
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    My Account
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
