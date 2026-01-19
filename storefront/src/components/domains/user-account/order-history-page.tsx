'use client'

import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Package, Clock, CheckCircle2, Truck } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AccountSidebar } from '@/components/domains/user-account/account-sidebar'
import { mockOrders } from '@/lib/mock-data'
import { Image } from '@unpic/react'

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
  },
  processing: {
    label: 'Processing',
    icon: Package,
    color: 'bg-blue-100 text-blue-800',
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    color: 'bg-purple-100 text-purple-800',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800',
  },
  cancelled: {
    label: 'Cancelled',
    icon: Clock,
    color: 'bg-red-100 text-red-800',
  },
}

export function OrderHistoryPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AccountSidebar activeTab="orders" />

          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View and manage all your orders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Link to="/products">
                      <Button>Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockOrders.map((order) => {
                      const status = statusConfig[order.status]
                      const StatusIcon = status.icon
                      const isExpanded = expandedOrder === order.id

                      return (
                        <div
                          key={order.id}
                          className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                        >
                          <button
                            onClick={() =>
                              setExpandedOrder(isExpanded ? null : order.id)
                            }
                            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold">
                                  {order.orderNumber}
                                </span>
                                <Badge className={status.color}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Order placed:{' '}
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right mr-4">
                              <p className="font-semibold">
                                ${order.total.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.items.length} items
                              </p>
                            </div>
                            <ChevronRight
                              className={`w-5 h-5 text-muted-foreground transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="border-t border-border bg-muted/30 p-4">
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-3">Items</h4>
                                  <div className="space-y-3">
                                    {order.items.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex gap-3 p-3 bg-background rounded-lg border border-border"
                                      >
                                        {item.image && (
                                          <Image
                                            src={
                                              item.image || '/placeholder.svg'
                                            }
                                            alt={item.productName}
                                            width={60}
                                            height={60}
                                            className="w-16 h-16 object-cover rounded"
                                          />
                                        )}
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">
                                            {item.productName}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            Qty: {item.quantity}
                                          </p>
                                          <p className="font-semibold text-sm mt-1">
                                            ${item.total.toFixed(2)}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold mb-3">
                                      Order Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between pb-2 border-b border-border">
                                        <span className="text-muted-foreground">
                                          Subtotal
                                        </span>
                                        <span>
                                          ${order.subtotal.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between pb-2 border-b border-border">
                                        <span className="text-muted-foreground">
                                          Shipping
                                        </span>
                                        <span>
                                          ${order.shippingCost.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between pb-2 border-b border-border">
                                        <span className="text-muted-foreground">
                                          Tax
                                        </span>
                                        <span>${order.tax.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between font-semibold pt-2">
                                        <span>Total</span>
                                        <span>${order.total.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {order.trackingNumber && (
                                    <div>
                                      <h4 className="font-semibold mb-2 text-sm">
                                        Tracking
                                      </h4>
                                      <div className="p-3 bg-background rounded-lg border border-border">
                                        <p className="text-xs text-muted-foreground mb-1">
                                          Tracking Number
                                        </p>
                                        <p className="font-mono text-sm">
                                          {order.trackingNumber}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  <Button className="w-full">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
