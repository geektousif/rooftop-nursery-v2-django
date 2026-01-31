'use client'

import React from "react"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SimpleImageUploader } from '@/components/simple-image-uploader'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: 'Monstera Deliciosa',
    description: 'A beautiful tropical plant...',
    sku: 'MON-001',
    price: '1200',
    mrp: '1500',
    stock: '25',
    category: 'Indoor Plants',
    status: 'active',
    images: ['/placeholder-plant-1.jpg'] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In production, update product via API
      toast.success('Product updated successfully!')
      router.push('/dashboard/products')
    } catch (error) {
      toast.error('Failed to update product')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground mt-1">
            Update product details and inventory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="col-span-2 space-y-6">
            {/* Basic Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Basic Details
              </h2>
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Indoor Plants">
                          Indoor Plants
                        </SelectItem>
                        <SelectItem value="Low Light Plants">
                          Low Light Plants
                        </SelectItem>
                        <SelectItem value="Trailing Plants">
                          Trailing Plants
                        </SelectItem>
                        <SelectItem value="Large Plants">Large Plants</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Pricing */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Pricing
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Selling Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mrp">MRP (₹)</Label>
                  <Input
                    id="mrp"
                    type="number"
                    value={formData.mrp}
                    onChange={(e) =>
                      setFormData({ ...formData, mrp: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Discount</Label>
                  <div className="p-3 rounded-lg bg-muted/50 text-foreground font-medium">
                    {formData.mrp && formData.price ? (
                      <>
                        ₹
                        {(Number(formData.mrp) - Number(formData.price)).toFixed(
                          0
                        )}{' '}
                        ({Math.round((1 - Number(formData.price) / Number(formData.mrp)) * 100)}%)
                      </>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Product Images
              </h2>
              <SimpleImageUploader
                value={formData.images}
                onChange={(images) =>
                  setFormData({ ...formData, images })
                }
                maxFiles={4}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Status
              </h2>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            {/* Inventory */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Inventory
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">
                    {Number(formData.stock) > 10
                      ? '✓ In stock'
                      : Number(formData.stock) > 0
                        ? '⚠ Low stock'
                        : '✗ Out of stock'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/dashboard/products" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
