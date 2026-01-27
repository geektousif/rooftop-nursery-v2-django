# Rooftop Nursery - Production API Endpoints (v1)

## Base URL: `/api/v1/`

---

## 🌍 Public Endpoints (No Auth Required)

### 🔐 Authentication

- [ ] `POST /auth/register/` - Customer registration
- [ ] `POST /auth/login/` - Login (all roles)
- [ ] `POST /auth/logout/` - Logout
- [ ] `POST /auth/token/refresh/` - Refresh JWT token
- [ ] `POST /auth/verify-email/` - Verify email with token
- [ ] `POST /auth/resend-verification/` - Resend verification email
- [ ] `POST /auth/password/reset/` - Request password reset
- [ ] `POST /auth/password/reset/confirm/` - Confirm password reset
- [ ] `POST /auth/password/change/` - Change password (authenticated)

### 📦 Products

- [ ] `GET /products/` - List products (paginated)
  - Query params: `?page=1&limit=20&category=seeds&vendor=uuid&min_price=10&max_price=500&sort=-created_at`
  - Cursor pagination support
- [ ] `GET /products/{slug}/` - Product detail
  - Includes: variants, images, reviews, vendor info, breadcrumbs
- [ ] `GET /products/{slug}/related/` - Related products
- [ ] `GET /products/{slug}/reviews/` - Product reviews (paginated)
- [ ] `GET /products/featured/` - Featured products
- [ ] `GET /products/best-sellers/` - Best selling products
- [ ] `GET /products/new-arrivals/` - Recently added products
- [ ] `GET /products/search/` - Full-text search
  - Query: `?q=tomato&category=seeds&min_price=10`
- [ ] `GET /products/search/autocomplete/` - Search suggestions
  - Query: `?q=tom` → `["Tomato Seeds", "Cherry Tomato"]`

### 🏷️ Categories

- [ ] `GET /categories/` - Full category tree
- [ ] `GET /categories/root/` - Root categories only (for nav)
- [ ] `GET /categories/{slug}/` - Category detail
- [ ] `GET /categories/{slug}/children/` - Subcategories
- [ ] `GET /categories/{slug}/products/` - Products in category

### 🏪 Vendors

- [ ] `GET /vendors/` - List all approved vendors
- [ ] `GET /vendors/{id}/` - Vendor profile
  - Includes: business info, product count, ratings
- [ ] `GET /vendors/{id}/products/` - Vendor's products

### 🛒 Cart (Hybrid: Guest + Logged-in)

- [ ] `GET /cart/` - Get current cart
  - For logged-in: returns DB cart
  - For guest: merge localStorage cart
- [ ] `POST /cart/items/` - Add item to cart
  - Request: `{variant_id, quantity}`
- [ ] `PATCH /cart/items/{id}/` - Update item quantity
- [ ] `DELETE /cart/items/{id}/` - Remove item
- [ ] `DELETE /cart/clear/` - Clear entire cart
- [ ] `POST /cart/sync/` - Sync guest cart on login
  - Request: `{items: [{variant_id, quantity}]}`

### 💳 Checkout & Orders

- [ ] `POST /checkout/guest/` - Capture guest details
  - Request: `{email, phone, full_name}`
  - Response: `{session_token}` (valid for 1 hour)
- [ ] `POST /checkout/validate/` - Validate cart before checkout
  - Checks: stock availability, coupon validity, price changes
- [ ] `POST /checkout/calculate/` - Calculate order totals
  - Request: `{items, shipping_address, coupon_code?}`
  - Response: `{subtotal, discount, tax_breakdown, shipping, grand_total}`
- [ ] `POST /orders/` - Create order (guest or logged-in)
  - Request: `{items, shipping_address, billing_address?, coupon_code?, notes?, session_token?}`
  - Response: `{order_id, order_number, grand_total}`

### 💰 Payments

- [ ] `POST /payments/initiate/` - Initiate PhonePe payment
  - Request: `{order_id}`
  - Response: `{payment_url, payment_id, merchant_transaction_id}`
- [ ] `GET /payments/{payment_id}/status/` - Check payment status
  - Response: `{status: "pending|completed|failed", order_id}`
- [ ] `POST /webhooks/phonepe/` - PhonePe webhook callback (public)
  - Validates signature, updates payment status

### 🎟️ Coupons

- [ ] `POST /coupons/validate/` - Validate coupon code
  - Request: `{code, cart_total, items: [{variant_id, quantity}]}`
  - Response: `{valid: true, discount_amount, final_total}`

