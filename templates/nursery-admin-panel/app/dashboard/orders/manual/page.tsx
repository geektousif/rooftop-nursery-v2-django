'use client'

import React from "react"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ManualOrderPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [deductInventory, setDeductInventory] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In production, create order via API
      toast.success('Order created successfully!')
      router.push('/dashboard/orders')
    } catch (error) {
      toast.error('Failed to create order')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Manual Order</h1>
          <p className="text-muted-foreground mt-1">
            Create orders from offline channels
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="col-span-2 space-y-6">
            {/* Customer Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Customer Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Customer Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Order Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    placeholder="123 Main St, Apt 4B"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" placeholder="New York" required />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" placeholder="NY" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pin">PIN Code *</Label>
                    <Input id="pin" placeholder="10001" required />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" placeholder="USA" required />
                  </div>
                </div>
              </div>
            </Card>

            {/* Products */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Products
              </h2>
              <div className="space-y-4 mb-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="product">Product *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monstera">Monstera Deliciosa</SelectItem>
                        <SelectItem value="snake">Snake Plant</SelectItem>
                        <SelectItem value="pothos">Pothos Vine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Label htmlFor="qty">Qty</Label>
                    <Input
                      id="qty"
                      type="number"
                      placeholder="1"
                      defaultValue="1"
                      min="1"
                    />
                  </div>
                  <Button type="button" variant="outline">
                    Add
                  </Button>
                </div>
              </div>
              <Button type="button" variant="outline" className="w-full bg-transparent">
                + Add Product
              </Button>
            </Card>

            {/* Payment Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Payment Details
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash on Delivery</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-4">
                  <input
                    type="checkbox"
                    id="deductInventory"
                    checked={deductInventory}
                    onChange={(e) => setDeductInventory(e.target.checked)}
                  />
                  <label htmlFor="deductInventory" className="text-sm text-foreground">
                    Deduct from inventory
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Summary */}
          <div>
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">₹0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">₹0</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">₹0</span>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creating...' : 'Create Order'}
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
