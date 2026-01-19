'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  Check,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/common/navbar'
import { Footer } from '@/components/common/footer'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from '@tanstack/react-router'
import { useCartStore } from '@/store/cartStore'

interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  apartment: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface PaymentMethod {
  type: 'credit' | 'upi'
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardName?: string
  upiId?: string
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const state = useCartStore()
  const [currentStep, setCurrentStep] = useState<
    'shipping' | 'payment' | 'review'
  >('shipping')
  const [isProcessing, setIsProcessing] = useState(false)

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  })

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'credit',
  })

  const [saveInfo, setSaveInfo] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )
  const shipping = subtotal > 50 ? 0 : 5.99
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  // Redirect if cart is empty
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Add some products to your cart before checking out.
          </p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const updateShippingAddress = (
    field: keyof ShippingAddress,
    value: string,
  ) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }))
  }

  const updatePaymentMethod = (field: keyof PaymentMethod, value: string) => {
    setPaymentMethod((prev) => ({ ...prev, [field]: value }))
  }

  const isShippingValid = () => {
    return (
      shippingAddress.firstName &&
      shippingAddress.lastName &&
      shippingAddress.email &&
      shippingAddress.phone &&
      shippingAddress.address &&
      shippingAddress.city &&
      shippingAddress.state &&
      shippingAddress.zipCode
    )
  }

  const isPaymentValid = () => {
    if (paymentMethod.type === 'credit') {
      return (
        paymentMethod.cardNumber &&
        paymentMethod.expiryDate &&
        paymentMethod.cvv &&
        paymentMethod.cardName
      )
    } else {
      return paymentMethod.upiId
    }
  }

  const handlePlaceOrder = async () => {
    if (!agreeToTerms) return

    setIsProcessing(true)

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Clear cart and redirect to success page
    state.clearCart()
    navigate({ to: '/checkout/success' })
  }

  const steps = [
    {
      id: 'shipping',
      title: 'Shipping',
      completed: currentStep !== 'shipping',
    },
    { id: 'payment', title: 'Payment', completed: false },
    { id: 'review', title: 'Review', completed: false },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/products">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shopping
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            Checkout
          </h1>
          <p className="text-muted-foreground">
            Complete your order in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.completed
                        ? 'bg-primary text-primary-foreground'
                        : currentStep === step.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.completed ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      currentStep === step.id
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 md:w-16 h-px bg-border ml-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Shipping Step */}
              {currentStep === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Shipping Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={shippingAddress.firstName}
                            onChange={(e) =>
                              updateShippingAddress('firstName', e.target.value)
                            }
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={shippingAddress.lastName}
                            onChange={(e) =>
                              updateShippingAddress('lastName', e.target.value)
                            }
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingAddress.email}
                          onChange={(e) =>
                            updateShippingAddress('email', e.target.value)
                          }
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) =>
                            updateShippingAddress('phone', e.target.value)
                          }
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address">Street Address *</Label>
                        <Input
                          id="address"
                          value={shippingAddress.address}
                          onChange={(e) =>
                            updateShippingAddress('address', e.target.value)
                          }
                          placeholder="123 Main Street"
                        />
                      </div>

                      <div>
                        <Label htmlFor="apartment">
                          Apartment, Suite, etc. (Optional)
                        </Label>
                        <Input
                          id="apartment"
                          value={shippingAddress.apartment}
                          onChange={(e) =>
                            updateShippingAddress('apartment', e.target.value)
                          }
                          placeholder="Apt 4B"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={shippingAddress.city}
                            onChange={(e) =>
                              updateShippingAddress('city', e.target.value)
                            }
                            placeholder="New York"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Select
                            value={shippingAddress.state}
                            onValueChange={(value) =>
                              updateShippingAddress('state', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CA">California</SelectItem>
                              <SelectItem value="NY">New York</SelectItem>
                              <SelectItem value="TX">Texas</SelectItem>
                              <SelectItem value="FL">Florida</SelectItem>
                              <SelectItem value="WA">Washington</SelectItem>
                              <SelectItem value="OR">Oregon</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code *</Label>
                          <Input
                            id="zipCode"
                            value={shippingAddress.zipCode}
                            onChange={(e) =>
                              updateShippingAddress('zipCode', e.target.value)
                            }
                            placeholder="10001"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveInfo"
                          checked={saveInfo}
                          onCheckedChange={setSaveInfo}
                        />
                        <Label htmlFor="saveInfo" className="text-sm">
                          Save this information for next time
                        </Label>
                      </div>

                      <Button
                        onClick={() => setCurrentStep('payment')}
                        disabled={!isShippingValid()}
                        className="w-full"
                      >
                        Continue to Payment
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <RadioGroup
                        value={paymentMethod.type}
                        onValueChange={(value: 'credit' | 'upi') =>
                          setPaymentMethod({ type: value })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="credit" id="credit" />
                          <Label htmlFor="credit">Credit/Debit Card</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="upi" id="upi" />
                          <Label htmlFor="upi">UPI Payment</Label>
                        </div>
                      </RadioGroup>

                      {paymentMethod.type === 'credit' && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="cardName">Cardholder Name *</Label>
                            <Input
                              id="cardName"
                              value={paymentMethod.cardName || ''}
                              onChange={(e) =>
                                updatePaymentMethod('cardName', e.target.value)
                              }
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardNumber">Card Number *</Label>
                            <Input
                              id="cardNumber"
                              value={paymentMethod.cardNumber || ''}
                              onChange={(e) =>
                                updatePaymentMethod(
                                  'cardNumber',
                                  e.target.value,
                                )
                              }
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiryDate">Expiry Date *</Label>
                              <Input
                                id="expiryDate"
                                value={paymentMethod.expiryDate || ''}
                                onChange={(e) =>
                                  updatePaymentMethod(
                                    'expiryDate',
                                    e.target.value,
                                  )
                                }
                                placeholder="MM/YY"
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV *</Label>
                              <Input
                                id="cvv"
                                value={paymentMethod.cvv || ''}
                                onChange={(e) =>
                                  updatePaymentMethod('cvv', e.target.value)
                                }
                                placeholder="123"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod.type === 'upi' && (
                        <div>
                          <Label htmlFor="upiId">UPI ID *</Label>
                          <Input
                            id="upiId"
                            value={paymentMethod.upiId || ''}
                            onChange={(e) =>
                              updatePaymentMethod('upiId', e.target.value)
                            }
                            placeholder="yourname@upi"
                          />
                        </div>
                      )}

                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep('shipping')}
                          className="flex-1"
                        >
                          Back to Shipping
                        </Button>
                        <Button
                          onClick={() => setCurrentStep('review')}
                          disabled={!isPaymentValid()}
                          className="flex-1"
                        >
                          Review Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Shipping Address Review */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          Shipping Address
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentStep('shipping')}
                        >
                          Edit
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">
                          {shippingAddress.firstName} {shippingAddress.lastName}
                        </p>
                        <p>{shippingAddress.address}</p>
                        {shippingAddress.apartment && (
                          <p>{shippingAddress.apartment}</p>
                        )}
                        <p>
                          {shippingAddress.city}, {shippingAddress.state}{' '}
                          {shippingAddress.zipCode}
                        </p>
                        <p className="flex items-center gap-2 mt-2">
                          <Phone className="w-3 h-3" />
                          {shippingAddress.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {shippingAddress.email}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Method Review */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Payment Method
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentStep('payment')}
                        >
                          Edit
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        {paymentMethod.type === 'credit' ? (
                          <div>
                            <p className="font-medium">Credit/Debit Card</p>
                            <p>
                              **** **** ****{' '}
                              {paymentMethod.cardNumber?.slice(-4)}
                            </p>
                            <p>{paymentMethod.cardName}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">UPI Payment</p>
                            <p>{paymentMethod.upiId}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Terms and Conditions */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={agreeToTerms}
                          onCheckedChange={setAgreeToTerms}
                        />
                        <Label
                          htmlFor="terms"
                          className="text-sm leading-relaxed"
                        >
                          I agree to the{' '}
                          <a href="#" className="text-primary hover:underline">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="#" className="text-primary hover:underline">
                            Privacy Policy
                          </a>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('payment')}
                      className="flex-1"
                    >
                      Back to Payment
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={!agreeToTerms || isProcessing}
                      className="flex-1"
                    >
                      {isProcessing
                        ? 'Processing...'
                        : `Place Order - $${total.toFixed(2)}`}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {state.items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.product.image || '/placeholder.svg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${item.product.price} each
                        </p>
                      </div>
                      <div className="text-sm font-medium text-primary">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Truck className="w-3 h-3" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      {/* Mobile bottom navigation spacing */}
      <div className="md:hidden h-16" />
    </div>
  )
}
