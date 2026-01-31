# API Integration Guide

This guide explains how to connect the Rooftop Nursery admin panel to your backend API.

## Overview

The admin panel is designed to work with any REST API backend. It provides a complete abstraction layer in `/lib/api-client.ts` that handles all API communication.

## Configuration

### Step 1: Set API Base URL

Update your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://api.yoursite.com
```

For development:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 2: Update API Client

The API client in `/lib/api-client.ts` handles authentication automatically by including JWT tokens from localStorage. Modify the endpoints to match your backend:

```typescript
// Example: Update products endpoint
export const productsAPI = {
  getAll: (params?: ProductFilters) =>
    apiFetch('/products', { 
      params: {
        search: params?.search,
        category: params?.category,
        status: params?.status
      }
    }),
}
```

## Required API Endpoints

### Authentication

#### POST /auth/login
**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-1",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "avatar": "https://...",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### GET /auth/me
**Headers:**
```
Authorization: Bearer {token}
Cookie: auth_token={token}
```

**Response:**
```json
{
  "user": { /* user object */ }
}
```

#### POST /auth/logout
**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Products

#### GET /products
**Query Parameters:**
- `search` - Search by name or SKU
- `category` - Filter by category
- `status` - Filter by status (active, inactive, pending_approval)
- `limit` - Items per page
- `offset` - Pagination offset

**Response:**
```json
{
  "data": [
    {
      "id": "prod-1",
      "name": "Monstera Deliciosa",
      "sku": "MON-001",
      "price": 1200,
      "mrp": 1500,
      "stock": 25,
      "status": "active",
      "images": ["url1", "url2"],
      "category": "Indoor Plants",
      "vendor": {
        "id": "vendor-1",
        "name": "Green Thumb"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-10T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1
}
```

#### GET /products/:id
**Response:** Single product object

#### POST /products
**Request:**
```json
{
  "name": "New Plant",
  "description": "A beautiful plant",
  "sku": "NEW-001",
  "price": 999,
  "mrp": 1299,
  "stock": 50,
  "category": "Indoor Plants",
  "images": ["url1"],
  "status": "active"
}
```

#### PUT /products/:id
**Request:** Same as POST with fields to update

#### DELETE /products/:id
**Response:**
```json
{
  "message": "Product deleted"
}
```

#### GET /products/pending
**Response:** Array of pending approval products

### Orders

#### GET /orders
**Query Parameters:**
- `status` - Filter by status
- `search` - Search by order ID or customer name
- `dateFrom` - Date range filter
- `dateTo` - Date range filter

**Response:**
```json
{
  "data": [
    {
      "id": "ord-1",
      "orderNumber": "ORD-001",
      "customerId": "cust-1",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "items": [
        {
          "id": "item-1",
          "productId": "prod-1",
          "productName": "Monstera",
          "quantity": 2,
          "price": 1200,
          "subtotal": 2400
        }
      ],
      "subtotal": 2400,
      "tax": 360,
      "shippingCost": 100,
      "discount": 0,
      "total": 2860,
      "status": "confirmed",
      "paymentStatus": "completed",
      "shippingAddress": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "pincode": "10001",
        "country": "USA"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T11:00:00Z"
    }
  ],
  "total": 50
}
```

#### GET /orders/:id
**Response:** Single order object (detailed)

#### POST /orders
**Request:**
```json
{
  "customerId": "cust-1",
  "items": [
    {
      "productId": "prod-1",
      "variantId": "var-1",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "pincode": "10001",
    "country": "USA"
  },
  "paymentMethod": "card"
}
```

#### PATCH /orders/:id/status
**Request:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRK123456789"
}
```

#### GET /orders/:id/invoice
**Response:** PDF file or invoice data

### Customers

#### GET /customers
**Query Parameters:**
- `search` - Search by name or email
- `status` - Filter by status
- `limit`, `offset` - Pagination

**Response:**
```json
{
  "data": [
    {
      "id": "cust-1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "totalOrders": 5,
      "totalSpent": 12500,
      "status": "active",
      "createdAt": "2023-06-15T00:00:00Z"
    }
  ],
  "total": 100
}
```

### Vendors

#### GET /vendors
**Query Parameters:**
- `status` - Filter by status (pending, approved, suspended)

**Response:**
```json
{
  "data": [
    {
      "id": "vendor-1",
      "businessName": "Green Thumb Nursery",
      "email": "contact@greenthumb.com",
      "phone": "+1234567890",
      "commissionRate": 15,
      "totalProducts": 24,
      "totalRevenue": 125000,
      "status": "approved",
      "createdAt": "2023-06-15T00:00:00Z"
    }
  ],
  "total": 24
}
```

#### POST /vendors/:id/approve
**Response:**
```json
{
  "message": "Vendor approved",
  "vendor": { /* vendor object */ }
}
```

#### POST /vendors/:id/reject
**Response:**
```json
{
  "message": "Vendor rejected"
}
```

#### GET /vendors/payouts
**Response:**
```json
[
  {
    "vendorId": "vendor-1",
    "vendorName": "Green Thumb",
    "totalSales": 125000,
    "commissionRate": 15,
    "amountDue": 18750,
    "status": "pending"
  }
]
```

### Analytics

#### GET /analytics/dashboard
**Response:**
```json
{
  "metrics": {
    "totalRevenue": 325680,
    "revenueChange": 22,
    "totalOrders": 8234,
    "ordersChange": 18,
    "activeVendors": 24,
    "vendorsChange": 2,
    "totalProducts": 342,
    "productsChange": 18
  }
}
```

#### GET /analytics/sales
**Query Parameters:**
- `period` - daily, weekly, monthly

**Response:**
```json
{
  "data": [
    {
      "date": "2024-01-15",
      "revenue": 2400,
      "orders": 24
    }
  ]
}
```

## Error Handling

The API client expects consistent error responses:

**Error Response Format:**
```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": { /* optional */ }
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad request / validation error
- `401` - Unauthorized
- `403` - Forbidden (permission denied)
- `404` - Not found
- `500` - Server error

## Authentication

The API client automatically handles authentication:

1. **Login** - Returns JWT token
2. **Storage** - Token stored in localStorage and HTTP-only cookie
3. **Requests** - Token included in `Authorization` header
4. **Logout** - Token cleared from storage

### Protected Endpoint Example

```typescript
// API automatically adds token to request
const response = await apiFetch('/protected-endpoint')
```

## ImageKit Integration

### Upload Endpoint

If using ImageKit for image hosting, implement this endpoint:

**POST /auth/imagekit**

**Response:**
```json
{
  "token": "token123",
  "signature": "signature123",
  "expire": 1704067200,
  "publicKey": "your-public-key"
}
```

## Testing the Integration

1. **Test Authentication:**
   ```bash
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@test.com","password":"test123"}'
   ```

2. **Test Protected Endpoint:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/products
   ```

3. **Test in Admin Panel:**
   - Navigate to login page
   - Enter test credentials
   - Verify dashboard loads

## Common Issues

### CORS Errors
Add CORS headers to your backend:
```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Token Not Persisting
Ensure HTTP-only cookies are enabled in your backend:
```
Set-Cookie: auth_token=...; HttpOnly; SameSite=Lax; Secure
```

### 401 Errors After Login
- Verify token is returned from login endpoint
- Check token is stored correctly in localStorage
- Ensure protected routes are validating token

## Rate Limiting

Recommended rate limits:
- `GET` requests: 1000 req/min
- `POST/PUT/DELETE`: 100 req/min
- `Login` endpoint: 10 attempts/min

## Database Schema Reference

Expected database structure for the admin panel:

```sql
-- Users/Admin
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50), -- admin, vendor
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  description TEXT,
  price DECIMAL(10, 2),
  mrp DECIMAL(10, 2),
  stock INTEGER,
  status VARCHAR(50), -- active, inactive, pending_approval
  category VARCHAR(100),
  vendor_id UUID REFERENCES vendors(id),
  images JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR(100) UNIQUE,
  customer_id UUID REFERENCES customers(id),
  status VARCHAR(50),
  total DECIMAL(10, 2),
  payment_status VARCHAR(50),
  created_at TIMESTAMP
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP
);

-- Vendors
CREATE TABLE vendors (
  id UUID PRIMARY KEY,
  business_name VARCHAR(255),
  email VARCHAR(255),
  commission_rate DECIMAL(5, 2),
  status VARCHAR(50),
  created_at TIMESTAMP
);
```

## Next Steps

1. Implement the required API endpoints in your backend
2. Update `/lib/api-client.ts` with your actual endpoints
3. Set `NEXT_PUBLIC_API_URL` in `.env.local`
4. Test each feature in the admin panel
5. Deploy to production

For questions or issues, refer to the main [README.md](../README.md).
