'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

// Mock pending products
const pendingProducts = [
  {
    id: '1',
    name: 'Rubber Plant',
    vendor: 'Green Thumb Nursery',
    price: 1500,
    category: 'Large Plants',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=200&h=200&fit=crop',
    submittedAt: '2024-01-20',
  },
  {
    id: '2',
    name: 'Fiddle Leaf Fig',
    vendor: 'Urban Plants Co',
    price: 2000,
    category: 'Large Plants',
    image: 'https://images.unsplash.com/photo-1516151860157-96f0eb7e45da?w=200&h=200&fit=crop',
    submittedAt: '2024-01-18',
  },
]

export default function PendingProductsPage() {
  const handleApprove = (productId: string) => {
    toast.success('Product approved!')
  }

  const handleReject = (productId: string) => {
    toast.success('Product rejected!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pending Product Approvals</h1>
        <p className="text-muted-foreground mt-1">
          {pendingProducts.length} product{pendingProducts.length !== 1 ? 's' : ''} awaiting approval
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden flex flex-col">
            {/* Image */}
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-48 object-cover"
            />

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.vendor}
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="font-medium text-foreground">
                      ₹{product.price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Category:
                    </span>
                    <span className="font-medium text-foreground">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Submitted:
                    </span>
                    <span className="font-medium text-foreground">
                      {product.submittedAt}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 text-destructive bg-transparent"
                  onClick={() => handleReject(product.id)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleApprove(product.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {pendingProducts.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            No pending products to review
          </p>
        </Card>
      )}
    </div>
  )
}