### 📦 Shipping

- [ ] `POST /shipping/calculate/` - Calculate shipping cost
  - Request: `{items: [{variant_id, quantity}], pin_code}`
  - Response: `{methods: [{name, cost, estimated_days}]}`
- [ ] `POST /shipping/pincode/check/` - Check serviceable pincode
  - Request: `{pin_code}`
  - Response: `{serviceable: true, estimated_days: "5-7"}`

### 🏬 Storefront Content

- [ ] `GET /storefront/config/` - Site configuration
  - Response: `{site_name, logo_url, currency, contact_info}`
- [ ] `GET /storefront/banners/` - Active banners (hero slider)
- [ ] `GET /storefront/featured-categories/` - Featured categories grid
- [ ] `GET /storefront/featured-products/` - Featured products section
- [ ] `GET /storefront/best-sellers/` - Best sellers widget
- [ ] `GET /storefront/testimonials/` - Customer testimonials
- [ ] `GET /storefront/promotions/active/` - Active promotions

### 📄 Static Pages (CMS)

- [ ] `GET /pages/about-us/` - About us page
- [ ] `GET /pages/privacy-policy/` - Privacy policy
- [ ] `GET /pages/terms-and-conditions/` - Terms & conditions
- [ ] `GET /pages/shipping-policy/` - Shipping policy
- [ ] `GET /pages/return-policy/` - Return & refund policy
- [ ] `GET /pages/{slug}/` - Generic CMS page

---

## 👤 Customer Endpoints (Auth Required)

### 👤 Profile

- [ ] `GET /customer/profile/` - Get profile
- [ ] `PATCH /customer/profile/` - Update profile
  - Fields: `full_name, email, phone`

### 📍 Addresses

- [ ] `GET /customer/addresses/` - List saved addresses
- [ ] `POST /customer/addresses/` - Add new address
- [ ] `PATCH /customer/addresses/{id}/` - Update address
- [ ] `DELETE /customer/addresses/{id}/` - Delete address
- [ ] `POST /customer/addresses/{id}/set-default/` - Set as default

### 📦 Orders

- [ ] `GET /customer/orders/` - List my orders (paginated)
  - Query: `?status=pending&page=1`
- [ ] `GET /customer/orders/{id}/` - Order detail
- [ ] `GET /customer/orders/{id}/invoice/` - Download invoice PDF
- [ ] `GET /customer/orders/{id}/track/` - Order tracking info
- [ ] `POST /customer/orders/{id}/cancel/` - Cancel order
  - Request: `{reason}`
  - Rules: Only if status = PENDING or CONFIRMED
- [ ] `POST /customer/orders/{id}/return/` - Request return
  - Request: `{items: [item_id], reason, images?: [urls]}`
  - Only for DELIVERED orders

### ⭐ Reviews

- [ ] `POST /customer/reviews/` - Add review for purchased product
  - Request: `{product_id, rating, title, comment, images?: [urls]}`
  - Rules: Must have purchased, one review per product
- [ ] `PATCH /customer/reviews/{id}/` - Edit own review
- [ ] `DELETE /customer/reviews/{id}/` - Delete own review
- [ ] `GET /customer/reviews/` - My reviews

### ❤️ Wishlist (Optional - v1.1)

- [ ] `GET /customer/wishlist/` - Get wishlist
- [ ] `POST /customer/wishlist/` - Add to wishlist
  - Request: `{product_id}`
- [ ] `DELETE /customer/wishlist/{product_id}/` - Remove from wishlist

### 🔔 Notifications

- [ ] `GET /customer/notifications/` - List notifications
- [ ] `POST /customer/notifications/{id}/mark-read/` - Mark as read
- [ ] `POST /customer/notifications/mark-all-read/` - Mark all as read

---

## 🏪 Vendor Endpoints (Auth Required + IsVendor Permission)

### 🔐 Vendor Authentication

- [ ] `POST /vendor/auth/register/` - Vendor registration
  - Request: `{business_name, gst_number, pan_number, bank_details, email, phone}`
  - Response: `{status: "pending_approval", vendor_id}`
- [ ] `POST /vendor/auth/login/` - Vendor login
- [ ] `GET /vendor/auth/status/` - Check approval status
  - Response: `{status: "pending|approved|rejected", message}`

### 📦 Products (Vendor Isolated)

