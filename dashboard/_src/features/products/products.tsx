import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Clock, Filter, Package, Plus, Search } from 'lucide-react'
import { useAuth } from '_src/features/auth/auth.provider'
import { PageHeader } from '_src/components/ui/PageHeader'
import { mockCategories, mockProducts, mockVendors } from '_src/data/mockData'
import { Button } from '_src/components/ui/button'
import { Input } from '_src/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '_src/components/ui/select'
import { Badge } from '_src/components/ui/badge'
import { useProducts } from '_src/hooks/query/useProducts'
import { DataTable } from '_src/components/products/product-table'
import { columns } from '_src/components/products/columns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '_src/components/ui/dialog'
import { formatPrice } from 'src/utils/utils'

function Products() {
  const { isAdmin } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [vendorFilter, setVendorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showPendingModal, setShowPendingModal] = useState(false)

  const [filters, setFilters] = useState({})
  const { data: products, isLoading } = useProducts(filters)

  const pendingProducts = mockProducts.filter((p) => p.status === 'pending')

  if (isLoading) return <div>Loading...</div>

  const filteredProducts = products?.results || []

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
          <Link to="/admin/products/new" className="gap-2">
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
      </div>

      {/* Products Table */}
      <DataTable columns={columns} data={filteredProducts} />

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center card-elevated">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-foreground">No products found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}

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
                    {formatPrice(product.variants[0]?.price || 0)}
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
