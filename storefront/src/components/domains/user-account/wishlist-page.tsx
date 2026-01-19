import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AccountSidebar } from '@/components/domains/user-account/account-sidebar'
import { mockProducts, mockWishlistItems } from '@/lib/mock-data'
import { Image } from '@unpic/react'

export function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems)
  const [isLoading, setIsLoading] = useState(false)

  const wishlistProducts = wishlistItems
    .map((item) => mockProducts.find((p) => p.id === item.productId))
    .filter(Boolean)

  const handleRemove = (productId: string) => {
    setWishlistItems(
      wishlistItems.filter((item) => item.productId !== productId),
    )
  }

  const handleAddToCart = async (productId: string) => {
    setIsLoading(true)
    // Simulate adding to cart
    await new Promise((resolve) => setTimeout(resolve, 300))
    handleRemove(productId)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AccountSidebar activeTab="wishlist" />

          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-primary text-primary" />
                  My Wishlist
                </CardTitle>
                <CardDescription>
                  {wishlistItems.length} items saved
                </CardDescription>
              </CardHeader>
              <CardContent>
                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      No items in your wishlist yet
                    </p>
                    <Link href="/products">
                      <Button>Continue Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {wishlistProducts.map((product) => (
                      <div
                        key={product!.id}
                        className="flex gap-4 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <Image
                          src={product!.image || '/placeholder.svg'}
                          alt={product!.name}
                          width={100}
                          height={100}
                          className="w-20 h-20 object-cover rounded-lg"
                        />

                        <div className="flex-1">
                          <Link href={`/products/${product!.id}`}>
                            <h3 className="font-semibold hover:text-primary transition-colors">
                              {product!.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mb-2">
                            {product!.description}
                          </p>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${
                                    i < Math.floor(product!.rating)
                                      ? 'text-yellow-400'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              ({product!.reviewCount})
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {product!.originalPrice && (
                                <span className="text-sm line-through text-muted-foreground">
                                  ${product!.originalPrice.toFixed(2)}
                                </span>
                              )}
                              <span className="text-lg font-bold text-primary">
                                ${product!.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemove(product!.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAddToCart(product!.id)}
                                disabled={isLoading || !product!.inStock}
                              >
                                <ShoppingCart className="w-4 h-4 mr-1" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
