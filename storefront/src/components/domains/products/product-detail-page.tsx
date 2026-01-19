'use client'

import { useState } from 'react'
import {
  Star,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navbar } from '@/components/common/navbar'
import { Footer } from '@/components/common/footer'
import { ProductCard } from '@/components/product-card'
import { ProductReviews } from '@/components/product-reviews'
import { mockProducts, mockReviews } from '@/lib/mock-data'
import { Link } from '@tanstack/react-router'
import { useCartStore } from '@/store/cartStore'

interface ProductDetailPageProps {
  productId: string
}

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const state = useCartStore()

  const product = mockProducts.find((p) => p.id === productId)

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
            Product Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist.
          </p>
          <Link to="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  // Mock multiple images for gallery (in real app, this would come from product data)
  const productImages = [
    product.image,
    product.image, // In real app, these would be different angles/views
    product.image,
    product.image,
  ]

  const relatedProducts = mockProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category ||
          p.tags.some((tag) => product.tags.includes(tag))),
    )
    .slice(0, 4)

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0

  const addToCart = () => {
    state.addItem(product, quantity)
    state.openCart()
  }

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stockCount) {
      setQuantity(newQuantity)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-foreground capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Back Button */}
        <Link to="/products">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={productImages[selectedImageIndex] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discountPercentage > 0 && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                  -{discountPercentage}% OFF
                </Badge>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2 overflow-x-auto">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index
                      ? 'border-primary'
                      : 'border-border'
                  }`}
                >
                  <img
                    src={image || '/placeholder.svg'}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-serif font-bold text-foreground text-balance">
                  {product.name}
                </h1>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={
                      isWishlisted ? 'text-red-500 border-red-500' : ''
                    }
                  >
                    <Heart
                      className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`}
                    />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-current text-yellow-500'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {product.category.replace('-', ' ')}
                </Badge>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-primary">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground">
                    Save {discountPercentage}%
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground text-pretty">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-medium text-foreground mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span className="text-sm text-muted-foreground">
                {product.inStock
                  ? `${product.stockCount} in stock`
                  : 'Out of stock'}
              </span>
            </div>

            {/* Quantity and Add to Cart */}
            {product.inStock && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-border rounded-md">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateQuantity(quantity - 1)}
                        disabled={quantity <= 1}
                        className="h-10 w-10 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">
                        {quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateQuantity(quantity + 1)}
                        disabled={quantity >= product.stockCount}
                        className="h-10 w-10 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Total:{' '}
                      <span className="font-medium text-primary">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>

                <Button size="lg" onClick={addToCart} className="w-full group">
                  <ShoppingCart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </Button>
              </div>
            )}

            {/* Shipping Info */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Free Shipping
                  </p>
                  <p className="text-xs text-muted-foreground">
                    On orders over $50
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Growth Guarantee
                  </p>
                  <p className="text-xs text-muted-foreground">
                    100% satisfaction guaranteed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({product.reviewCount})
              </TabsTrigger>
              <TabsTrigger value="care">Care Instructions</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif font-semibold text-foreground mb-4">
                    Product Details
                  </h3>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <p className="mb-4">{product.description}</p>
                    <p className="mb-4">
                      Our {product.name.toLowerCase()} are carefully selected
                      from premium growers to ensure the highest quality and
                      best results in your garden. Each package includes
                      detailed planting instructions and care tips to help you
                      achieve beautiful, healthy plants.
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Premium quality guaranteed</li>
                      <li>Detailed planting instructions included</li>
                      <li>
                        Perfect for both beginners and experienced gardeners
                      </li>
                      <li>Sustainably sourced from trusted growers</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <ProductReviews productId={productId} />
            </TabsContent>

            <TabsContent value="care" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif font-semibold text-foreground mb-4">
                    Care Instructions
                  </h3>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">
                          Planting
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Plant in well-draining soil</li>
                          <li>Choose a sunny to partially shaded location</li>
                          <li>Plant at the recommended depth</li>
                          <li>Water thoroughly after planting</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-2">
                          Care
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Water regularly but avoid overwatering</li>
                          <li>Apply balanced fertilizer monthly</li>
                          <li>Remove spent flowers to encourage growth</li>
                          <li>Protect from extreme weather conditions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
      {/* Mobile bottom navigation spacing */}
      <div className="md:hidden h-16" />
    </div>
  )
}
