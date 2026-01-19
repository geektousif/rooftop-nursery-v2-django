import React from 'react'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/common/navbar'
import { Footer } from '@/components/common/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
} from 'lucide-react'
import { Link, useSearch } from '@tanstack/react-router'

interface TrackingStep {
  status: 'pending' | 'in-progress' | 'completed'
  title: string
  description: string
  timestamp?: string
  icon: React.ReactNode
}

interface TrackingInfo {
  orderNumber: string
  status: 'processing' | 'shipped' | 'out-for-delivery' | 'delivered'
  estimatedDelivery: string
  currentLocation: string
  steps: TrackingStep[]
}

export function TrackingContent() {
  const { order: orderFromUrl } = useSearch({ from: '/track/' })
  const [orderNumber, setOrderNumber] = useState(orderFromUrl || '')
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Mock tracking data
  const getMockTrackingInfo = (order: string): TrackingInfo => {
    const statuses: Record<string, TrackingInfo> = {
      'ORD-123456-ABCDE': {
        orderNumber: 'ORD-123456-ABCDE',
        status: 'shipped',
        estimatedDelivery: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toLocaleDateString('en-IN'),
        currentLocation: 'Distribution Center, Delhi',
        steps: [
          {
            status: 'completed',
            title: 'Order Placed',
            description: 'Your order has been confirmed',
            timestamp: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000,
            ).toLocaleDateString('en-IN'),
            icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
          },
          {
            status: 'completed',
            title: 'Processing',
            description: "We're preparing your items for shipment",
            timestamp: new Date(
              Date.now() - 1.5 * 24 * 60 * 60 * 1000,
            ).toLocaleDateString('en-IN'),
            icon: <Package className="w-5 h-5 text-green-600" />,
          },
          {
            status: 'in-progress',
            title: 'Shipped',
            description: 'Your package is on its way',
            timestamp: new Date(
              Date.now() - 6 * 60 * 60 * 1000,
            ).toLocaleDateString('en-IN'),
            icon: <Truck className="w-5 h-5 text-blue-600" />,
          },
          {
            status: 'pending',
            title: 'Out for Delivery',
            description: 'Your package will arrive soon',
            icon: <MapPin className="w-5 h-5 text-gray-400" />,
          },
          {
            status: 'pending',
            title: 'Delivered',
            description: 'Package delivered to you',
            icon: <CheckCircle2 className="w-5 h-5 text-gray-400" />,
          },
        ],
      },
    }

    return (
      statuses[order] || {
        orderNumber: order,
        status: 'processing',
        estimatedDelivery: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toLocaleDateString('en-IN'),
        currentLocation: 'Warehouse',
        steps: [
          {
            status: 'completed',
            title: 'Order Placed',
            description: 'Your order has been confirmed',
            timestamp: new Date().toLocaleDateString('en-IN'),
            icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
          },
          {
            status: 'in-progress',
            title: 'Processing',
            description: "We're preparing your items",
            icon: <Package className="w-5 h-5 text-blue-600" />,
          },
          {
            status: 'pending',
            title: 'Shipped',
            description: 'Coming soon',
            icon: <Truck className="w-5 h-5 text-gray-400" />,
          },
          {
            status: 'pending',
            title: 'Out for Delivery',
            description: 'Coming soon',
            icon: <MapPin className="w-5 h-5 text-gray-400" />,
          },
          {
            status: 'pending',
            title: 'Delivered',
            description: 'Coming soon',
            icon: <CheckCircle2 className="w-5 h-5 text-gray-400" />,
          },
        ],
      }
    )
  }

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (orderNumber.trim()) {
        setTrackingInfo(getMockTrackingInfo(orderNumber))
      } else {
        setError('Please enter a valid order number')
      }
      setLoading(false)
    }, 500)
  }

  // Auto-load if order from URL
  useEffect(() => {
    if (orderFromUrl) {
      setTrackingInfo(getMockTrackingInfo(orderFromUrl))
    }
  }, [orderFromUrl])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
              Track Your Order
            </h1>
            <p className="text-muted-foreground">
              Enter your order number to see real-time tracking updates
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleTrack} className="flex gap-2">
                <Input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g., ORD-123456-ABCDE"
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? 'Tracking...' : 'Track'}
                </Button>
              </form>
              {error && (
                <Alert className="mt-4 bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Tracking Info */}
          {trackingInfo && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order #{trackingInfo.orderNumber}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Status
                      </p>
                      <Badge className="capitalize">
                        {trackingInfo.status === 'shipped'
                          ? 'Shipped'
                          : trackingInfo.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Estimated Delivery
                      </p>
                      <p className="font-semibold">
                        {trackingInfo.estimatedDelivery}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">
                        Current Location
                      </p>
                      <p className="font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {trackingInfo.currentLocation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipment Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {trackingInfo.steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`p-2 rounded-full ${
                              step.status === 'completed'
                                ? 'bg-green-100'
                                : step.status === 'in-progress'
                                  ? 'bg-blue-100'
                                  : 'bg-gray-100'
                            }`}
                          >
                            {step.icon}
                          </div>
                          {index < trackingInfo.steps.length - 1 && (
                            <div
                              className={`w-0.5 h-12 ${
                                step.status === 'completed' ||
                                step.status === 'in-progress'
                                  ? 'bg-primary'
                                  : 'bg-border'
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <h4 className="font-semibold text-foreground">
                            {step.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                          {step.timestamp && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {step.timestamp}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Help Section */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    If your package hasn't arrived by the estimated delivery
                    date or if you have any questions, please contact our
                    support team.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="mailto:support@rooftopnursery.com"
                      className="text-primary hover:underline text-sm"
                    >
                      📧 Email Support
                    </a>
                    <a
                      href="tel:+919876543210"
                      className="text-primary hover:underline text-sm"
                    >
                      📞 Call Us
                    </a>
                    <a
                      href="https://wa.me/919876543210"
                      className="text-primary hover:underline text-sm"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!trackingInfo && !error && (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  Enter your order number above to track your shipment
                </p>
              </CardContent>
            </Card>
          )}

          {/* Continue Shopping */}
          <div className="mt-8 text-center">
            <Link to="/products">
              <Button variant="outline" className="bg-transparent">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
