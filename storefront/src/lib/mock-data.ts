export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: "bulbs" | "seeds" | "tools" | "seasonal"
  tags: string[]
  inStock: boolean
  stockCount: number
  description: string
  rating: number
  reviewCount: number
  featured?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Category {
  id: string
  name: string
  description: string
  image: string
  productCount: number
}

export interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  comment: string
  image: string
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  createdAt: string
}

export interface Order {
  id: string
  userId: string
  orderNumber: string
  items: OrderItem[]
  total: number
  subtotal: number
  shippingCost: number
  tax: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: string
  createdAt: string
  estimatedDelivery?: string
  trackingNumber?: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
  image: string
}

export interface Address {
  fullName: string
  email: string
  phone: string
  street: string
  apartment?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface Vendor {
  id: string
  name: string
  logo?: string
  rating: number
  reviews: number
}

export interface CartItemWithVendor {
  product: Product
  quantity: number
  vendorId: string
  vendor: Vendor
}

// Indian states
export const INDIAN_STATES = [
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CG", name: "Chhattisgarh" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu & Kashmir" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
  { code: "DL", name: "Delhi" },
]

// GST rates by category (India)
export const GST_RATES: Record<string, number> = {
  bulbs: 0.05, // 5% GST
  seeds: 0.05, // 5% GST
  tools: 0.12, // 12% GST
  seasonal: 0.05, // 5% GST
}

// Shipping rates by state (India) - in rupees
export const SHIPPING_RATES: Record<string, number> = {
  default: 100, // Default for most states
  remote: 200, // Remote states (NE, J&K)
}

export const REMOTE_STATES = ["AR", "AS", "MN", "ML", "MZ", "NL", "TR", "JK", "SK"]

// Payment methods for India
export const PAYMENT_METHODS_INDIA = [
  { id: "upi", label: "UPI", icon: "Smartphone", description: "Direct bank transfer via UPI" },
  { id: "credit", label: "Credit Card", icon: "CreditCard", description: "Visa, Mastercard, Amex" },
  { id: "debit", label: "Debit Card", icon: "CreditCard", description: "All major debit cards" },
  { id: "netbanking", label: "Net Banking", icon: "Wifi", description: "All Indian banks" },
  { id: "cod", label: "Cash on Delivery", icon: "Banknote", description: "Pay when order arrives" },
  { id: "wallet", label: "Digital Wallet", icon: "Wallet", description: "Paytm, Google Pay, PhonePe" },
]

export const mockVendors: Vendor[] = [
  {
    id: "vendor-1",
    name: "Garden Paradise",
    logo: "/placeholder.svg",
    rating: 4.8,
    reviews: 2543,
  },
  {
    id: "vendor-2",
    name: "Green Thumb Seeds",
    logo: "/placeholder.svg",
    rating: 4.9,
    reviews: 1876,
  },
  {
    id: "vendor-3",
    name: "Nursery Direct",
    logo: "/placeholder.svg",
    rating: 4.7,
    reviews: 3124,
  },
]

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  title: string
  comment: string
  helpfulCount: number
  createdAt: string
}

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  addedAt: string
}

export const mockCurrentUser: User = {
  id: "user-1",
  email: "gardener@example.com",
  name: "Sarah Gardener",
  phone: "+1 (555) 123-4567",
  avatar: "/smiling-woman-with-garden-hat.jpg",
  createdAt: "2024-01-15",
}

export const mockOrders: Order[] = [
  {
    id: "order-1",
    userId: "user-1",
    orderNumber: "ORD-2024-001",
    items: [
      {
        productId: "1",
        productName: "Dutch Tulip Bulbs Mix",
        quantity: 2,
        price: 24.99,
        total: 49.98,
        image: "/colorful-tulip-bulbs-in-a-wooden-box.jpg",
      },
    ],
    total: 64.98,
    subtotal: 49.98,
    shippingCost: 10,
    tax: 5.0,
    status: "delivered",
    shippingAddress: {
      fullName: "Sarah Gardener",
      email: "gardener@example.com",
      phone: "+1 (555) 123-4567",
      street: "123 Oak Street",
      city: "Portland",
      state: "OR",
      postalCode: "97201",
      country: "USA",
    },
    billingAddress: {
      fullName: "Sarah Gardener",
      email: "gardener@example.com",
      phone: "+1 (555) 123-4567",
      street: "123 Oak Street",
      city: "Portland",
      state: "OR",
      postalCode: "97201",
      country: "USA",
    },
    paymentMethod: "Credit Card ••••4242",
    createdAt: "2024-01-20",
    estimatedDelivery: "2024-01-28",
    trackingNumber: "TRACK123456789",
  },
  {
    id: "order-2",
    userId: "user-1",
    orderNumber: "ORD-2024-002",
    items: [
      {
        productId: "2",
        productName: "Heirloom Tomato Seeds",
        quantity: 3,
        price: 12.99,
        total: 38.97,
        image: "/heirloom-tomato-seeds-packet-with-colorful-tomatoe.jpg",
      },
      {
        productId: "3",
        productName: "Purple Lavender Plants",
        quantity: 1,
        price: 34.99,
        total: 34.99,
        image: "/purple-lavender-plants-in-small-pots.jpg",
      },
    ],
    total: 89.96,
    subtotal: 73.96,
    shippingCost: 10,
    tax: 6.0,
    status: "shipped",
    shippingAddress: {
      fullName: "Sarah Gardener",
      email: "gardener@example.com",
      phone: "+1 (555) 123-4567",
      street: "123 Oak Street",
      city: "Portland",
      state: "OR",
      postalCode: "97201",
      country: "USA",
    },
    billingAddress: {
      fullName: "Sarah Gardener",
      email: "gardener@example.com",
      phone: "+1 (555) 123-4567",
      street: "123 Oak Street",
      city: "Portland",
      state: "OR",
      postalCode: "97201",
      country: "USA",
    },
    paymentMethod: "Credit Card ••••4242",
    createdAt: "2024-02-10",
    estimatedDelivery: "2024-02-18",
    trackingNumber: "TRACK987654321",
  },
]

