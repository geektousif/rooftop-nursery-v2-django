# Mock API Setup & Usage

This admin panel comes pre-configured with a mock API system for development and preview purposes. No backend server setup is required to test all features.

## Mock Data Included

The mock API provides realistic sample data:

- **5 Products** - Various houseplants with variants, stock levels, and approval statuses
- **3 Orders** - Sample orders with different statuses (pending, confirmed, shipped)
- **4 Customers** - Test customer data with order history
- **3 Vendors** - Vendor profiles with commission rates and revenue data
- **Dashboard Metrics** - Key KPIs and sales data for analytics

## Mock API Endpoints

All mock endpoints are prefixed with `/api/mock`:

### Products
- `GET /api/mock/products` - List products with filtering
  - Query params: `q` (search), `status`, `category`
- `POST /api/mock/products` - Create new product

### Orders
- `GET /api/mock/orders` - List orders with filtering
  - Query params: `status`, `customerId`
- `POST /api/mock/orders` - Create new order

### Customers
- `GET /api/mock/customers` - List customers
  - Query params: `q` (search)

### Vendors
- `GET /api/mock/vendors` - List vendors
  - Query params: `status`
- `POST /api/mock/vendors` - Create new vendor

### Analytics
- `GET /api/mock/analytics` - Get dashboard metrics and sales data

## Image Upload

The image uploader uses a simple base64 encoding system perfect for preview and testing:

1. **Drag & Drop** - Drag image files directly onto the upload area
2. **Click to Browse** - Or click to select files from your device
3. **Instant Preview** - Images display immediately as base64 data URLs
4. **Base64 Storage** - Images are stored as base64 strings in the form data

This is ideal for development but **should not be used in production**. For production:

- **ImageKit** - Already integrated (see `/docs/API_INTEGRATION.md`)
- **Vercel Blob** - Alternative cloud storage
- **AWS S3** - Enterprise storage solution

## Mock Data Structure

Mock data is stored in `/lib/mock-data.ts`:

```typescript
export const mockProducts: Product[]
export const mockOrders: Order[]
export const mockCustomers: Customer[]
export const mockVendors: Vendor[]
export const mockDashboardMetrics: DashboardMetrics
export const mockSalesData: SalesData[]
```

## Testing Features

### With Mock API, You Can Test:

✓ Product CRUD operations
✓ Order management and status updates
✓ Customer search and filtering
✓ Vendor approvals
✓ Dashboard analytics
✓ Image uploading and preview
✓ Authentication and role-based access
✓ Form validation
✓ Error handling
✓ Data filtering and sorting

### What Requires Real Backend:

- Payment processing
- Email notifications
- PDF invoice generation (stub endpoint only)
- Actual vendor payouts
- Real inventory updates
- Customer communication

## Switching to Production API

When you're ready to connect to your real backend:

### 1. Update API Base URL

Set the `NEXT_PUBLIC_API_URL` environment variable:

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://your-api.com/api
```

### 2. Update API Client

The API client automatically uses the production URL if `NEXT_PUBLIC_API_URL` is set. Routes should follow the same pattern:

```typescript
GET /api/products
GET /api/orders
GET /api/customers
GET /api/vendors
GET /api/analytics
```

### 3. Mock Data Still Available

You can keep the mock API routes during development:
- Routes are at `/api/mock/*`
- Production routes should be at `/api/*`
- No conflicts between the two systems

## Demo Credentials

Test the admin panel with these demo accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@rooftop.com | admin123 | Admin |
| vendor@rooftop.com | vendor123 | Vendor |

These are configured in the login API route (`/app/api/auth/login/route.ts`).

## API Response Format

All mock API endpoints follow this standard format:

```typescript
// GET /api/mock/products
{
  "products": [
    { id: "prod-001", name: "...", ... },
    ...
  ]
}

// POST /api/mock/products
{
  "id": "prod-new",
  "name": "...",
  ...
}
```

## Error Handling

The API client includes error handling for:

- Network failures
- Invalid responses
- Authentication errors
- Validation errors

Mock routes don't simulate errors, but your production API should handle:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Server Error

## Performance Notes

- Mock API responses are instant (no network latency)
- Data is loaded on every request (no caching)
- Perfect for UI development and testing
- Not suitable for load testing

## Next Steps

1. Test all UI flows with mock data
2. Verify role-based permissions work correctly
3. Test image uploads and preview
4. Check form validation and error states
5. Review the API integration documentation
6. Connect to your real backend API when ready

See `/docs/API_INTEGRATION.md` for detailed backend integration guidelines.
