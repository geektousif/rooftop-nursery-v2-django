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
  AlertCircle,
  Info,
  Lock,
  Smartphone,
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Navbar } from '@/components/common/navbar'
import { Footer } from '@/components/common/footer'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  INDIAN_STATES,
  GST_RATES,
  REMOTE_STATES,
  SHIPPING_RATES,
  PAYMENT_METHODS_INDIA,
} from '@/lib/mock-data'
import { useCartStore } from '@/store/cartStore'

interface ShippingAddress {
  fullName: string
  email: string
  phone: string
  street: string
  apartment?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault?: boolean
}

interface PaymentMethod {
  type: 'upi' | 'credit' | 'debit' | 'netbanking' | 'cod' | 'wallet'
  upiId?: string
  cardNumber?: string
  cardHolder?: string
  expiryDate?: string
  cvv?: string
  bankCode?: string
}

interface CheckoutState {
  isGuest: boolean
  currentStep: 'login' | 'shipping' | 'payment' | 'review'
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  saveAddress: boolean
  agreeToTerms: boolean
  isProcessing: boolean
}

export function EnhancedCheckoutPage() {
  const cartState = useCartStore()
  const navigate = useNavigate()

  const [checkout, setCheckout] = useState<CheckoutState>({
    isGuest: false,
    currentStep: 'login',
    shippingAddress: {
      fullName: '',
      email: '',
      phone: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
    paymentMethod: { type: 'upi' },
    saveAddress: false,
    agreeToTerms: false,
    isProcessing: false,
  })

  // Calculate pricing with Indian GST
  const calculatePricing = () => {
    const subtotal = cartState.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    )

    // Calculate GST (5% or 12% based on product category)
    const gst = cartState.items.reduce((sum, item) => {
      const rate = GST_RATES[item.product.category] || 0.05
      return sum + item.product.price * item.quantity * rate
    }, 0)

    // Calculate shipping based on state
    const shipping =
      subtotal === 0
        ? 0
        : subtotal > 500
          ? 0
          : REMOTE_STATES.includes(checkout.shippingAddress.state)
            ? SHIPPING_RATES.remote
            : SHIPPING_RATES.default

    const total = subtotal + gst + shipping

    return { subtotal, gst, shipping, total }
  }

  const { subtotal, gst, shipping, total } = calculatePricing()

  if (cartState.items.length === 0) {
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

  const handleStartCheckout = (isGuest: boolean) => {
    setCheckout((prev) => ({
      ...prev,
      isGuest,
      currentStep: 'shipping',
    }))
  }

  const handlePlaceOrder = async () => {
    if (!checkout.agreeToTerms) return

    setCheckout((prev) => ({ ...prev, isProcessing: true }))
    await new Promise((resolve) => setTimeout(resolve, 2000))
    cartState.clearCart()
    navigate({ to: '/checkout/success' })
  }

  const isShippingValid = () => {
    return (
      checkout.shippingAddress.fullName &&
      checkout.shippingAddress.email &&
      checkout.shippingAddress.phone &&
      checkout.shippingAddress.street &&
      checkout.shippingAddress.city &&
      checkout.shippingAddress.state &&
      checkout.shippingAddress.postalCode
    )
  }

  const isPaymentValid = () => {
    switch (checkout.paymentMethod.type) {
      case 'upi':
        return checkout.paymentMethod.upiId?.includes('@')
      case 'cod':
        return true
      case 'credit':
      case 'debit':
        return (
          checkout.paymentMethod.cardNumber &&
          checkout.paymentMethod.cardHolder &&
          checkout.paymentMethod.expiryDate &&
          checkout.paymentMethod.cvv
        )
      case 'netbanking':
        return checkout.paymentMethod.bankCode
      case 'wallet':
        return true
      default:
        return false
    }
  }

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
            Secure Checkout
          </h1>
          <p className="text-muted-foreground">
            Fast, safe, and secure payment in India
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Login/Guest Step */}
              {checkout.currentStep === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Choose Your Checkout Method</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Guest checkout is available. No account creation
                          required!
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full h-auto py-4 justify-start bg-transparent"
                          onClick={() => handleStartCheckout(false)}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-semibold">
                              Sign In / Create Account
                            </span>
                            <span className="text-xs text-muted-foreground">
                              For faster checkout and order tracking
                            </span>
                          </div>
                        </Button>

                        <Button
                          className="w-full h-auto py-4 justify-start bg-primary"
                          onClick={() => handleStartCheckout(true)}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-semibold">
                              Continue as Guest
                            </span>
                            <span className="text-xs opacity-90">
                              No account needed - Quick checkout
                            </span>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Shipping Step */}
              {checkout.currentStep === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Guest Checkout Info */}
                      {checkout.isGuest && (
                        <Alert className="bg-blue-50 border-blue-200">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            You're checking out as a guest. An order
                            confirmation link will be sent to your email for
                            tracking.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={checkout.shippingAddress.fullName}
                            onChange={(e) =>
                              setCheckout((prev) => ({
                                ...prev,
                                shippingAddress: {
                                  ...prev.shippingAddress,
                                  fullName: e.target.value,
                                },
                              }))
                            }
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={checkout.shippingAddress.phone}
                            onChange={(e) =>
                              setCheckout((prev) => ({
                                ...prev,
                                shippingAddress: {
                                  ...prev.shippingAddress,
                                  phone: e.target.value,
                                },
                              }))
                            }
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={checkout.shippingAddress.email}
                          onChange={(e) =>
                            setCheckout((prev) => ({
                              ...prev,
                              shippingAddress: {
                                ...prev.shippingAddress,
                                email: e.target.value,
                              },
                            }))
                          }
                          placeholder="your@email.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                          id="street"
                          value={checkout.shippingAddress.street}
                          onChange={(e) =>
                            setCheckout((prev) => ({
                              ...prev,
                              shippingAddress: {
                                ...prev.shippingAddress,
                                street: e.target.value,
                              },
                            }))
                          }
                          placeholder="House No., Building Name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="apartment">
                          Apartment, Suite, Floor (Optional)
                        </Label>
                        <Input
                          id="apartment"
                          value={checkout.shippingAddress.apartment || ''}
                          onChange={(e) =>
                            setCheckout((prev) => ({
                              ...prev,
                              shippingAddress: {
                                ...prev.shippingAddress,
                                apartment: e.target.value,
                              },
                            }))
                          }
                          placeholder="Apt 4B, Floor 2"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={checkout.shippingAddress.city}
                            onChange={(e) =>
                              setCheckout((prev) => ({
                                ...prev,
                                shippingAddress: {
                                  ...prev.shippingAddress,
                                  city: e.target.value,
                                },
                              }))
                            }
                            placeholder="Mumbai"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Select
                            value={checkout.shippingAddress.state}
                            onValueChange={(value) =>
                              setCheckout((prev) => ({
                                ...prev,
                                shippingAddress: {
                                  ...prev.shippingAddress,
                                  state: value,
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                              {INDIAN_STATES.map((state) => (
                                <SelectItem key={state.code} value={state.code}>
                                  {state.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="postalCode">PIN Code *</Label>
                          <Input
                            id="postalCode"
                            value={checkout.shippingAddress.postalCode}
                            onChange={(e) =>
                              setCheckout((prev) => ({
                                ...prev,
                                shippingAddress: {
                                  ...prev.shippingAddress,
                                  postalCode: e.target.value,
                                },
                              }))
                            }
                            placeholder="400001"
                            maxLength={6}
                          />
                        </div>
                      </div>

                      {!checkout.isGuest && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="saveAddress"
                            checked={checkout.saveAddress}
                            onCheckedChange={(checked) =>
                              setCheckout((prev) => ({
                                ...prev,
                                saveAddress: checked as boolean,
                              }))
                            }
                          />
                          <Label htmlFor="saveAddress" className="text-sm">
                            Save this address for future orders
                          </Label>
                        </div>
                      )}

                      <Button
                        onClick={() =>
                          setCheckout((prev) => ({
                            ...prev,
                            currentStep: 'payment',
                          }))
                        }
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
              {checkout.currentStep === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Alert className="bg-green-50 border-green-200">
                        <Shield className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Secure payment with SSL encryption. Your payment
                          information is protected.
                        </AlertDescription>
                      </Alert>

                      <RadioGroup
                        value={checkout.paymentMethod.type}
                        onValueChange={(value: any) =>
                          setCheckout((prev) => ({
                            ...prev,
                            paymentMethod: { type: value },
                          }))
                        }
                      >
                        <div className="space-y-3">
                          {PAYMENT_METHODS_INDIA.map((method) => (
                            <div
                              key={method.id}
                              className="flex items-start space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                            >
                              <RadioGroupItem
                                value={method.id}
                                id={method.id}
                                className="mt-1"
                              />
                              <Label
                                htmlFor={method.id}
                                className="flex-1 cursor-pointer"
                              >
                                <div>
                                  <p className="font-medium">{method.label}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {method.description}
                                  </p>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>

                      {/* UPI Payment */}
                      {checkout.paymentMethod.type === 'upi' && (
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                          <div>
                            <Label htmlFor="upiId">UPI ID *</Label>
                            <Input
                              id="upiId"
                              value={checkout.paymentMethod.upiId || ''}
                              onChange={(e) =>
                                setCheckout((prev) => ({
                                  ...prev,
                                  paymentMethod: {
                                    ...prev.paymentMethod,
                                    upiId: e.target.value,
                                  },
                                }))
                              }
                              placeholder="yourname@upi or yourname@okhdfcbank"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              e.g., john@googlepay, priya@phonepe
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Credit/Debit Card */}
                      {(checkout.paymentMethod.type === 'credit' ||
                        checkout.paymentMethod.type === 'debit') && (
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                          <div>
                            <Label htmlFor="cardHolder">
                              Cardholder Name *
                            </Label>
                            <Input
                              id="cardHolder"
                              value={checkout.paymentMethod.cardHolder || ''}
                              onChange={(e) =>
                                setCheckout((prev) => ({
                                  ...prev,
                                  paymentMethod: {
                                    ...prev.paymentMethod,
                                    cardHolder: e.target.value,
                                  },
                                }))
                              }
                              placeholder="As it appears on card"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardNumber">Card Number *</Label>
                            <Input
                              id="cardNumber"
                              value={checkout.paymentMethod.cardNumber || ''}
                              onChange={(e) =>
                                setCheckout((prev) => ({
                                  ...prev,
                                  paymentMethod: {
                                    ...prev.paymentMethod,
                                    cardNumber: e.target.value,
                                  },
                                }))
                              }
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiryDate">
                                Expiry (MM/YY) *
                              </Label>
                              <Input
                                id="expiryDate"
                                value={checkout.paymentMethod.expiryDate || ''}
                                onChange={(e) =>
                                  setCheckout((prev) => ({
                                    ...prev,
                                    paymentMethod: {
                                      ...prev.paymentMethod,
                                      expiryDate: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="MM/YY"
                                maxLength={5}
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV *</Label>
                              <Input
                                id="cvv"
                                value={checkout.paymentMethod.cvv || ''}
                                onChange={(e) =>
                                  setCheckout((prev) => ({
                                    ...prev,
                                    paymentMethod: {
                                      ...prev.paymentMethod,
                                      cvv: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="123"
                                maxLength={4}
                                type="password"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* COD */}
                      {checkout.paymentMethod.type === 'cod' && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            Pay when your order arrives at your doorstep.
                            Available for selected locations.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setCheckout((prev) => ({
                              ...prev,
                              currentStep: 'shipping',
                            }))
                          }
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={() =>
                            setCheckout((prev) => ({
                              ...prev,
                              currentStep: 'review',
                            }))
                          }
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
              {checkout.currentStep === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Shipping Review */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          Delivery Address
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setCheckout((prev) => ({
                              ...prev,
                              currentStep: 'shipping',
                            }))
                          }
                        >
                          Edit
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">
                          {checkout.shippingAddress.fullName}
                        </p>
                        <p>{checkout.shippingAddress.street}</p>
                        {checkout.shippingAddress.apartment && (
                          <p>{checkout.shippingAddress.apartment}</p>
                        )}
                        <p>
                          {checkout.shippingAddress.city},{' '}
                          {checkout.shippingAddress.state}{' '}
                          {checkout.shippingAddress.postalCode}
                        </p>
                        <p className="flex items-center gap-2 mt-2">
                          <Phone className="w-3 h-3" />
                          {checkout.shippingAddress.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {checkout.shippingAddress.email}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Review */}
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
                          onClick={() =>
                            setCheckout((prev) => ({
                              ...prev,
                              currentStep: 'payment',
                            }))
                          }
                        >
                          Edit
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        {checkout.paymentMethod.type === 'upi' && (
                          <p>UPI: {checkout.paymentMethod.upiId}</p>
                        )}
                        {(checkout.paymentMethod.type === 'credit' ||
                          checkout.paymentMethod.type === 'debit') && (
                          <p>
                            Card ending in{' '}
                            {checkout.paymentMethod.cardNumber?.slice(-4)}
                          </p>
                        )}
                        {checkout.paymentMethod.type === 'cod' && (
                          <p>Cash on Delivery</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Terms */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={checkout.agreeToTerms}
                          onCheckedChange={(checked) =>
                            setCheckout((prev) => ({
                              ...prev,
                              agreeToTerms: checked as boolean,
                            }))
                          }
                        />
                        <Label
                          htmlFor="terms"
                          className="text-sm leading-relaxed"
                        >
                          I agree to the Terms of Service and Privacy Policy. I
                          understand that my{' '}
                          {checkout.paymentMethod.type === 'cod'
                            ? 'order will be delivered COD'
                            : 'payment will be processed securely'}
                          .
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCheckout((prev) => ({
                          ...prev,
                          currentStep: 'payment',
                        }))
                      }
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={!checkout.agreeToTerms || checkout.isProcessing}
                      className="flex-1"
                    >
                      {checkout.isProcessing
                        ? 'Processing...'
                        : `Place Order - ₹${total.toFixed(2)}`}
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
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartState.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 pb-3 border-b border-border last:border-b-0"
                    >
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
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₹{item.product.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-primary">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (5-12%)</span>
                    <span className="text-blue-600">₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₹${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="pt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    <span>100% Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3 h-3" />
                    <span>Free shipping over ₹500</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    <span>SSL Encrypted</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <div className="md:hidden h-16" />
    </div>
  )
}