- [ ] `GET /vendor/products/` - List my products (paginated)
  - Query: `?status=active&search=tomato&page=1`
- [ ] `POST /vendor/products/` - Create product
  - Request: `{name, description, category_ids, variants: [...], attributes}`
- [ ] `GET /vendor/products/{id}/` - Product detail
- [ ] `PATCH /vendor/products/{id}/` - Update product
- [ ] `DELETE /vendor/products/{id}/` - Soft delete product
- [ ] `POST /vendor/products/bulk-update/` - Bulk price update
  - Request: `{product_ids: [...], action: "increase_price", value: 10}`
- [ ] `POST /vendor/products/bulk-activate/` - Activate multiple products
- [ ] `POST /vendor/products/bulk-deactivate/` - Deactivate multiple
- [ ] `POST /vendor/products/import/` - CSV import (batch upload)
- [ ] `GET /vendor/products/export/` - CSV export

### 🎨 Variants

- [ ] `POST /vendor/products/{product_id}/variants/` - Add variant
  - Request: `{name, sku, price, mrp, cost_price, unit, unit_value, weight_grams}`
- [ ] `PATCH /vendor/variants/{id}/` - Update variant
- [ ] `DELETE /vendor/variants/{id}/` - Delete variant

### 🖼️ Images

- [ ] `POST /vendor/images/validate/` - Validate ImageKit upload
  - Request: `{image_provider_id, variant_id}`
  - Checks: ownership, file size, metadata
- [ ] `POST /vendor/variants/{id}/images/` - Attach image to variant
  - Request: `{image_url, image_provider_id, is_display_image, display_order}`
- [ ] `PATCH /vendor/images/{id}/` - Update image (display order)
- [ ] `DELETE /vendor/images/{id}/` - Remove image

### 📦 Orders

- [ ] `GET /vendor/orders/` - List my order items (paginated)
  - Returns: Only OrderItems for this vendor's products
  - Query: `?status=pending&page=1`
- [ ] `GET /vendor/orders/{order_item_id}/` - Order item detail
- [ ] `POST /vendor/orders/{order_item_id}/ship/` - Mark as shipped
  - Request: `{tracking_number?, carrier?, shipped_at?}`
- [ ] `POST /vendor/orders/{order_item_id}/cancel/` - Cancel item
  - Request: `{reason}`
  - Only if not yet shipped

### 📊 Inventory

- [ ] `GET /vendor/inventory/` - List stock levels (all variants)
  - Query: `?status=low_stock`
- [ ] `POST /vendor/inventory/{variant_id}/restock/` - Add stock
  - Request: `{quantity, batch_number?, supplier?, cost_per_unit?}`
- [ ] `POST /vendor/inventory/{variant_id}/adjust/` - Manual adjustment
  - Request: `{quantity: -5, reason: "Damaged goods"}`
- [ ] `GET /vendor/inventory/logs/` - Inventory movement history
  - Query: `?variant_id=uuid&page=1`
- [ ] `GET /vendor/inventory/low-stock/` - Low stock alerts
- [ ] `GET /vendor/inventory/out-of-stock/` - Out of stock items

### 📈 Analytics

- [ ] `GET /vendor/analytics/overview/` - Dashboard summary
  - Response: `{total_revenue, pending_payouts, total_orders, avg_rating}`
- [ ] `GET /vendor/analytics/sales/` - Sales by date range
  - Query: `?start_date=2026-01-01&end_date=2026-01-31&group_by=day`
- [ ] `GET /vendor/analytics/top-products/` - Best sellers
- [ ] `GET /vendor/analytics/revenue-breakdown/` - By category/product
- [ ] `GET /vendor/analytics/pending-payouts/` - Money owed by platform

### 🔔 Notifications

- [ ] `GET /vendor/notifications/` - List notifications
  - Types: NEW_ORDER, LOW_STOCK, PAYOUT_COMPLETED
- [ ] `POST /vendor/notifications/{id}/mark-read/` - Mark as read
- [ ] `POST /vendor/notifications/mark-all-read/` - Mark all read

### 💰 Payouts

- [ ] `GET /vendor/payouts/` - Payout history
  - Response: `[{amount, status, date, transaction_id}]`
- [ ] `GET /vendor/payouts/pending/` - Pending payouts
- [ ] `POST /vendor/payouts/request/` - Request payout (if manual)

---

## 👨‍💼 Admin Endpoints (Auth Required + IsAdmin Permission)

