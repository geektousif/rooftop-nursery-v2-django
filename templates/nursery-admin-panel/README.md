# Rooftop Nursery - Production Grade Ecommerce Admin Panel

A comprehensive, production-ready ecommerce admin dashboard built with Next.js 16, React, TypeScript, and Tailwind CSS. Features role-based access control, inventory management, order processing, vendor management, and analytics.

## Features

### 🔐 Authentication & Authorization
- Role-based access control (Admin, Vendor)
- JWT token-based authentication with HTTP-only cookies
- Permission system for fine-grained access control
- Secure login page with credential validation

### 📦 Products Management
- Full product CRUD operations
- Product variants (size, color, attributes)
- ImageKit integration for image uploads with optimization
- Inventory tracking with stock status indicators
- Product filtering by category, status
- Bulk actions and search functionality
- Pending product approvals (Admin only)

### 📋 Orders Management
- Order creation and tracking
- Order status management (Pending → Confirmed → Shipped → Delivered)
- Manual order creation for offline channels
- Customer details and shipping address management
- Invoice generation with html2pdf
- Order timeline and payment status tracking

### 🛍️ Customers & Vendors
- Customer directory with order history and spending
- Vendor management with approval workflow
- Vendor commission calculation
- Payout tracking and payment status
- Vendor performance metrics

### 📊 Analytics & Reports
- Dashboard with key metrics and KPIs
- Sales trends and revenue charts
- Product performance analysis
- Category-wise sales distribution
- Date range filtering for reports

### ⚙️ Settings & Configuration
- User profile management
- Password management
- Store information settings
- Shipping configuration
- Two-factor authentication support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Authentication**: Custom JWT
- **Image Hosting**: ImageKit
- **PDF Generation**: html2pdf
- **Form Handling**: React Hook Form
- **Notifications**: Sonner

## Project Structure

```
├── app/
│   ├── dashboard/           # Protected dashboard routes
│   │   ├── layout.tsx       # Dashboard layout with auth check
│   │   ├── page.tsx         # Dashboard home
│   │   ├── products/        # Products management
│   │   ├── orders/          # Orders management
│   │   ├── customers/       # Customers list
│   │   ├── vendors/         # Vendors management
│   │   ├── analytics/       # Analytics dashboard
│   │   └── settings/        # User settings
│   ├── login/               # Login page
│   ├── api/                 # API routes
│   │   └── auth/            # Authentication endpoints
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Home redirect
├── components/
│   ├── dashboard/           # Dashboard components
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── image-uploader.tsx   # ImageKit upload component
│   └── ui/                  # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx      # Auth state management
├── lib/
│   ├── permissions.ts       # Role-based permissions
│   ├── types.ts             # TypeScript type definitions
│   ├── api-client.ts        # API integration layer
│   ├── pdf-generator.ts     # Invoice PDF generation
│   ├── imagekit.ts          # ImageKit configuration
│   └── utils.ts             # Utility functions
└── public/                  # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo>
   cd rooftop-nursery-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000/api

   # ImageKit Configuration (Optional)
   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## Demo Credentials

### Admin Account
- **Email**: `admin@rooftop.com`
- **Password**: `admin123`
- **Access**: Full admin features including vendor management, settings

### Vendor Account
- **Email**: `vendor@rooftop.com`
- **Password**: `vendor123`
- **Access**: Products, orders, analytics (limited)

## API Integration

### Setup Your Backend API

Replace the mock API endpoints in `/lib/api-client.ts` with your actual backend endpoints:

```typescript
// Example: productsAPI.getAll()
const response = await fetch('https://your-api.com/products');
```

### Required Endpoints

#### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/orders/:id/invoice` - Get invoice

#### Vendors
- `GET /api/vendors` - List vendors
- `POST /api/vendors/:id/approve` - Approve vendor
- `GET /api/vendors/payouts` - Get payouts

## ImageKit Integration

### Setup ImageKit

1. Sign up at [ImageKit.io](https://imagekit.io)
2. Get your credentials from the dashboard
3. Add credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key
   NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
   IMAGEKIT_PRIVATE_KEY=your_private_key
   ```

### Image Upload Component

Use the `ImageUploader` component for product images:

```tsx
import { ImageUploader } from '@/components/image-uploader'

export function MyComponent() {
  return (
    <ImageUploader
      maxFiles={5}
      multiple={true}
      onUpload={(urls) => console.log(urls)}
    />
  )
}
```

## PDF Invoice Generation

Invoices are generated using html2pdf. The `generateInvoicePDF()` function in `/lib/pdf-generator.ts` creates professional invoices:

```typescript
import { generateInvoicePDF } from '@/lib/pdf-generator'

// Generate and download invoice
generateInvoicePDF(order, {
  companyName: 'Rooftop Nursery',
  companyAddress: '123 Green Street...'
})
```

## Authentication Flow

1. User submits login credentials
2. Backend validates and returns JWT token
3. Token stored in HTTP-only cookie
4. Protected routes check authentication status
5. Logout clears token and redirects to login

## Role-Based Access Control

Permissions are defined in `/lib/permissions.ts`:

### Admin Permissions
- All dashboard access
- Product approval
- Vendor management
- Customer management
- Settings management

### Vendor Permissions
- View own products
- Manage own orders
- View own analytics
- Update own profile

## Customization

### Change Theme Colors

Edit `/app/globals.css` to modify the color scheme:

```css
:root {
  /* Forest Green Primary */
  --primary: oklch(0.35 0.09 138);
  /* Terracotta Accent */
  --accent: oklch(0.64 0.15 30);
  /* ... other colors */
}
```

### Modify Dashboard Layout

Dashboard layout components are in `/components/dashboard/`:
- `sidebar.tsx` - Navigation sidebar
- `header.tsx` - Top header with user menu

## Security Considerations

- ✅ HTTP-only cookies for auth tokens
- ✅ Role-based access control
- ✅ Protected routes with authentication checks
- ✅ CSRF protection ready
- ✅ Input validation with Zod schemas
- ⚠️ **TODO**: Implement rate limiting
- ⚠️ **TODO**: Add audit logging
- ⚠️ **TODO**: Enable HTTPS in production

## Performance Optimization

- Server-side rendering for critical pages
- Image optimization with ImageKit
- Component code splitting
- Lazy loading of routes
- Caching strategies for API responses

## Future Enhancements

- [ ] Multi-language support (i18n)
- [ ] Dark mode toggle
- [ ] Advanced product filters
- [ ] Bulk order processing
- [ ] Email notifications
- [ ] SMS alerts for orders
- [ ] Inventory forecasting
- [ ] AI-powered recommendations
- [ ] Mobile app support
- [ ] API rate limiting and monitoring

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
vercel deploy
```

### Deploy to Other Platforms

The project is compatible with any Node.js hosting:
- AWS
- Azure
- Google Cloud
- DigitalOcean
- Railway
- Render

## Support & Contributing

For issues, feature requests, or contributions, please open an issue or submit a pull request.

## License

MIT License - feel free to use this project for personal and commercial use.

## Support

- Documentation: [Next.js Docs](https://nextjs.org/docs)
- UI Components: [shadcn/ui](https://ui.shadcn.com)
- Styling: [Tailwind CSS](https://tailwindcss.com)
- Charts: [Recharts](https://recharts.org)

---

**Built with ❤️ for ecommerce businesses**
