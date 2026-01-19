import { GST_RATES, REMOTE_STATES, SHIPPING_RATES, INDIAN_STATES } from "@/lib/mock-data"

/**
 * Validate Indian phone number (10 digits)
 */
export const validateIndianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "")
  return cleaned.length === 10 && /^[6-9]/.test(cleaned)
}

/**
 * Validate Indian PIN code (6 digits)
 */
export const validatePinCode = (pinCode: string): boolean => {
  return /^\d{6}$/.test(pinCode.trim())
}

/**
 * Validate UPI ID format
 */
export const validateUPIId = (upiId: string): boolean => {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/
  return upiRegex.test(upiId.trim())
}

/**
 * Calculate GST for a product category
 */
export const calculateGST = (price: number, category: string): number => {
  const rate = GST_RATES[category] || 0.05
  return price * rate
}

/**
 * Calculate shipping cost based on state
 */
export const calculateShipping = (state: string, subtotal: number): number => {
  if (subtotal === 0) return 0
  if (subtotal > 500) return 0 // Free shipping over ₹500

  return REMOTE_STATES.includes(state) ? SHIPPING_RATES.remote : SHIPPING_RATES.default
}

/**
 * Get state name from state code
 */
export const getStateName = (stateCode: string): string => {
  const state = INDIAN_STATES.find((s) => s.code === stateCode)
  return state ? state.name : stateCode
}

/**
 * Format price in Indian numbering system (e.g., 1,00,000)
 */
export const formatIndianPrice = (price: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

/**
 * Mask card number for display (show last 4 digits)
 */
export const maskCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, "")
  return `**** **** **** ${cleaned.slice(-4)}`
}

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  return phone
}

/**
 * Check if delivery is available in PIN code (mock implementation)
 */
export const isDeliveryAvailable = (pinCode: string): boolean => {
  // In real app, this would check against a database
  // Mock: Assume delivery available for most areas
  if (!validatePinCode(pinCode)) return false

  // Mock list of unavailable PINs
  const unavailablePins = ["000000"]
  return !unavailablePins.includes(pinCode)
}

/**
 * Estimate delivery days based on state
 */
export const getEstimatedDeliveryDays = (state: string): number => {
  // Remote states: 5-7 days
  if (REMOTE_STATES.includes(state)) return 5

  // Metro cities: 2-3 days
  const metroStates = ["MH", "KA", "TN", "DL", "UP"]
  if (metroStates.includes(state)) return 2

  // Other states: 3-4 days
  return 3
}

/**
 * Generate guest tracking link
 */
export const generateGuestTrackingLink = (email: string, orderNumber: string): string => {
  const encodedEmail = btoa(email)
  return `/track?email=${encodedEmail}&order=${orderNumber}`
}

/**
 * Generate order number
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substr(2, 5).toUpperCase()
  return `ORD-${timestamp}-${random}`
}