### 🏷️ Categories

- [ ] `GET /admin/categories/` - Full category tree
- [ ] `POST /admin/orders/` - Create manual order
  - Use case: Offline order entry, phone orders
- [ ] `POST /admin/orders/{id}/generate-invoice/` - Regenerate invoice PDF

### 💳 Payments

- [ ] `GET /admin/payments/` - All payments (paginated)
  - Query: `?status=failed&date_from=2026-01-01`
- [ ] `GET /admin/payments/{id}/` - Payment detail
- [ ] `POST /admin/payments/{id}/refund/` - Initiate refund
  - Request: `{amount?, reason}`

### 🎟️ Coupons

- [ ] `GET /admin/coupons/` - List all coupons
- [ ] `POST /admin/coupons/` - Create coupon
  - Request: `{code, discount_type, discount_value, min_order_amount, start_date, end_date, usage_limit}`
- [ ] `PATCH /admin/coupons/{id}/` - Update coupon
- [ ] `DELETE /admin/coupons/{id}/` - Delete coupon
- [ ] `POST /admin/coupons/{id}/activate/` - Activate coupon
- [ ] `POST /admin/coupons/{id}/deactivate/` - Deactivate coupon

### ⭐ Reviews

- [ ] `GET /admin/reviews/` - All reviews (paginated)
  - Query: `?status=pending&rating=1` (for moderation)
- [ ] `GET /admin/reviews/{id}/` - Review detail
- [ ] `POST /admin/reviews/{id}/approve/` - Approve review
- [ ] `POST /admin/reviews/{id}/reject/` - Reject review (spam)
  - Request: `{reason}`
- [ ] `DELETE /admin/reviews/{id}/` - Delete review
- [ ] `GET /admin/reviews/pending/` - Pending moderation

### 👥 Users & Customers

- [ ] `GET /admin/users/` - All users (paginated)
  - Query: `?role=customer&search=email`
- [ ] `GET /admin/users/{id}/` - User detail
- [ ] `POST /admin/users/` - Create user
- [ ] `PATCH /admin/users/{id}/` - Update user
- [ ] `POST /admin/users/{id}/activate/` - Activate user
- [ ] `POST /admin/users/{id}/deactivate/` - Deactivate user
- [ ] `DELETE /admin/users/{id}/` - Delete user (soft delete)

### 🚚 Shipping

- [ ] `GET /admin/shipping-methods/` - List shipping methods
- [ ] `POST /admin/shipping-methods/` - Create shipping method
  - Request: `{name, base_cost, per_kg_cost, free_above?, rules: [{...}]}`
- [ ] `PATCH /admin/shipping-methods/{id}/` - Update method
- [ ] `DELETE /admin/shipping-methods/{id}/` - Delete method

### 💰 Tax Configuration

- [ ] `GET /admin/taxes/` - List tax rules
- [ ] `POST /admin/taxes/` - Create tax rule
  - Request: `{name: "GST", rate: 18, applicable_states: ["MH", "DL"]}`
- [ ] `PATCH /admin/taxes/{id}/` - Update tax rule
- [ ] `DELETE /admin/taxes/{id}/` - Delete tax rule

### 🏬 Storefront Management

#### Banners
- [ ] `GET /admin/banners/` - List banners
- [ ] `POST /admin/banners/` - Create banner
  - Request: `{title, image_url, mobile_image_url?, link_url, position, start_date, end_date, sort_order}`
- [ ] `PATCH /admin/banners/{id}/` - Update banner
- [ ] `DELETE /admin/banners/{id}/` - Delete banner
- [ ] `POST /admin/banners/{id}/activate/` - Activate banner
- [ ] `POST /admin/banners/{id}/deactivate/` - Deactivate banner

#### Featured Categories
- [ ] `GET /admin/featured-categories/` - List featured categories
- [ ] `POST /admin/featured-categories/` - Add category to featured
  - Request: `{category_id, sort_order, custom_image_url?}`
- [ ] `PATCH /admin/featured-categories/{id}/` - Update
- [ ] `DELETE /admin/featured-categories/{id}/` - Remove from featured

#### Featured Products
- [ ] `GET /admin/featured-products/` - List featured products
- [ ] `POST /admin/featured-products/` - Add to featured
  - Request: `{product_id, sort_order, expires_at?}`
- [ ] `DELETE /admin/featured-products/{id}/` - Remove from featured

