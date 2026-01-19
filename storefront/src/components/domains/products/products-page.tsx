import { useState, useMemo } from 'react'
import { Search, Filter, Grid, List, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ProductCard } from '@/components/product-card'
import { Navbar } from '@/components/common/navbar'
import { Footer } from '@/components/common/footer'
import { mockProducts, type Product } from '@/lib/mock-data'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'

type SortOption = 'name' | 'price-low' | 'price-high' | 'rating' | 'newest'
type ViewMode = 'grid' | 'list'

interface Filters {
  categories: string[]
  tags: string[]
  priceRange: [number, number]
  inStockOnly: boolean
  searchQuery: string
}

export function ProductsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const itemsPerPage = 12

  const [filters, setFilters] = useState<Filters>({
    categories: [],
    tags: [],
    priceRange: [0, 100],
    inStockOnly: false,
    searchQuery: '',
  })

  const state = useCartStore()

  // Get unique categories and tags
  const allCategories = Array.from(new Set(mockProducts.map((p) => p.category)))
  const allTags = Array.from(new Set(mockProducts.flatMap((p) => p.tags)))
  const maxPrice = Math.max(...mockProducts.map((p) => p.price))

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = mockProducts.filter((product) => {
      // Search query
      if (
        filters.searchQuery &&
        !product.name
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) &&
        !product.description
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase())
      ) {
        return false
      }

      // Categories
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(product.category)
      ) {
        return false
      }

      // Tags
      if (
        filters.tags.length > 0 &&
        !filters.tags.some((tag) => product.tags.includes(tag))
      ) {
        return false
      }

      // Price range
      if (
        product.price < filters.priceRange[0] ||
        product.price > filters.priceRange[1]
      ) {
        return false
      }

      // Stock availability
      if (filters.inStockOnly && !product.inStock) {
        return false
      }

      return true
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'newest':
          return b.id.localeCompare(a.id)
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [filters, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    updateFilter('categories', newCategories)
  }

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag]
    updateFilter('tags', newTags)
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      tags: [],
      priceRange: [0, maxPrice],
      inStockOnly: false,
      searchQuery: '',
    })
    setCurrentPage(1)
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Search Products
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or description..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          Categories
        </label>
        <div className="space-y-2">
          {allCategories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <label
                htmlFor={category}
                className="text-sm text-muted-foreground capitalize cursor-pointer"
              >
                {category.replace('-', ' ')}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={filters.tags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
        </label>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) =>
            updateFilter('priceRange', value as [number, number])
          }
          max={maxPrice}
          min={0}
          step={1}
          className="w-full"
        />
      </div>

      {/* Stock Filter */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="inStock"
          checked={filters.inStockOnly}
          onCheckedChange={(checked) => updateFilter('inStockOnly', checked)}
        />
        <label
          htmlFor="inStock"
          className="text-sm text-muted-foreground cursor-pointer"
        >
          In stock only
        </label>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full bg-transparent"
      >
        Clear All Filters
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            All Products
          </h1>
          <p className="text-muted-foreground">
            Discover our complete collection of premium bulbs, seeds, and
            gardening essentials
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-serif font-semibold text-foreground mb-4">
                  Filters
                </h3>
                <FilterContent />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden bg-transparent"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="text-sm text-muted-foreground">
                  {filteredProducts.length} products found
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select
                  value={sortBy}
                  onValueChange={(value: SortOption) => setSortBy(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="hidden sm:flex border border-border rounded-md">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.categories.length > 0 ||
              filters.tags.length > 0 ||
              filters.inStockOnly ||
              filters.searchQuery) && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-muted-foreground">
                    Active filters:
                  </span>
                  {filters.searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {filters.searchQuery}
                      <button onClick={() => updateFilter('searchQuery', '')}>
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.categories.map((category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="gap-1 capitalize"
                    >
                      {category.replace('-', ' ')}
                      <button onClick={() => toggleCategory(category)}>
                        ×
                      </button>
                    </Badge>
                  ))}
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => toggleTag(tag)}>×</button>
                    </Badge>
                  ))}
                  {filters.inStockOnly && (
                    <Badge variant="secondary" className="gap-1">
                      In Stock Only
                      <button
                        onClick={() => updateFilter('inStockOnly', false)}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewMode}-${currentPage}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {paginatedProducts.length > 0 ? (
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                        : 'space-y-4'
                    }
                  >
                    {paginatedProducts.map((product, index) =>
                      viewMode === 'grid' ? (
                        <ProductCard
                          key={product.id}
                          product={product}
                          index={index}
                        />
                      ) : (
                        <ProductListItem
                          key={product.id}
                          product={product}
                          index={index}
                        />
                      ),
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground mb-4">
                      No products found matching your criteria
                    </div>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ),
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      {/* Mobile bottom navigation spacing */}
      <div className="md:hidden h-16" />
    </div>
  )
}

function ProductListItem({
  product,
  index,
}: {
  product: Product
  index: number
}) {
  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0
  const state = useCartStore()

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="flex gap-4">
            <div className="relative w-32 h-32 flex-shrink-0">
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discountPercentage > 0 && (
                <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>

            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-foreground hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-current text-yellow-500" />
                  <span>{product.rating}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {product.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {product.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {product.inStock
                      ? `${product.stockCount} in stock`
                      : 'Out of stock'}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => state.addItem(product)}
                    disabled={!product.inStock}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
