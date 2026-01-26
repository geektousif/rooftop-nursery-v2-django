# 🚀 Rooftop Nursery: 21-Day Execution Checklist

## Pre-Development Setup (Day 0)

### Environment Setup
- [ ] VPS provisioned (2 vCPU / 4GB RAM)
- [x] Domain purchased and DNS configured
- [ ] SSL certificate setup (Let's Encrypt)
- [x] ImageKit account created (free tier)
- [x] PhonePe merchant account created
- [ ] SMTP service configured (Amazon SES / SendGrid)
- [x] GitHub repository initialized
- [ ] Project management board setup (GitHub Projects / Trello)

### Local Development Environment
- [x] PostgreSQL 18 installed locally
- [x] Redis installed locally
- [x] Node.js 20+ installed
- [x] Python 3.12+ installed
- [x] VS Code / PyCharm configured
- [x] Git hooks setup (pre-commit, black, ruff)

---

## WEEK 1: Backend Foundation (Days 1-7)

### Day 1: Project Structure & Models
**Goal: Complete Django project setup + finalize models**

#### Morning (4 hours)
- [x] Initialize Django 6 project
  ```bash
  django-admin startproject config .
  python manage.py startapp apps.users
  python manage.py startapp apps.customers
  python manage.py startapp apps.vendors
  # ... etc for all apps
  ```
- [ ] Configure `settings/` split (base.py, dev.py, prod.py)
- [x] Setup custom User model + UserManager
- [x] Create all base models (UUIDModel, TimeStampedModel, BaseModel)

#### Afternoon (4 hours)
- [ ] Complete all model definitions:
  - [x] User, Customer, Vendor
  - [x] Category (TreeNode), Product, ProductVariant
  - [x] Stock, InventoryLog
  - [x] Order, OrderItem, Payment
  - [ ] Cart, CartItem (NEW - see fixes)
  - [x] Address, Coupon
  - [x] ProductImage, ProductReview
  - [x] Banner, StorefrontSetting
  - [x] WebhookEvents

#### Evening (2 hours)
- [ ] Add all Meta options (indexes, unique_together)
- [ ] Write model validation methods
- [ ] Create initial migrations
- [ ] Run migrations on local DB
- [ ] Test models in Django shell

**✅ Milestone: All models defined and migrated**

---

### Day 2: Database Optimization & Fixtures
**Goal: Optimize DB + seed test data**

#### Morning (4 hours)
- [ ] Add missing indexes (composite indexes for common queries)
- [x] Create DB functions (UUIDv7 generation)
- [ ] Write PostgreSQL tuning config
- [ ] Setup `django-extensions` for shell_plus
- [ ] Create custom QuerySet managers

#### Afternoon (4 hours)
- [ ] Write data fixtures (fixtures/initial_data.yaml):
  - [ ] 5 sample categories (Trees, Seeds, Fertilizers, Tools, Pots)
  - [ ] 2 vendors (Admin + Test Vendor)
  - [ ] 20 products with variants
  - [ ] 10 customers
  - [ ] Sample addresses
- [ ] Load fixtures: `python manage.py loaddata initial_data`
- [ ] Test data integrity

#### Evening (2 hours)
- [ ] Write management command: `python manage.py seed_db`
- [ ] Test database queries with `django-silk` profiling
- [ ] Document query patterns

**✅ Milestone: Database optimized with test data**

---

### Day 3: Service Layer - Core Business Logic
**Goal: Implement HackSoft-style services**

#### Morning (4 hours)
- [ ] Create `apps/orders/services.py`:
  - [ ] `calculate_order_pricing(cart_items, coupon_code) -> dict`
  - [ ] `validate_stock_availability(cart_items) -> None`
  - [ ] `create_order(customer, cart_items, address, coupon) -> Order`
  - [ ] `cancel_order(order_id, reason) -> Order`

#### Afternoon (4 hours)
- [ ] Create `apps/inventory/services.py`:
  - [ ] `reserve_inventory(order_items) -> None`
  - [ ] `release_inventory(order_items) -> None`
  - [ ] `adjust_stock(variant_id, quantity, reason) -> Stock`
  - [ ] `get_low_stock_variants(vendor_id) -> QuerySet`

#### Evening (2 hours)
- [ ] Create `apps/payments/services.py`:
  - [ ] `initiate_phonepe_payment(order) -> dict`
  - [ ] `verify_phonepe_signature(payload) -> bool`
  - [ ] `process_payment_webhook(payload) -> Payment`
- [ ] Write unit tests for services

**✅ Milestone: Core business logic extracted to services**

---

### Day 4: Selectors - Read Optimizations
**Goal: Optimize all read queries**

#### Morning (4 hours)
- [ ] Create `apps/products/selectors.py`:
  - [ ] `get_products_for_storefront(filters) -> QuerySet`
  - [ ] `get_product_detail(slug) -> Product`
  - [ ] `get_featured_products(limit=10) -> QuerySet`
  - [ ] `get_best_sellers(limit=10) -> QuerySet`
  - [ ] `search_products(query) -> QuerySet`

#### Afternoon (4 hours)
- [ ] Create `apps/orders/selectors.py`:
  - [ ] `get_customer_orders(customer_id) -> QuerySet`
  - [ ] `get_vendor_orders(vendor_id) -> QuerySet`
  - [ ] `get_order_detail(order_id, user) -> Order`

#### Evening (2 hours)
- [ ] Create `apps/catalog/selectors.py`:
  - [ ] `get_category_tree() -> list`
  - [ ] `get_products_by_category(slug) -> QuerySet`
- [ ] Profile queries with django-debug-toolbar
- [ ] Ensure all selectors use select_related/prefetch_related

**✅ Milestone: All read operations optimized**

---

### Day 5: Authentication & Authorization
**Goal: JWT auth + role-based permissions**

#### Morning (4 hours)
- [ ] Install `djangorestframework-simplejwt`
- [ ] Configure JWT settings (access token 15min, refresh 7 days)
- [ ] Create authentication endpoints:
  - [ ] POST `/api/auth/register` (customer)
  - [ ] POST `/api/auth/login` (all roles)
  - [ ] POST `/api/auth/token/refresh`
  - [ ] POST `/api/auth/logout`

#### Afternoon (4 hours)
- [ ] Create custom permissions:
  - [ ] `IsVendor` - checks `request.user.role == 'vendor'`
  - [ ] `IsVendorOwner` - checks object.vendor == request.user.vendor
  - [ ] `IsCustomer` - checks `request.user.role == 'customer'`
  - [ ] `IsAdmin` - checks `request.user.is_staff`
- [ ] Write middleware: `VendorIsolationMiddleware`

#### Evening (2 hours)
- [ ] Test authentication flow with Postman
- [ ] Write integration tests for auth
- [ ] Document API authentication in README

**✅ Milestone: Secure authentication implemented**

---

### Day 6: API Endpoints - Part 1 (Catalog)
**Goal: Build storefront-facing APIs**

#### Morning (4 hours)
- [ ] Create `apps/products/views.py`:
  - [ ] GET `/api/products/` - list products (paginated)
  - [ ] GET `/api/products/{slug}/` - product detail
  - [ ] GET `/api/products/featured/` - featured products
  - [ ] GET `/api/products/best-sellers/` - best sellers
  - [ ] GET `/api/products/search/` - search products

#### Afternoon (4 hours)
- [ ] Create `apps/categories/views.py`:
  - [ ] GET `/api/categories/` - category tree
  - [ ] GET `/api/categories/{slug}/` - category detail
  - [ ] GET `/api/categories/{slug}/products/` - products in category

#### Evening (2 hours)
- [ ] Create serializers with proper field selection
- [ ] Add CursorPagination to all list views
- [ ] Test all endpoints with real data
- [ ] Write API documentation (drf-spectacular)

**✅ Milestone: Catalog APIs complete**

---

### Day 7: API Endpoints - Part 2 (Orders & Cart)
**Goal: Complete checkout flow APIs**

#### Morning (4 hours)
- [ ] Create `apps/cart/views.py`:
  - [ ] GET `/api/cart/` - get cart (merge localStorage for guests)
  - [ ] POST `/api/cart/items/` - add item
  - [ ] PATCH `/api/cart/items/{id}/` - update quantity
  - [ ] DELETE `/api/cart/items/{id}/` - remove item
  - [ ] DELETE `/api/cart/clear/` - clear cart

#### Afternoon (4 hours)
- [ ] Create `apps/orders/views.py`:
  - [ ] POST `/api/checkout/validate/` - validate cart before checkout
  - [ ] POST `/api/orders/create/` - create order
  - [ ] GET `/api/orders/` - list customer orders
  - [ ] GET `/api/orders/{id}/` - order detail
  - [ ] POST `/api/orders/{id}/cancel/` - cancel order

#### Evening (2 hours)
- [ ] Create `apps/coupons/views.py`:
  - [ ] POST `/api/coupons/validate/` - validate coupon code
- [ ] Test entire checkout flow
- [ ] Handle edge cases (out of stock, invalid coupon)

**✅ Milestone: Week 1 Complete - Backend APIs ready**

---

## WEEK 2: Integration & Vendor Features (Days 8-14)

### Day 8: PhonePe Payment Integration
**Goal: Complete payment gateway integration**

#### Morning (4 hours)
- [ ] Read PhonePe API documentation
- [ ] Setup PhonePe merchant credentials in settings
- [ ] Implement `apps/payments/services.py`:
  - [ ] `create_phonepe_order(order) -> dict`
  - [ ] `verify_phonepe_payment(merchant_tx_id) -> dict`
  - [ ] Calculate SHA256 signature for requests

#### Afternoon (4 hours)
- [ ] Create payment endpoints:
  - [ ] POST `/api/payments/initiate/` - start payment
  - [ ] GET `/api/payments/{order_id}/status/` - check status
- [ ] Implement webhook handler:
  - [ ] POST `/webhooks/phonepe/` - receive payment updates
- [ ] Add idempotency checks (prevent duplicate processing)

#### Evening (2 hours)
- [ ] Test payment flow in PhonePe sandbox
- [ ] Test webhook with ngrok locally
- [ ] Write integration tests with mocked PhonePe responses

**✅ Milestone: Payment gateway integrated**

---

### Day 9: Background Tasks & Email Notifications
**Goal: Setup async tasks using Django 6**

#### Morning (4 hours)
- [ ] Configure Django 6 background tasks
- [ ] Create `apps/notifications/tasks.py`:
  - [ ] `send_order_confirmation_email(order_id)`
  - [ ] `send_shipping_notification(order_id)`
  - [ ] `send_vendor_new_order_alert(order_item_id)`
  - [ ] `send_low_stock_alert(vendor_id)`

#### Afternoon (4 hours)
- [ ] Create email templates:
  - [ ] `emails/order_confirmation.html`
  - [ ] `emails/order_shipped.html`
  - [ ] `emails/vendor_new_order.html`
  - [ ] `emails/low_stock_alert.html`
- [ ] Use Django templates with inline CSS for email compatibility

#### Evening (2 hours)
- [ ] Test email sending locally (MailHog or Mailtrap)
- [ ] Configure SMTP for production (Amazon SES)
- [ ] Add task monitoring dashboard

**✅ Milestone: Background jobs operational**

---

### Day 10: ImageKit Integration
**Goal: Direct-to-ImageKit upload with validation**

#### Morning (4 hours)
- [ ] Setup ImageKit account and get API keys
- [ ] Create frontend upload utility:
  ```javascript
  // utils/imagekit.js
  async function uploadToImageKit(file, metadata) {
    // Direct browser upload with metadata
  }
  ```
- [ ] Add vendor_id to ImageKit custom metadata

#### Afternoon (4 hours)
- [ ] Create backend validation service:
  - [ ] `apps/images/services.py`:
    - [ ] `validate_imagekit_upload(image_id, vendor_id) -> dict`
    - [ ] `delete_imagekit_image(image_id) -> bool`
- [ ] Create API endpoints:
  - [ ] POST `/api/images/validate/` - validate uploaded image
  - [ ] DELETE `/api/images/{id}/` - delete image

#### Evening (2 hours)
- [ ] Test upload flow end-to-end
- [ ] Handle upload errors gracefully
- [ ] Add image optimization settings (resize on upload)

**✅ Milestone: Image uploads working**

---

### Day 11: Vendor Panel APIs - Part 1
**Goal: Vendor product management APIs**

#### Morning (4 hours)
- [ ] Create `apps/vendors/views.py` (products):
  - [ ] GET `/api/vendor/products/` - list vendor's products
  - [ ] POST `/api/vendor/products/` - create product
  - [ ] GET `/api/vendor/products/{id}/` - product detail
  - [ ] PATCH `/api/vendor/products/{id}/` - update product
  - [ ] DELETE `/api/vendor/products/{id}/` - soft delete product

#### Afternoon (4 hours)
- [ ] Create variant management APIs:
  - [ ] POST `/api/vendor/products/{id}/variants/` - add variant
  - [ ] PATCH `/api/vendor/variants/{id}/` - update variant
  - [ ] DELETE `/api/vendor/variants/{id}/` - delete variant
- [ ] Add vendor isolation checks to all endpoints

#### Evening (2 hours)
- [ ] Create image management APIs:
  - [ ] POST `/api/vendor/variants/{id}/images/` - attach image
  - [ ] PATCH `/api/vendor/images/{id}/` - update order/display
  - [ ] DELETE `/api/vendor/images/{id}/` - remove image
- [ ] Test CRUD operations with RLS

**✅ Milestone: Vendor product management ready**

---

### Day 12: Vendor Panel APIs - Part 2
**Goal: Order fulfillment & inventory APIs**

#### Morning (4 hours)
- [ ] Create vendor order APIs:
  - [ ] GET `/api/vendor/orders/` - list orders (only items for this vendor)
  - [ ] GET `/api/vendor/orders/{id}/` - order item detail
  - [ ] POST `/api/vendor/orders/{item_id}/ship/` - mark as shipped
  - [ ] POST `/api/vendor/orders/{item_id}/cancel/` - cancel item

#### Afternoon (4 hours)
- [ ] Create inventory management APIs:
  - [ ] GET `/api/vendor/inventory/` - list stock levels
  - [ ] POST `/api/vendor/inventory/{variant_id}/adjust/` - manual adjustment
  - [ ] GET `/api/vendor/inventory/logs/` - inventory movement history
  - [ ] GET `/api/vendor/inventory/low-stock/` - low stock alerts

#### Evening (2 hours)
- [ ] Create vendor analytics APIs:
  - [ ] GET `/api/vendor/analytics/sales/` - sales summary
  - [ ] GET `/api/vendor/analytics/top-products/` - best sellers
  - [ ] GET `/api/vendor/analytics/pending-payouts/` - money owed
- [ ] Test all vendor APIs with multiple vendors

**✅ Milestone: Vendor panel backend complete**

---

### Day 13: Admin Panel APIs
**Goal: Admin-specific management APIs**

#### Morning (4 hours)
- [ ] Create admin user management:
  - [ ] GET `/api/admin/users/` - list all users
  - [ ] GET `/api/admin/vendors/` - list vendors
  - [ ] PATCH `/api/admin/vendors/{id}/approve/` - approve vendor
  - [ ] POST `/api/admin/vendors/{id}/commission/` - update commission

#### Afternoon (4 hours)
- [ ] Create storefront management APIs:
  - [ ] GET/POST/PATCH/DELETE `/api/admin/banners/`
  - [ ] GET/POST/PATCH/DELETE `/api/admin/settings/`
  - [ ] POST `/api/admin/products/{id}/feature/` - mark featured
  - [ ] GET `/api/admin/orders/` - all orders overview

#### Evening (2 hours)
- [ ] Create admin analytics:
  - [ ] GET `/api/admin/analytics/overview/` - GMV, orders, customers
  - [ ] GET `/api/admin/analytics/vendors/` - vendor performance
- [ ] Test admin isolation from vendors

**✅ Milestone: Admin APIs complete**

---

### Day 14: API Documentation & Testing
**Goal: Polish APIs with docs and tests**

#### Morning (4 hours)
- [ ] Setup drf-spectacular for OpenAPI docs
- [ ] Add docstrings to all views/serializers
- [ ] Generate Swagger UI at `/api/docs/`
- [ ] Write Postman collection for all endpoints

#### Afternoon (4 hours)
- [ ] Write integration tests:
  - [ ] Test complete checkout flow
  - [ ] Test vendor product creation
  - [ ] Test payment webhook processing
  - [ ] Test RLS (vendor can't access other vendor's data)

#### Evening (2 hours)
- [ ] Code review of all services and views
- [ ] Fix any N+1 query issues
- [ ] Run test coverage report (aim for >80%)

**✅ Milestone: Week 2 Complete - Backend fully tested**

---

## WEEK 3: Frontend & Deployment (Days 15-21)

### Day 15: Storefront Frontend - Setup & Layout
**Goal: Initialize TanStack Start + basic layout**

#### Morning (4 hours)
- [ ] Initialize TanStack Start project:
  ```bash
  npm create @tanstack/start@latest
  ```
- [ ] Setup TailwindCSS with custom config (Botanical theme)
- [ ] Install dependencies: axios, zustand, react-query
- [ ] Create design system components:
  - [ ] Button, Input, Card, Badge
  - [ ] ProductCard, CategoryCard

#### Afternoon (4 hours)
- [ ] Create layout components:
  - [ ] Header (logo, search, cart icon, auth buttons)
  - [ ] Footer (links, newsletter signup)
  - [ ] MobileNav (hamburger menu)
- [ ] Setup routing structure:
  - [ ] `/` - homepage
  - [ ] `/products` - product listing
  - [ ] `/products/:slug` - product detail
  - [ ] `/cart` - cart page
  - [ ] `/checkout` - checkout flow

#### Evening (2 hours)
- [ ] Create API client utility:
  ```typescript
  // lib/api.ts
  import axios from 'axios';
  
  export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });
  ```
- [ ] Setup Zustand store for cart management

**✅ Milestone: Storefront foundation ready**

---

### Day 16: Storefront - Product Pages
**Goal: Build product listing and detail pages**

#### Morning (4 hours)
- [ ] Build homepage:
  - [ ] Hero section with banner carousel
  - [ ] Featured products grid
  - [ ] Category cards
  - [ ] Best sellers section
- [ ] Implement SSR for homepage (SEO)

#### Afternoon (4 hours)
- [ ] Build product listing page (`/products`):
  - [ ] Category filter sidebar
  - [ ] Product grid with lazy loading
  - [ ] Search bar integration
  - [ ] Sort options (price, popularity, newest)

#### Evening (2 hours)
- [ ] Build product detail page:
  - [ ] Image gallery (zoom on hover)
  - [ ] Variant selector (dropdown)
  - [ ] Add to cart button
  - [ ] Product description tabs
  - [ ] Reviews section (read-only for now)
- [ ] Implement SSR for product pages

**✅ Milestone: Product browsing functional**

---

### Day 17: Storefront - Cart & Checkout
**Goal: Complete purchase flow**

#### Morning (4 hours)
- [ ] Build cart page:
  - [ ] Cart item list with quantity controls
  - [ ] Price summary (subtotal, tax, shipping, total)
  - [ ] Coupon code input
  - [ ] "Proceed to Checkout" button
- [ ] Implement cart sync (localStorage → backend on login)

#### Afternoon (4 hours)
- [ ] Build checkout flow:
  - [ ] Step 1: Shipping address form (with validation)
  - [ ] Step 2: Order review (items, address, total)
  - [ ] Step 3: Payment (redirect to PhonePe)
- [ ] Guest checkout: ask for email + phone only

#### Evening (2 hours)
- [ ] Build order confirmation page:
  - [ ] Success message
  - [ ] Order summary with order number
  - [ ] "Track Order" button
- [ ] Build order tracking page
- [ ] Test entire flow end-to-end

**✅ Milestone: Checkout flow complete**

---

### Day 18: Admin & Vendor Panels
**Goal: Build React SPAs for internal tools**

#### Morning (4 hours)
- [ ] Initialize React + Vite projects:
  ```bash
  npm create vite@latest admin-panel -- --template react-ts
  npm create vite@latest vendor-panel -- --template react-ts
  ```
- [ ] Install Refine.dev + Ant Design
- [ ] Setup API client with JWT auth
- [ ] Create login page for both panels

#### Afternoon (4 hours)
- [ ] Build Vendor Panel pages:
  - [ ] Dashboard (sales overview, pending orders)
  - [ ] Products list + CRUD forms
  - [ ] Orders list with fulfillment actions
  - [ ] Inventory management table
- [ ] Use Refine's auto-generated CRUD

#### Evening (2 hours)
- [ ] Build Admin Panel pages:
  - [ ] Dashboard (GMV, total orders, vendors)
  - [ ] Vendor management (approve/reject)
  - [ ] Banner management (CRUD)
  - [ ] Settings page (StorefrontSetting)
- [ ] Build both apps and test locally

**✅ Milestone: Internal panels functional**

---

### Day 19: VPS Deployment - Infrastructure
**Goal: Setup production environment**

#### Morning (4 hours)
- [ ] SSH into VPS and setup:
  ```bash
  apt update && apt upgrade
  apt install postgresql-18 redis nginx python3.12 python3-pip nodejs npm
  ```
- [ ] Configure PostgreSQL:
  - [ ] Create database and user
  - [ ] Apply tuning config (shared_buffers, etc.)
  - [ ] Enable UUIDv7 extension
- [ ] Configure Redis (bind to localhost only)

#### Afternoon (4 hours)
- [ ] Deploy Django application:
  - [ ] Clone repo to `/var/www/rooftopnursery/`
  - [ ] Create virtual environment
  - [ ] Install dependencies: `pip install -r requirements.txt`
  - [ ] Set environment variables in `.env`
  - [ ] Run migrations: `python manage.py migrate`
  - [ ] Collect static files: `python manage.py collectstatic`

#### Evening (2 hours)
- [ ] Setup Gunicorn:
  - [ ] Create systemd service file
  - [ ] Start service: `systemctl start gunicorn`
  - [ ] Enable on boot: `systemctl enable gunicorn`
- [ ] Test Django API accessibility

**✅ Milestone: Backend deployed**

---

### Day 20: VPS Deployment - Frontend & Nginx
**Goal: Deploy all frontend apps**

#### Morning (4 hours)
- [ ] Build frontend apps:
  ```bash
  # Storefront
  cd storefront && npm run build
  
  # Admin Panel
  cd admin-panel && npm run build
  
  # Vendor Panel
  cd vendor-panel && npm run build
  ```
- [ ] Copy built files to VPS:
  ```bash
  scp -r storefront/.output/ user@vps:/var/www/rooftopnursery/storefront/
  scp -r admin-panel/dist/ user@vps:/var/www/rooftopnursery/admin-panel/
  scp -r vendor-panel/dist/ user@vps:/var/www/rooftopnursery/vendor-panel/
  ```

#### Afternoon (4 hours)
- [ ] Configure Nginx:
  - [ ] Create site config in `/etc/nginx/sites-available/rooftopnursery`
  - [ ] Setup reverse proxy for Django API
  - [ ] Serve static files for admin/vendor panels
  - [ ] Proxy TanStack Start SSR app (port 3000)
  - [ ] Enable gzip compression
  - [ ] Add rate limiting for API endpoints
- [ ] Setup SSL with Let's Encrypt:
  ```bash
  certbot --nginx -d rooftopnursery.com -d www.rooftopnursery.com
  ```

#### Evening (2 hours)
- [ ] Setup TanStack Start as systemd service
- [ ] Test all routes:
  - [ ] https://rooftopnursery.com (storefront)
  - [ ] https://rooftopnursery.com/api/docs/ (API docs)
  - [ ] https://rooftopnursery.com/admin-panel/ (admin)
  - [ ] https://rooftopnursery.com/vendor-panel/ (vendor)
- [ ] Configure firewall (ufw allow 80,443)

**✅ Milestone: Full stack deployed**

---

### Day 21: Testing, Monitoring & Launch
**Goal: Final QA and go live**

#### Morning (4 hours)
- [ ] End-to-end testing:
  - [ ] Register as customer → browse → add to cart → checkout → pay
  - [ ] Register as vendor → add products → receive order → mark shipped
  - [ ] Login as admin → approve vendor → manage banners
- [ ] Test on multiple devices (mobile, tablet, desktop)
- [ ] Test PhonePe payment in production mode

#### Afternoon (3 hours)
- [ ] Setup monitoring:
  - [ ] Install New Relic / Sentry for error tracking
  - [ ] Setup Uptime Robot for downtime alerts
  - [ ] Configure log rotation (logrotate)
  - [ ] Setup database backups (pg_dump cron job)
- [ ] Create runbook document:
  - [ ] How to restart services
  - [ ] How to check logs
  - [ ] Emergency contacts

#### Evening (3 hours)
- [ ] Performance optimization:
  - [ ] Run Lighthouse audit (aim for >90 score)
  - [ ] Optimize images on ImageKit
  - [ ] Enable Redis caching for product listings
  - [ ] Test under load (Apache Bench / k6)
- [ ] **GO LIVE** 🚀
  - [ ] Announce on social media
  - [ ] Send launch email to test users
  - [ ] Monitor logs for first 2 hours

**✅ MILESTONE: PRODUCTION LAUNCH COMPLETE**

---

## Post-Launch Checklist (Days 22-30)

### Immediate Priorities
- [ ] Monitor error rates daily (Sentry dashboard)
- [ ] Gather user feedback (feedback form in app)
- [ ] Fix critical bugs within 24 hours
- [ ] Optimize slow queries (check PostgreSQL slow query log)

### Week 4 Enhancements
- [ ] Add product reviews functionality
- [ ] Implement order cancellation by customers
- [ ] Add vendor payout tracking
- [ ] Build invoice generation (WeasyPrint)
- [ ] Add search autocomplete (Elasticsearch or pg_trgm)

### Week 5-6 Features
- [ ] Implement wishlist
- [ ] Add product comparison
- [ ] Build loyalty points system
- [ ] Add SMS notifications (Twilio)
- [ ] Implement vendor analytics dashboard

---

## Non-Technical Checklist

### Legal & Compliance
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Refund/Return Policy page
- [ ] Shipping Policy page
- [ ] GST compliance verification
- [ ] GDPR cookie consent banner (if targeting EU)

### Business Setup
- [ ] Business bank account opened
- [ ] PhonePe merchant verification completed
- [ ] GST registration (if applicable)
- [ ] Insurance for business (optional)
- [ ] Accounting software setup (Zoho Books / Tally)

### Marketing Assets
- [ ] Logo design finalized
- [ ] Brand guidelines document
- [ ] Social media accounts created (Instagram, Facebook)
- [ ] Google My Business listing
- [ ] First 20 product listings with descriptions
- [ ] Product photography (seed packets, plants)

### Customer Support
- [ ] Support email setup (support@rooftopnursery.com)
- [ ] WhatsApp Business account
- [ ] FAQ page with common questions
- [ ] Order tracking help documentation
- [ ] Vendor onboarding guide (PDF)

---

## Critical Success Metrics (Week 1 Post-Launch)

### Technical KPIs
- [ ] API response time < 200ms (p95)
- [ ] Zero payment failures
- [ ] Server uptime > 99.5%
- [ ] Page load time < 3s (Lighthouse)

### Business KPIs
- [ ] 10+ vendors onboarded
- [ ] 100+ products listed
- [ ] First successful order placed
- [ ] Zero cart abandonment due to bugs
- [ ] 5+ customer reviews collected

---



## Daily Standup Template (During Build Phase)

**What I completed yesterday:**
- [ ] Task 1
- [ ] Task 2

**What I'm working on today:**
- [ ] Task 3
- [ ] Task 4

**Blockers:**
- [ ] Issue 1 (resolution plan)

**On track for deadline?** ✅ / ⚠️ / ❌

---

*Last Updated: Day 0*
*Next Review: Day 7 (End of Week 1)*