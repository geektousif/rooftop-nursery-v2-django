// components/products/steps/ReviewStep.tsx

import { Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function ReviewStep({ data: { basicInfo, images, variants }, onEdit }) {
  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(1)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Product Name</p>
            <p className="font-medium">{basicInfo.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm">
              {basicInfo.description || 'No description'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Categories</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {basicInfo.categories.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Images Card */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Images ({images.length})</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(2)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img) => (
            <img
              key={img.id}
              src={img.thumbnail || img.url}
              alt="Product"
              className="rounded-lg aspect-square object-cover"
            />
          ))}
        </div>
      </div>

      {/* Variants Card */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Variants ({variants.length})</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(3)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
        <div className="space-y-2">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted"
            >
              <div>
                <p className="font-medium">{variant.name}</p>
                <p className="text-sm text-muted-foreground">
                  SKU: {variant.sku} • Stock: {variant.stock}
                </p>
              </div>
              <p className="font-medium">₹{variant.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
