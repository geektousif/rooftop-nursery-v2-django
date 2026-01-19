'use client'

import {
  CheckCircle,
  Package,
  Truck,
  Mail,
  ArrowRight,
  Copy,
  Download,
  Share2,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Navbar } from '@/components/common/navbar'
import { Footer } from '@/components/common/footer'
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  generateOrderNumber,
  formatIndianPrice,
  getEstimatedDeliveryDays,
} from '@/lib/india-commerce'

interface SuccessPageProps {
  isGuest?: boolean
}

export function CheckoutSuccessEnhanced({ isGuest = true }: SuccessPageProps) {
  const [copied, setCopied] = useState(false)

  // Mock order data
  const orderNumber = generateOrderNumber()
  const estimatedDays = getEstimatedDeliveryDays('MH') // Mock state
  const estimatedDelivery = new Date(
    Date.now() + estimatedDays * 24 * 60 * 60 * 1000,
  ).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const trackingLink = `/track?order=${orderNumber}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Order Confirmation',
        text: `My order ${orderNumber} has been confirmed! Track it here.`,
        url: trackingLink,
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </motion.div>

          {/* Main Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 text-center">
              Order Confirmed!
            </h1>
            <p className="text-lg text-muted-foreground text-center mb-2">
              Thank you for your order. Your plants are on their way to you!
            </p>

            {isGuest && (
              <Alert className="bg-blue-50 border-blue-200 mt-4">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  A confirmation email with tracking details has been sent to
                  your email address. You can also track your order using the
                  tracking link below.
                </AlertDescription>
              </Alert>
            )}
          </motion.div>

          {/* Order Number Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Your Order Number
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl md:text-3xl font-mono font-bold text-foreground">
                    {orderNumber}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="gap-2 bg-transparent"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Save this for your records
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tracking and Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Order Processing
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We're preparing your items
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      In Progress
                    </Badge>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                      <Truck className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Shipping
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Estimated delivery
                    </p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {estimatedDelivery}
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                      <Mail className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Updates
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We'll email you tracking info
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif font-semibold text-foreground mb-4">
                  What happens next?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">
                        1
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Confirmation Email
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You'll receive an email confirmation with order details
                        and a tracking link shortly.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">
                        2
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Order Processing
                      </p>
                      <p className="text-sm text-muted-foreground">
                        We'll carefully prepare and package your gardening
                        products within 24-48 hours.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Shipping & Tracking
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your order will be shipped with a tracking number. You
                        can track it in real-time using your order number.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">
                        4
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Delivery & Review
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Receive your order and help us improve by leaving a
                        review of your purchase.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tracking Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-foreground">
                    Track Your Order
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {isGuest
                    ? 'Use your order number to track your shipment:'
                    : 'Track your shipment in real-time:'}
                </p>
                <div className="p-3 bg-white rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-mono text-base font-semibold text-foreground">
                    {orderNumber}
                  </p>
                </div>
                <Link to={trackingLink} className="block">
                  <Button
                    className="w-full gap-2 bg-transparent"
                    variant="outline"
                  >
                    <Truck className="w-4 h-4" />
                    Track Order
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Link to="/products" className="block">
              <Button className="w-full gap-2">
                <ArrowRight className="w-4 h-4" />
                Continue Shopping
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={shareOrder}
              className="w-full gap-2 bg-transparent"
            >
              <Share2 className="w-4 h-4" />
              Share Order
            </Button>

            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Download Invoice
            </Button>
          </motion.div>

          {/* Support Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="p-6 bg-muted/30 rounded-lg border border-border"
          >
            <h4 className="font-semibold text-foreground mb-2">Need Help?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about your order or need assistance, our
              customer support team is here to help 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <a
                href="mailto:support@rooftopnursery.com"
                className="text-primary hover:underline"
              >
                📧 support@rooftopnursery.com
              </a>
              <a
                href="tel:+919876543210"
                className="text-primary hover:underline"
              >
                📞 +91 98765 43210
              </a>
              <a
                href="https://wa.me/919876543210"
                className="text-primary hover:underline"
              >
                💬 WhatsApp Support
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
      <div className="md:hidden h-16" />
    </div>
  )
}