#### Testimonials
- [ ] `GET /admin/testimonials/` - List testimonials
- [ ] `POST /admin/testimonials/` - Create testimonial
  - Request: `{customer_name, rating, comment, image_url?, is_active}`
- [ ] `PATCH /admin/testimonials/{id}/` - Update
- [ ] `DELETE /admin/testimonials/{id}/` - Delete

### 🎉 Promotions

- [ ] `GET /admin/promotions/` - List promotions
- [ ] `POST /admin/promotions/` - Create promotion
  - Request: `{title, description, banner_url, promo_type, discount_value, applicable_products?, start_date, end_date}`
- [ ] `PATCH /admin/promotions/{id}/` - Update promotion
- [ ] `DELETE /admin/promotions/{id}/` - Delete promotion

### 📄 CMS Pages

- [ ] `GET /admin/pages/` - List all CMS pages
- [ ] `POST /admin/pages/` - Create page
  - Request: `{slug, title, content, meta_description, is_published}`
- [ ] `PATCH /admin/pages/{id}/` - Update page
- [ ] `DELETE /admin/pages/{id}/` - Delete page

### ⚙️ Settings

- [ ] `GET /admin/settings/` - Get all settings
  - Response: `{site_name, logo_url, currency, tax_rate, ...}`
- [ ] `PATCH /admin/settings/` - Update settings (bulk)
  - Request: `{site_name: "New Name", support_email: "..."}`
- [ ] `POST /admin/settings/clear-cache/` - Clear application cache

### 📊 Analytics & Reports

#### Dashboard Overview
- [ ] `GET /admin/analytics/overview/` - Dashboard KPIs
  - Response: `{total_revenue, total_orders, active_customers, active_vendors, pending_payouts}`

#### Sales Reports
- [ ] `GET /admin/analytics/sales/` - Sales by date range
  - Query: `?start_date=2026-01-01&end_date=2026-01-31&group_by=day`
  - Response: Time-series data
- [ ] `GET /admin/analytics/sales/export/` - Export CSV
- [ ] `GET /admin/analytics/top-products/` - Best-selling products
- [ ] `GET /admin/analytics/top-categories/` - Top categories
- [ ] `GET /admin/analytics/top-vendors/` - Vendor leaderboard

#### Vendor Reports
- [ ] `GET /admin/analytics/vendor-performance/` - Vendor metrics
  - Response: `[{vendor_id, revenue, orders, avg_rating, payout_pending}]`
- [ ] `GET /admin/analytics/vendor-sales/{vendor_id}/` - Individual vendor sales

#### Customer Analytics
- [ ] `GET /admin/analytics/customer-lifetime-value/` - CLV analysis
- [ ] `GET /admin/analytics/customer-retention/` - Retention rate
- [ ] `GET /admin/analytics/cart-abandonment/` - Abandonment rate

### 📦 Inventory Management

- [ ] `GET /admin/inventory/` - Global inventory view
  - Query: `?status=low_stock&vendor_id=uuid`
- [ ] `GET /admin/inventory/logs/` - All inventory movements
- [ ] `POST /admin/inventory/{variant_id}/adjust/` - Admin stock adjustment
  - Request: `{quantity, reason: "Warehouse audit correction"}`

### 🔔 Webhooks

- [ ] `GET /admin/webhooks/` - List webhook events
  - Shows: PhonePe callbacks, failed webhooks, retry status
- [ ] `GET /admin/webhooks/{id}/` - Webhook detail
- [ ] `POST /admin/webhooks/{id}/retry/` - Retry failed webhook

### 📧 Manual Orders & Bills

- [ ] `GET /admin/manual-orders/` - List manual/offline orders
- [ ] `POST /admin/manual-orders/` - Create offline order
  - Use case: Phone orders, shop counter sales
  - Request: `{customer_details, items, payment_method: "cash", ...}`
- [ ] `PATCH /admin/manual-orders/{id}/` - Update manual order
- [ ] `DELETE /admin/manual-orders/{id}/` - Delete draft order

---

## 🔧 Utility Endpoints

### Health Check
- [ ] `GET /health/` - Application health check
  - Response: `{status: "healthy", database: "connected", redis: "connected", timestamp}`

### System Info
- [ ] `GET /system/version/` - API version info
  - Response: `{version: "1.0.0", environment: "production"}`

---

## 📝 **Response Formats**

