'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Download, Truck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [shippingStatus, setShippingStatus] = useState('confirmed')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const order = {
    id: params.id,
    orderNumber: 'ORD-001',
    customer: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    items: [
      {
        id: '1',
        name: 'Monstera Deliciosa',
        variant: 'Large (24-36 inches)',
        quantity: 1,
        price: 1200,
      },
      {
        id: '2',
        name: 'Snake Plant',
        variant: 'Standard',
        quantity: 2,
        price: 800,
      },
    ],
    subtotal: 2800,
    tax: 420,
    shipping: 230,
    discount: 0,
    total: 3450,
    address: {
      street: '123 Main St, Apt 4B',
      city: 'New York',
      state: 'NY',
      pin: '10001',
      country: 'USA',
    },
    status: 'confirmed',
    paymentStatus: 'completed',
    createdAt: '2024-01-15 10:30 AM',
  }

  const handleDownloadInvoice = () => {
    toast.success('Invoice downloaded!')
  }

  const handleUpdateShipping = async () => {
    setIsUpdating(true)
    try {
      // In production, call API to update shipping
      toast.success('Shipping details updated!')
    } catch (error) {
      toast.error('Failed to update shipping')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      toast.success('Order cancelled successfully')
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{order.id}</h1>
          <p className="text-muted-foreground mt-1">
            Order placed on {order.createdAt}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleDownloadInvoice}
          className="gap-2 bg-transparent"
        >
          <Download className="w-4 h-4" />
          Invoice
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Order Status Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Order Status
            </h2>
            <div className="relative">
              <div className="space-y-6">
                {[
                  { label: 'Order Placed', status: 'completed', date: order.createdAt },
                  {
                    label: 'Payment Confirmed',
                    status: 'completed',
                    date: '2024-01-15 10:31 AM',
                  },
                  {
                    label: 'Order Confirmed',
                    status: 'completed',
                    date: '2024-01-15 11:00 AM',
                  },
                  {
                    label: 'Shipped',
                    status: order.status === 'shipped' ? 'current' : 'pending',
                    date: '—',
                  },
                  {
                    label: 'Delivered',
                    status: 'pending',
                    date: '—',
                  },
                ].map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center gap-4">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          step.status === 'completed'
                            ? 'bg-green-600'
                            : step.status === 'current'
                              ? 'bg-primary'
                              : 'bg-gray-300'
                        }`}
                      ></div>
                      {index < 4 && (
                        <div className="w-0.5 h-12 bg-border"></div>
                      )}
                    </div>
                    <div className="pt-1">
                      <p
                        className={`font-medium ${
                          step.status === 'pending'
                            ? 'text-muted-foreground'
                            : 'text-foreground'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {step.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-border">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.variant}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Summary */}
            <div className="mt-6 space-y-3 pt-6 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">
                  ₹{order.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (15%)</span>
                <span className="text-foreground">₹{order.tax}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">₹{order.shipping}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-3 border-t border-border">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">
                  ₹{order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Update Shipping */}
          {order.status === 'confirmed' && (
            <Card className="p-6 border-primary/30 bg-primary/5">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Mark as Shipped
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tracking">Tracking Number</Label>
                  <Input
                    id="tracking"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleUpdateShipping}
                  disabled={isUpdating || !trackingNumber}
                >
                  {isUpdating ? 'Updating...' : 'Mark as Shipped'}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Customer
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{order.customer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground text-sm break-all">
                  {order.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">{order.phone}</p>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Shipping Address
            </h2>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{order.address.street}</p>
              <p>
                {order.address.city}, {order.address.state} {order.address.pin}
              </p>
              <p>{order.address.country}</p>
            </div>
          </Card>

          {/* Payment Status */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Payment Status
            </h2>
            <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              ✓ Completed
            </span>
          </Card>

          {/* Actions */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleCancelOrder}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
