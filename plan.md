### File Structure

```
ecommerce_project/
├── apps/
│   ├── accounts/          # Custom user model, profiles
│   ├── catalog/           # Products, categories, variants
│   ├── inventory/         # Stock management, warehouses
│   ├── orders/            # Order processing, state machine
│   ├── cart/              # Shopping cart, guest sessions
│   ├── checkout/          # Checkout flow, guest handling
│   ├── payments/          # Payment gateway integration
│   ├── shipping/          # Shipping methods, rate calculation
│   ├── promotions/        # Coupons, discounts, campaigns
│   ├── billing/           # Invoice generation, GST compliance
│   ├── storefront/        # CMS-like customization
│   ├── offline_orders/    # Manual order entry system
│   └── analytics/         # Basic reporting, dashboards
├── core/
│   ├── middleware/
│   ├── utils/
│   ├── exceptions/
│   └── validators/
├── config/                # Settings split by environment
└── infrastructure/        # Deployment configs, scripts
```