### Success Response
```json
{
  "status": "success",
  "data": {...},
  "meta": {
    "timestamp": "2026-01-27T10:30:00Z"
  }
}
```

### Paginated Response
```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "pagination": {
      "next_cursor": "base64_encoded_cursor",
      "prev_cursor": null,
      "has_more": true,
      "count": 20
    }
  }
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["This field is required"]
    }
  },
  "meta": {
    "timestamp": "2026-01-27T10:30:00Z"
  }
}
```

---

## 🔐 **Authentication**

### Headers
```
Authorization: Bearer <access_token>
```

### Refresh Flow
1. Access token expires (15 min)
2. `POST /auth/token/refresh/` with refresh token
3. Get new access token

---

## 🎯 **Rate Limiting**

| Endpoint Type | Anonymous | Authenticated |
|---------------|-----------|---------------|
| Public Read | 100/hour | 1000/hour |
| Login/Auth | 5/minute | N/A |
| Write Operations | N/A | 100/hour |
| Payment | N/A | 10/hour |

---

## 📊 **Endpoint Priority for Development**

### Week 1 (Core MVP)
1. Auth endpoints (login, register, token refresh)
2. Product listing & detail
3. Category tree
4. Cart CRUD
5. Checkout flow (guest + logged-in)
6. Order creation
7. Payment initiation & webhook

### Week 2 (Vendor & Admin)
8. Vendor product CRUD
9. Vendor inventory management
10. Admin category management
11. Admin vendor approval
12. Order fulfillment (ship, cancel)

### Week 3 (Polish & Analytics)
13. Reviews
14. Search & autocomplete
15. Analytics dashboards
16. Notifications
17. Invoice generation
18. Bulk operations

---

## ✅ **Production Readiness Checklist**

- [ ] All endpoints have proper authentication
- [ ] All endpoints have rate limiting
- [ ] All inputs validated with serializers
- [ ] All endpoints return consistent response format
- [ ] All errors have proper HTTP status codes
- [ ] All endpoints have API documentation (Swagger)
- [ ] All write operations log audit trail
- [ ] All sensitive endpoints have CSRF protection
- [ ] All vendor endpoints enforce RLS
- [ ] All payment endpoints are idempotent
- [ ] All file uploads are validated
- [ ] All search endpoints have SQL injection protection

---

**Total Endpoints: 180+**
**Estimated Development Time: 3 weeks**
**Production Ready: Yes, with proper testing**/categories/` - Create category
- [ ] `PATCH /admin/categories/{id}/` - Update category
- [ ] `DELETE /admin/categories/{id}/` - Delete category (if no products)

### 🏪 Vendors

- [ ] `GET /admin/vendors/` - List all vendors (paginated)
  - Query: `?status=pending&search=business_name`
- [ ] `GET /admin/vendors/{id}/` - Vendor detail
- [ ] `POST /admin/vendors/` - Create vendor (manual onboarding)
- [ ] `PATCH /admin/vendors/{id}/` - Update vendor details
- [ ] `POST /admin/vendors/{id}/approve/` - Approve vendor
- [ ] `POST /admin/vendors/{id}/reject/` - Reject vendor application
  - Request: `{reason}`
- [ ] `POST /admin/vendors/{id}/suspend/` - Suspend vendor
- [ ] `PATCH /admin/vendors/{id}/commission/` - Update commission rate
  - Request: `{commission_rate: 15.5}`

### 📦 Products

- [ ] `GET /admin/products/` - All products (paginated)
  - Query: `?vendor_id=uuid&status=active&category=seeds`
- [ ] `GET /admin/products/{id}/` - Product detail
- [ ] `POST /admin/products/` - Create product (any vendor)
- [ ] `PATCH /admin/products/{id}/` - Update product
- [ ] `DELETE /admin/products/{id}/` - Soft delete
- [ ] `POST /admin/products/{id}/feature/` - Mark as featured
- [ ] `POST /admin/products/{id}/unfeature/` - Remove from featured

### 📦 Orders

- [ ] `GET /admin/orders/` - All orders (paginated)
  - Query: `?status=pending&vendor_id=uuid&customer_id=uuid&date_from=2026-01-01`
- [ ] `GET /admin/orders/{id}/` - Order detail (full info)
- [ ] `PATCH /admin/orders/{id}/` - Update order status
- [ ] `POST /admin/orders/{id}/cancel/` - Admin cancel order
  - Request: `{reason, refund: true/false}`
- [ ] `POST /admin