export const mockReviews: Review[] = [
  {
    id: "review-1",
    productId: "1",
    userId: "user-2",
    userName: "John Thompson",
    rating: 5,
    title: "Beautiful tulips, highly recommend!",
    comment: "These bulbs arrived in perfect condition and bloomed beautifully. The colors are vibrant and exactly as pictured.",
    helpfulCount: 24,
    createdAt: "2024-02-05",
  },
  {
    id: "review-2",
    productId: "1",
    userId: "user-3",
    userName: "Maria Rodriguez",
    rating: 4,
    title: "Great quality, excellent value",
    comment: "Very satisfied with the quality of these tulip bulbs. They arrived promptly and the planting instructions were helpful.",
    helpfulCount: 15,
    createdAt: "2024-01-28",
  },
  {
    id: "review-3",
    productId: "2",
    userId: "user-4",
    userName: "David Chen",
    rating: 5,
    title: "Best heirloom tomato seeds I've grown",
    comment: "Outstanding germination rate and the tomatoes are incredibly flavorful. Will definitely order again.",
    helpfulCount: 19,
    createdAt: "2024-02-12",
  },
]

export const mockWishlistItems: WishlistItem[] = [
  {
    id: "wishlist-1",
    userId: "user-1",
    productId: "4",
    addedAt: "2024-02-14",
  },
  {
    id: "wishlist-2",
    userId: "user-1",
    productId: "6",
    addedAt: "2024-02-13",
  },
]

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Dutch Tulip Bulbs Mix",
    price: 24.99,
    originalPrice: 29.99,
    image: "/colorful-tulip-bulbs-in-a-wooden-box.jpg",
    category: "bulbs",
    tags: ["spring", "colorful", "easy-care"],
    inStock: true,
    stockCount: 45,
    description: "Premium Dutch tulip bulbs in a vibrant mix of colors. Perfect for spring gardens and containers.",
    rating: 4.8,
    reviewCount: 124,
    featured: true,
  },
  {
    id: "2",
    name: "Heirloom Tomato Seeds",
    price: 12.99,
    image: "/heirloom-tomato-seeds-packet-with-colorful-tomatoe.jpg",
    category: "seeds",
    tags: ["heirloom", "organic", "summer"],
    inStock: true,
    stockCount: 78,
    description: "Rare heirloom tomato varieties with exceptional flavor and unique colors.",
    rating: 4.9,
    reviewCount: 89,
    featured: true,
  },
  {
    id: "3",
    name: "Lavender Starter Plants",
    price: 18.99,
    image: "/purple-lavender-plants-in-small-pots.jpg",
    category: "seasonal",
    tags: ["aromatic", "perennial", "drought-tolerant"],
    inStock: true,
    stockCount: 32,
    description: "Fragrant lavender plants perfect for borders, containers, and aromatherapy gardens.",
    rating: 4.7,
    reviewCount: 67,
  },
  {
    id: "4",
    name: "Sunflower Giant Seeds",
    price: 8.99,
    image: "/giant-sunflower-seeds-with-measuring-tape-showing-.jpg",
    category: "seeds",
    tags: ["giant", "annual", "bird-friendly"],
    inStock: true,
    stockCount: 156,
    description: "Grow massive sunflowers up to 12 feet tall! Perfect for kids and wildlife gardens.",
    rating: 4.6,
    reviewCount: 203,
  },
  {
    id: "5",
    name: "Daffodil Bulb Collection",
    price: 19.99,
    originalPrice: 24.99,
    image: "/yellow-and-white-daffodil-bulbs-in-garden-basket.jpg",
    category: "bulbs",
    tags: ["spring", "naturalizing", "deer-resistant"],
    inStock: true,
    stockCount: 67,
    description: "Early spring daffodils that naturalize beautifully and return year after year.",
    rating: 4.8,
    reviewCount: 145,
    featured: true,
  },
  {
    id: "6",
    name: "Herb Garden Starter Kit",
    price: 34.99,
    image: "/herb-garden-kit-with-basil-oregano-thyme-seeds-and.jpg",
    category: "seeds",
    tags: ["herbs", "culinary", "beginner-friendly"],
    inStock: true,
    stockCount: 23,
    description: "Everything you need to start your own herb garden. Includes seeds, pots, and growing guide.",
    rating: 4.9,
    reviewCount: 178,
  },
  {
    id: "7",
    name: "Crocus Bulbs Mixed Colors",
    price: 15.99,
    image: "/colorful-flower-bulbs-tulips-daffodils.jpg",
    category: "bulbs",
    tags: ["spring", "early-blooming", "naturalizing"],
    inStock: true,
    stockCount: 89,
    description: "Early spring crocuses in purple, white, and yellow. First flowers of the season!",
    rating: 4.5,
    reviewCount: 76,
  },
  {
    id: "8",
    name: "Basil Seeds Collection",
    price: 9.99,
    image: "/variety-of-seed-packets-vegetables-flowers-herbs.jpg",
    category: "seeds",
    tags: ["herbs", "culinary", "aromatic"],
    inStock: true,
    stockCount: 134,
    description: "Sweet basil, Thai basil, and purple basil seeds for a flavorful herb garden.",
    rating: 4.7,
    reviewCount: 92,
  },
  {
    id: "9",
    name: "Seasonal Flower Mix",
    price: 22.99,
    image: "/seasonal-plants-in-pots-ready-for-planting.jpg",
    category: "seasonal",
    tags: ["colorful", "mixed", "container-friendly"],
    inStock: false,
    stockCount: 0,
    description: "Beautiful seasonal flowers perfect for containers and garden beds.",
    rating: 4.4,
    reviewCount: 45,
  },
  {
    id: "10",
    name: "Marigold Seeds",
    price: 6.99,
    image: "/variety-of-seed-packets-vegetables-flowers-herbs.jpg",
    category: "seeds",
    tags: ["annual", "pest-deterrent", "colorful"],
    inStock: true,
    stockCount: 198,
    description: "Bright orange and yellow marigolds that naturally repel garden pests.",
    rating: 4.6,
    reviewCount: 156,
  },
  {
    id: "11",
    name: "Hyacinth Bulbs",
    price: 16.99,
    originalPrice: 19.99,
    image: "/colorful-flower-bulbs-tulips-daffodils.jpg",
    category: "bulbs",
    tags: ["spring", "fragrant", "colorful"],
    inStock: true,
    stockCount: 54,
    description: "Fragrant hyacinth bulbs in pink, blue, and white for spring gardens.",
    rating: 4.8,
    reviewCount: 87,
  },
  {
    id: "12",
    name: "Pepper Seeds Variety Pack",
    price: 14.99,
    image: "/variety-of-seed-packets-vegetables-flowers-herbs.jpg",
    category: "seeds",
    tags: ["vegetables", "spicy", "summer"],
    inStock: true,
    stockCount: 67,
    description: "Hot and sweet pepper varieties including jalapeño, bell, and habanero.",
    rating: 4.5,
    reviewCount: 112,
  },
]

