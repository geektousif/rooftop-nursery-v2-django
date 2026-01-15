(A) Backend
    ## Basic Setup
        - Setup Fastify with Typescript, Eslint and Prettier
        - Draw ERD, Design API
            - Decision: Tables shouldn't hard delete - Must have soft delete (isDeleted)
            - Decision: All tables have id, createdAt, updatedAt, deletedAt

            
        - Setup CORS, Rate Limiter, Error Handler, Logger, Swagger
        - Setup Environment Variables
        - Setup Database and ORM (Drizzle)
        - Configs, constants, utils
    
    ## Advanced Setup
        - Setup Authentication & RBAC (JWT, OAuth)
        - Setup Input Validation with Zod

        - Modularize Codebase (Modular Monolith):
            - Each service has its own directory
                - /auth
                - /user
                - /category
                - /product
                - /order
                - /payment
                - /inventory
                - /storefront

            - Each directory has files:
                - index.ts (Main file - APIs)
                - validators.ts (  Validators - Zod )
                - controller.ts (Controllers)
                - service.ts (Services)
                - repository.ts (Repositories)

        - Setup Testing for critical operations:
            - Payment flow with razorpay
            - Order flow with inventory sync
    
    ## Features
        - Authentication & Authorization
            - Role Based Access Control (Admin, User, Guest)
            - JWT, OAuth
            - Phone Number Login
            
        
        - User Management
            - Register User
                - Decision: Separate table for Admins and Users because Admins would be few

            - Guest User 
                - Decision: Not separate table because Customers would be scattered
                - Distinct Guest via Mobile/Email

        - Category Management
            - Create, Read, Update, Delete
            - Nested Categories with Parent-Child Relationship
            - Image Upload
            - Search, Filter, Sort, Pagination
            
        - Product Management
            - Create, Read, Update, Delete
            - Search, Filter, Sort, Pagination
            - Image Upload
            - Connect to Category (Many-to-Many - product has many categories and category has many products)
            - Connect Reviews table
            - Maybe Add AI model for writing product description
            - Decision: slugs will be created uniquely in backend and can't be modified from storeowner
                - will be checked for uniqueness in backend
            - Need to think: How to handle Marketing tags like bestseller, newarrival, onsale etc.  

        - Product Variants Management
            - Need to Think: Product_hasVariants and varians are handled from separate table ?? or Every single product is a variant and all are actually handled from variant table???

        - Reviews Management
            - Create, Read, Update, Delete
            
        - Order Management
            - Order Creation
            - Payment Initiation via EDA
            - Order Tracking update
            - Order Cancellation 
            - Hold Inventory

        - Payment Management
            - Payment Initiation
            - Implement Idempotent Payments
            - Payment Status Update via Webhooks
            - Save Payment Details
            - Handle Reconciliations
            - Later: Handle Refunds

        - Inventory Management
            - Sync Inventory
            - Order Fulfillment
            - Hold Release Inventory
            - Inventory Logging tbale

        - Admin Panel
            - Dashboard
            - User Management
            - Category Management
            - Product Management
            - Order Management
            - Analytics
            - Inventory Management
            
        - Storefront Management
            - Catalog, Collections
            - Menu
            - Banners
            - CMS pages
            - Coupons
            - Promos
            - Shipping Cost, Rules
            - Payment Options
            - Testimonials
            - Tax Rules

(B) Database
    - Postgres
        - Primary DB
        - Background jobs
        - Queues
        
    - Redis (Upstash)

(C) Frontend
    ## Storefront
        1. Landing Page
            - Search Bar
            - Banner Slider
            - Category Grid
            - Product Grid
                - Featured Products
                - New Arrivals (or whatever - controlled by admin)
            - Testimonials (controlled by admin)
            - Footer 

        3. Products List Page
            - Filters, Sort, Pagination
            - Filtering by:
                - Price Range
                - Category
                - Collection
                
            (Use Filters via URL params):
                - From Category
                - From Search
                - From Collection
            - If variants show "Select Variant" button instead of "Add to Cart"
        4. Product Detail Page
            - Product Title, Price
            - Product Images Carousel
            - Product Description
            - Product Reviews
            - Product Variants
        5. Cart Page
            - Checkout Button
            - Cart Items
                - Quantity, Price
                - Remove Button
            - Subtotal
            - Shipping Cost
            - Coupon Code
            - Total Price
        6. Checkout Page
            - Shipping Address
            - Payment Method
            - Review Order
            - Send to Payment
        7. Payment Page
            - Return from payment gateway
            - Payment Status (Success, Failed)
        8. Order Tracking Page
            - Track Order
            - Order Status
            - Order Items
            - Shipping Address

        9. Profile Page
            - Orders
            - Address Book

       
    ## Admin Panel
        1. Dashboard
        2. Users
        3. Categories
        4. Products
        5. Orders
        6. Inventory
