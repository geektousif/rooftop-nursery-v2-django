import { Edit, Eye, MoreHorizontal, Package, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Product } from '_src/types'
import { Button } from '_src/components/ui/button'
import { Checkbox } from '_src/components/ui/checkbox'
import { StatusBadge } from '_src/components/ui/StatusBadge'
import { StockBadge } from '_src/components/ui/StockBadge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '_src/components/ui/dropdown-menu'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const columns: Array<ColumnDef<Product>> = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {product.image_url ? (
              <img
                src={product.image_url}
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
            <p className="font-medium text-foreground">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.sku}</p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const product = row.original
      return (
        <div>
          <p className="font-medium">{formatCurrency(product?.price || 0)}</p>
          {product?.mrp !== product?.price && (
            <p className="text-xs text-muted-foreground line-through">
              {formatCurrency(product?.mrp || 0)}
            </p>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) => {
      const product = row.original
      return <StockBadge stock={product.available_quantity} />
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const product = row.original
      return <StatusBadge status={product.status} />
    },
  },
  {
    id: 'vendor',
    header: 'Vendor',
    cell: ({ row }) => {
      const product = row.original
      return (
        <span className="text-muted-foreground text-sm">
          {product.vendor_name}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original

      return (
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
      )
    },
  },
]
