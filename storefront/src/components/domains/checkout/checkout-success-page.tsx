import { CheckCircle, Package, Truck, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/common/navbar'
import { Footer } from '@/components/common/footer'
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'

export function CheckoutSuccessPage() {
  // Mock order data (in real app, this would come from order ID)
  const orderNumber =
    'RN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  const estimatedDelivery = new Date(
    Date.now() + 5 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Order Confirmed!
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Thank you for your purchase. Your order has been successfully
              placed.
            </p>
            <p className="text-sm text-muted-foreground">
              Order Number:{' '}
              <span className="font-mono font-medium text-foreground">
                {orderNumber}
              </span>
            </p>
          </motion.div>

          {/* Order Details Card */}
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

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif font-semibold text-foreground mb-4">
                  What happens next?
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">
                        1
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Order Confirmation
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You'll receive an email confirmation with your order
                        details shortly.
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
                      <p className="font-medium text-foreground">Processing</p>
                      <p className="text-sm text-muted-foreground">
                        We'll carefully prepare and package your gardening
                        products.
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
                      <p className="font-medium text-foreground">Shipping</p>
                      <p className="text-sm text-muted-foreground">
                        Your order will be shipped with tracking information
                        provided.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/account/orders">
              <Button variant="outline" className="group bg-transparent">
                View Order Details
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </motion.div>

          {/* Support Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 p-6 bg-muted/30 rounded-lg"
          >
            <h4 className="font-semibold text-foreground mb-2">Need Help?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about your order, our customer support
              team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
              <a
                href="mailto:support@rooftopnursery.com"
                className="text-primary hover:underline"
              >
                support@rooftopnursery.com
              </a>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <a
                href="tel:+15551234567"
                className="text-primary hover:underline"
              >
                (555) 123-4567
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
      {/* Mobile bottom navigation spacing */}
      <div className="md:hidden h-16" />
    </div>
  )
}