export const mockCategories: Category[] = [
  {
    id: "bulbs",
    name: "Flower Bulbs",
    description: "Premium bulbs for spring and summer blooms",
    image: "/colorful-flower-bulbs-tulips-daffodils.jpg",
    productCount: 45,
  },
  {
    id: "seeds",
    name: "Seeds",
    description: "Heirloom and hybrid seeds for every garden",
    image: "/variety-of-seed-packets-vegetables-flowers-herbs.jpg",
    productCount: 78,
  },
  {
    id: "seasonal",
    name: "Seasonal Plants",
    description: "Ready-to-plant seasonal favorites",
    image: "/seasonal-plants-in-pots-ready-for-planting.jpg",
    productCount: 32,
  },
]

export const mockTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    location: "Portland, OR",
    rating: 5,
    comment:
      "The tulip bulbs I ordered last fall created the most beautiful spring display! Excellent quality and fast shipping.",
    image: "/smiling-woman-with-garden-hat.jpg",
  },
  {
    id: "2",
    name: "Mike Chen",
    location: "Seattle, WA",
    rating: 5,
    comment: "Amazing selection of heirloom seeds. My tomatoes were the talk of the neighborhood this summer!",
    image: "/man-holding-large-tomatoes-in-garden.jpg",
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    location: "San Francisco, CA",
    rating: 5,
    comment: "The herb starter kit was perfect for my apartment balcony. Great instructions and healthy plants!",
    image: "/woman-tending-herbs-on-apartment-balcony.jpg",
  },
]

// Cart and order types
export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  date: string
  status: "pending" | "processing" | "shipped" | "delivered"
  items: CartItem[]
  total: number
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zip: string
  }
}
