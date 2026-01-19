# Indian E-Commerce Checkout Implementation Guide

## Overview

This documentation covers the enhanced checkout flow designed specifically for Indian multivendor ecommerce platforms. The implementation includes guest checkout, Indian tax system (GST), multiple payment methods, and comprehensive order tracking.

---

## Table of Contents

1. [Checkout Flow](#checkout-flow)
2. [Guest Checkout](#guest-checkout)
3. [Payment Methods](#payment-methods)
4. [Indian Localization](#indian-localization)
5. [Multivendor Support](#multivendor-support)
6. [Order Tracking](#order-tracking)
7. [API Integration](#api-integration)

---

## Checkout Flow

### Step 1: Login/Guest Selection
- **Purpose:** Determine checkout method
- **Options:**
  - Sign In / Create Account (for returning customers)
  - Continue as Guest (for new customers)
- **Benefits:**
  - Faster checkout for guests
  - Account creation optional post-checkout

### Step 2: Shipping Address
- **Indian-specific fields:**
  - Full Name
  - Phone (10 digits, starting with 6-9)
  - Email
  - Street Address
  - Apartment/Suite/Floor (optional)
  - City
  - State (dropdown with 29 Indian states/UTs)
  - PIN Code (6 digits)

- **Validation:**
  - PIN code format: `^\d{6}$`
  - Phone format: 10 digits
  - All required fields must be filled

### Step 3: Payment Method
- **Available options:**
  - UPI (most popular in India)
  - Credit Card
  - Debit Card
  - Net Banking
  - Cash on Delivery (COD)
  - Digital Wallets (Paytm, Google Pay, PhonePe)

### Step 4: Order Review
- Display complete order summary
- Show GST calculation per category
- Display shipping cost based on state
- Terms & conditions agreement

---

## Guest Checkout

### Features
1. **No Account Required**
   - Customers can checkout without creating an account
   - Email used for order tracking and confirmation

2. **Guest Tracking**
   - Unique tracking link sent via email
   - Order number-based tracking at `/track?order=ORDER_NUMBER`
   - No login required to track orders

3. **Optional Account Creation**
   - Post-checkout account creation offered
   - Existing order linked to new account

### Implementation

```typescript
// State flag for guest checkout
const [isGuest, setIsGuest] = useState(false)

// When guest places order
if (checkout.isGuest) {
  // Generate guest tracking link
  const trackingLink = generateGuestTrackingLink(email, orderNumber)
  // Send email with tracking link
  // No user account created
}
```

### Email for Guest Checkout
- Order confirmation with order number
- Tracking link
- Estimated delivery date
- Support contact information

---

## Payment Methods

### UPI (Recommended for India)
- **Field:** UPI ID (e.g., `name@upi`, `name@googlepay`)
- **Validation:** UPI format validation
- **Integration:** Razorpay, PayU, Instamojo

```typescript
// UPI validation
const validateUPIId = (upiId: string): boolean => {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(upiId)
}
```

### Cards (Credit/Debit)
- **Fields:**
  - Cardholder Name
  - Card Number (13-19 digits)
  - Expiry Date (MM/YY)
  - CVV (3-4 digits)
- **Security:** Always use tokenized payment systems
- **Never store:** Raw card data

### Net Banking
- **Field:** Bank selection dropdown
- **Integration:** Direct integration with Indian banks

### Cash on Delivery (COD)
- **Availability:** Selected PIN codes only
- **Validation:** Check `isDeliveryAvailable(pinCode)`
- **Use Case:** High adoption in Tier 2/3 cities

### Digital Wallets
- Paytm
- Google Pay
- PhonePe
- Amazon Pay

---

## Indian Localization

### Tax System (GST)

```typescript
// GST Rates by Category
export const GST_RATES = {
  bulbs: 0.05,      // 5% GST
  seeds: 0.05,      // 5% GST
  tools: 0.12,      // 12% GST
  seasonal: 0.05    // 5% GST
}

// Calculate GST
const calculateGST = (price, category) => {
  return price * GST_RATES[category]
}
```

**Important:** In production, GST calculations should:
- Account for SGST, CGST, IGST based on vendor location
- Support HSN code-based tax rates
- Handle reverse charge mechanism (B2B)

### Shipping Rates

```typescript
// State-based shipping
const REMOTE_STATES = ["AR", "AS", "MN", "ML", "MZ", "NL", "TR", "JK", "SK"]
const SHIPPING_RATES = {
  default: 100,    // ₹100 for most states
  remote: 200      // ₹200 for remote states
}

// Free shipping over ₹500
const calculateShipping = (state, subtotal) => {
  if (subtotal > 500) return 0
  return REMOTE_STATES.includes(state) ? 200 : 100
}
```

### Currency & Formatting

```typescript
// Always use rupees (₹)
const formatIndianPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(price)
}

// Format: ₹1,00,000 (Indian numbering system)
```

### Phone Number Format

```typescript
// Validate Indian phone (10 digits)
const validateIndianPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 && /^[6-9]/.test(cleaned)
}

// Format for display
formatPhoneNumber("+919876543210") // "+91 98765 43210"
```

### PIN Code Validation

```typescript
// 6-digit PIN code
const validatePinCode = (pinCode) => {
  return /^\d{6}$/.test(pinCode.trim())
}
```

---

## Multivendor Support

### Vendor Information
```typescript
interface Vendor {
  id: string
  name: string
  logo?: string
  rating: number
  reviews: number
}

interface CartItemWithVendor {
  product: Product
  quantity: number
  vendorId: string
  vendor: Vendor
}
```

### Vendor-Specific Handling

1. **Shipping per Vendor**
   - Group items by vendor
   - Calculate shipping per vendor
   - Display vendor shipping policies

2. **Payment Split**
   - Split payments to multiple vendors
   - Vendor commission handling
   - Settlement tracking

3. **Order Items per Vendor**
   - Show which vendor sold each item
   - Vendor ratings and reviews
   - Return policies per vendor

### Implementation Example
```typescript
// Group cart items by vendor
const groupByVendor = (items) => {
  return items.reduce((acc, item) => {
    const key = item.vendorId
    return {
      ...acc,
      [key]: [...(acc[key] || []), item]
    }
  }, {})
}

// Checkout shows per-vendor details
const vendors = groupByVendor(cartItems)
// Calculate per-vendor totals
// Display vendor info
```

---

## Order Tracking

### Guest Tracking Link
```typescript
// Generated after order placement
const generateGuestTrackingLink = (email, orderNumber) => {
  const encodedEmail = btoa(email)
  return `/track?email=${encodedEmail}&order=${orderNumber}`
}
```

### Tracking Page (`/track`)
- Enter order number to track
- Real-time status updates:
  - Order Placed
  - Processing
  - Shipped
  - Out for Delivery
  - Delivered
- Current location display
- Estimated delivery date

### Tracking Status Flow
```typescript
const trackingSteps = [
  { status: "pending", title: "Order Placed" },
  { status: "in-progress", title: "Processing" },
  { status: "in-progress", title: "Shipped" },
  { status: "pending", title: "Out for Delivery" },
  { status: "pending", title: "Delivered" }
]
```

---

## Order Success Page

### For Guest Checkout
- Display order number prominently
- Copy order number button
- Tracking link
- Email confirmation notice
- Support contact information (WhatsApp, Email, Phone)

### For Registered Users
- Link to account order history
- Option to download invoice
- Share order functionality

---

## API Integration Points

### Payment Gateway Integration
```typescript
// Recommended providers for India:
// 1. Razorpay (Most popular)
// 2. PayU
// 3. Instamojo
// 4. Cashfree
// 5. Amazon Pay

// Example: Razorpay integration
const initiatePayment = async (orderData) => {
  const response = await razorpay.orders.create({
    amount: orderData.total * 100, // Amount in paise
    currency: "INR",
    receipt: orderData.orderNumber
  })
  return response
}
```

### Delivery Partner Integration
```typescript
// For COD and shipping tracking:
// 1. Shiprocket
// 2. Delhivery
// 3. Ecom Express
// 4. XpressBees

const createShipment = async (order) => {
  const shipment = await shiprocket.createOrder({
    order_id: order.id,
    order_number: order.orderNumber,
    pickup_location_id: warehouse.id,
    customer_address: order.shippingAddress,
    items: order.items
  })
  return shipment
}
```

### Email Service
```typescript
// Send order confirmation to guest
await sendEmail({
  to: guestEmail,
  template: "order-confirmation",
  data: {
    orderNumber,
    trackingLink,
    estimatedDelivery,
    items: order.items
  }
})
```

---

## Security Considerations

### PCI DSS Compliance
- Never store raw card data
- Use tokenized payments
- SSL/TLS encryption for all transactions
- Regular security audits

### Data Protection
- Encrypt sensitive data in database
- Comply with GDPR/DISHA regulations
- Secure API endpoints with authentication
- Implement rate limiting

### Fraud Prevention
- Validate all inputs
- Check for duplicate orders
- Monitor payment patterns
- Implement CAPTCHA for high-risk transactions

---

## Estimated Delivery Days

```typescript
// Based on state and metro/non-metro
const getEstimatedDeliveryDays = (state) => {
  const metroStates = ["MH", "KA", "TN", "DL", "UP"]
  const remoteStates = ["AR", "AS", "MN", "ML", "MZ"]

  if (remoteStates.includes(state)) return 5 // 5-7 days
  if (metroStates.includes(state)) return 2   // 2-3 days
  return 3                                    // 3-4 days
}
```

---

## Testing Checklist

- [ ] Guest checkout flow works end-to-end
- [ ] All payment methods display correctly
- [ ] UPI validation works
- [ ] PIN code validation works
- [ ] Phone number validation works
- [ ] GST calculation is correct per category
- [ ] Shipping cost varies by state
- [ ] Order tracking page loads with URL parameter
- [ ] Order confirmation email sends to guest
- [ ] Multivendor items are grouped correctly
- [ ] Security headers are set (CSP, X-Frame-Options, etc.)
- [ ] Mobile responsive on all screen sizes

---

## File References

- **Checkout Component:** `/components/enhanced-checkout-page.tsx`
- **Success Page:** `/components/checkout-success-enhanced.tsx`
- **Tracking Page:** `/app/track/page.tsx`
- **Commerce Utilities:** `/lib/india-commerce.ts`
- **Mock Data:** `/lib/mock-data.ts`
