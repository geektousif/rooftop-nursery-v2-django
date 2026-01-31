import React, { useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Clock,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import type { Product } from '@/types'
import { useAuth } from '@/features/auth/auth.provider'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StockBadge } from '@/components/ui/StockBadge'
import { mockCategories, mockProducts, mockVendors } from '@/data/mockData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useProducts } from '@/hooks/query/useProducts'

export const Route = createFileRoute('/_authenticated/products')({
  component: Products,
})

function Products() {
  const { isAdmin } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [vendorFilter, setVendorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [selectedProducts, setSelectedProducts] = useState<Array<string>>([])
  const [showPendingModal, setShowPendingModal] = useState(false)

  const [filters, setFilters] = useState({})
  const { data: products, isLoading } = useProducts(filters)

  console.log('products', products)

  const pendingProducts = mockProducts.filter((p) => p.status === 'pending')

  const filteredProducts = useMemo(() => {
    let products = [...mockProducts]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.variants.some((v) => v.sku.toLowerCase().includes(query)),
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      products = products.filter((p) => p.categories.includes(categoryFilter))
    }

    // Vendor filter
    if (vendorFilter !== 'all') {
      products = products.filter((p) => p.vendorId === vendorFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      products = products.filter((p) => p.status === statusFilter)
    }

    // Sorting
    products.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price':
          return (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0)
        case 'stock':
          return (
            a.variants.reduce((sum, v) => sum + v.stock, 0) -
            b.variants.reduce((sum, v) => sum + v.stock, 0)
          )
        default:
          return 0
      }
    })

    return products
  }, [searchQuery, categoryFilter, vendorFilter, statusFilter, sortBy])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTotalStock = (product: Product) => {
    return product.variants.reduce((sum, v) => sum + v.stock, 0)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map((p) => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId])
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage your product catalog">
        {isAdmin() && pendingProducts.length > 0 && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowPendingModal(true)}
          >
            <Clock className="h-4 w-4" />
            Pending Approval
            <Badge variant="destructive" className="ml-1">
              {pendingProducts.length}
            </Badge>
          </Button>
        )}
        <Button asChild className="btn-primary-gradient">
          <Link to="/products/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="card-elevated p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {mockCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Vendor Filter (Admin Only) */}
            {isAdmin() && (
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {mockVendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">
              {selectedProducts.length} selected
            </span>
            <Button size="sm" variant="outline">
              Activate
            </Button>
            <Button size="sm" variant="outline">
              Deactivate
            </Button>
            <Button size="sm" variant="destructive">
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="table-header">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedProducts.length === filteredProducts.length &&
                    filteredProducts.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin() && <TableHead>Vendor</TableHead>}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow
                key={product.id}
                className="hover:bg-muted/50 cursor-pointer"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={(checked) =>
                      handleSelectProduct(product.id, checked)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.variants[0]?.sku}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {formatCurrency(product.variants[0]?.price || 0)}
                    </p>
                    {product.variants[0]?.mrp !==
                      product.variants[0]?.price && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatCurrency(product.variants[0]?.mrp || 0)}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StockBadge stock={getTotalStock(product)} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={product.status} />
                </TableCell>
                {isAdmin() && (
                  <TableCell className="text-muted-foreground text-sm">
                    {product.vendorName}
                  </TableCell>
                )}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-foreground">No products found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Pending Approval Modal */}
      <Dialog open={showPendingModal} onOpenChange={setShowPendingModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Pending Approval</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {pendingProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-border"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    by {product.vendorName}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.variants.length} variant(s) • Starting at{' '}
                    {formatCurrency(product.variants[0]?.price || 0)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Reject
                  </Button>
                  <Button size="sm" className="btn-primary-gradient">
                    Approve
                  </Button>
                </div>
              </div>
            ))}
            {pendingProducts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No products pending approval
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Products
