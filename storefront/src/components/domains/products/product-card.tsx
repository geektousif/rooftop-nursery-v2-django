import type React from 'react'

import { Star, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Product } from '@/lib/mock-data'
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { useCartStore } from '@/store/cartStore'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const state = useCartStore()

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking add to cart
    state.addItem(product, 1)
    state.openCart()
  }

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to="/products/$id" params={{ id: product.id }}>
        <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 cursor-pointer">
          <div className="relative overflow-hidden">
            <img
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {discountPercentage > 0 && (
              <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                -{discountPercentage}%
              </Badge>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Badge variant="secondary">Out of Stock</Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors text-balance">
                {product.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-current text-yellow-500" />
                <span>{product.rating}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {product.description}
            </p>

            <div className="flex flex-wrap gap-1 mb-3">
              {product.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              <Button
                size="sm"
                onClick={addToCart}
                disabled={!product.inStock}
                className="group/btn"
              >
                <ShoppingCart className="w-3 h-3 mr-1 group-hover/btn:scale-110 transition-transform" />
                Add
              </Button>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              {product.inStock ? (
                <span>{product.stockCount} in stock</span>
              ) : (
                <span>Out of stock</span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
