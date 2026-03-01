import React, { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Plus, Search, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { mockCustomers, mockProducts } from '@/data/mockData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useToast } from '@/hooks/use-toast'

interface OrderItem {
  productId: string
  variantId: string
  quantity: number
  price: number
}

export const Route = createFileRoute('/_authenticated/manual-order')({
  component: ManualOrder,
})

function ManualOrder() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [orderItems, setOrderItems] = useState<Array<OrderItem>>([])
  const [productSearchOpen, setProductSearchOpen] = useState(false)
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('paid')
  const [deductInventory, setDeductInventory] = useState(true)
  const [notes, setNotes] = useState('')

  const filteredCustomers = mockCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase()),
  )

  const customer = mockCustomers.find((c) => c.id === selectedCustomer)

  const handleAddProduct = (productId: string, variantId: string) => {
    const product = mockProducts.find((p) => p.id === productId)
    const variant = product?.variants.find((v) => v.id === variantId)

    if (variant) {
      setOrderItems([
        ...orderItems,
        {
          productId,
          variantId,
          quantity: 1,
          price: variant.price,
        },
      ])
    }
    setProductSearchOpen(false)
  }

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const updated = [...orderItems]
    updated[index].quantity = Math.max(1, quantity)
    setOrderItems(updated)
  }

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const getProductInfo = (item: OrderItem) => {
    const product = mockProducts.find((p) => p.id === item.productId)
    const variant = product?.variants.find((v) => v.id === item.variantId)
    return { product, variant }
  }

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + tax

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Order created',
      description: 'Manual order has been created successfully.',
    })
    navigate('/orders')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Manual Order"
        description="Create an order for offline or phone sales"
      >
        <Button
          variant="outline"
          onClick={() => navigate('/orders')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold">Customer</h3>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {customer ? (
                    <div className="flex items-center gap-2">
                      <span>{customer.name}</span>
                      <span className="text-muted-foreground">
                        ({customer.email})
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Select customer...
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search customers..."
                    value={customerSearch}
                    onValueChange={setCustomerSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No customers found.</CommandEmpty>
                    <CommandGroup>
                      {filteredCustomers.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={c.id}
                          onSelect={() => {
                            setSelectedCustomer(c.id)
                            if (c.address) {
                              setAddress({
                                line1: c.address.line1,
                                line2: c.address.line2 || '',
                                city: c.address.city,
                                state: c.address.state,
                                pincode: c.address.pincode,
                              })
                            }
                          }}
                        >
                          <div>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {c.email}
                            </p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Shipping Address */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold">
              Shipping Address
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label>Address Line 1 *</Label>
                <Input
                  value={address.line1}
                  onChange={(e) =>
                    setAddress({ ...address, line1: e.target.value })
                  }
                  placeholder="Street address"
                  required
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label>Address Line 2</Label>
                <Input
                  value={address.line2}
                  onChange={(e) =>
                    setAddress({ ...address, line2: e.target.value })
                  }
                  placeholder="Apartment, suite, etc."
                />
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  placeholder="City"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input
                  value={address.state}
                  onChange={(e) =>
                    setAddress({ ...address, state: e.target.value })
                  }
                  placeholder="State"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input
                  value={address.pincode}
                  onChange={(e) =>
                    setAddress({ ...address, pincode: e.target.value })
                  }
                  placeholder="Pincode"
                  required
                />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="card-elevated p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold">Products</h3>
              <Popover
                open={productSearchOpen}
                onOpenChange={setProductSearchOpen}
              >
                <PopoverTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="end">
                  <Command>
                    <CommandInput placeholder="Search products..." />
                    <CommandList>
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup>
                        {mockProducts
                          .filter((p) => p.status === 'active')
                          .map((product) => (
                            <div key={product.id}>
                              {product.variants.map((variant) => (
                                <CommandItem
                                  key={variant.id}
                                  value={`${product.name} ${variant.name}`}
                                  onSelect={() =>
                                    handleAddProduct(product.id, variant.id)
                                  }
                                >
                                  <div className="flex items-center gap-3 w-full">
                                    {product.images[0] && (
                                      <img
                                        src={product.images[0].url}
                                        alt={product.name}
                                        className="w-8 h-8 rounded object-cover"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {product.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {variant.name} • {variant.sku}
                                      </p>
                                    </div>
                                    <p className="font-medium">
                                      {formatCurrency(variant.price)}
                                    </p>
                                  </div>
                                </CommandItem>
                              ))}
                            </div>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No products added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item, index) => {
                  const { product, variant } = getProductInfo(item)
                  if (!product || !variant) return null

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-xl bg-muted/50"
                    >
                      {product.images[0] && (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {variant.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              index,
                              parseInt(e.target.value),
                            )
                          }
                          className="w-20"
                        />
                        <span className="text-muted-foreground">×</span>
                        <span className="w-24 text-right">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold">Notes</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this order..."
              rows={3}
            />
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Payment */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold">Payment</h3>

            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Status *</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Options */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold">Options</h3>

            <div className="flex items-center gap-2">
              <Checkbox
                id="deductInventory"
                checked={deductInventory}
                onCheckedChange={(checked) => setDeductInventory(checked)}
              />
              <Label
                htmlFor="deductInventory"
                className="font-normal cursor-pointer"
              >
                Deduct from inventory
              </Label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold">Order Summary</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (18%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-lg">{formatCurrency(total)}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-primary-gradient"
              disabled={
                !selectedCustomer || orderItems.length === 0 || !paymentMethod
              }
            >
              Create Order
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ManualOrder
