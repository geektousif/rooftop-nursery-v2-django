# Quick Start Guide

Get the admin panel running in seconds with no backend setup required!

## Installation

### Option 1: Using shadcn CLI (Recommended)

```bash
# Install using shadcn CLI
npx shadcn-cli@latest init my-admin-panel
# Choose this project when prompted

# Or add to existing project
npx shadcn-cli@latest add rooftop-admin

# Install dependencies
npm install

# Start development server
npm run dev
```

### Option 2: Download & Install Manually

```bash
# Extract the project
cd admin-panel

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:3000`

## First Time Setup

### 1. Login to Dashboard

Navigate to `http://localhost:3000/login` and use these credentials:

```
Email: admin@rooftop.com
Password: admin123
```

Or login as a vendor:

```
Email: vendor@rooftop.com
Password: vendor123
```

### 2. Explore Mock Data

The dashboard comes pre-loaded with sample data:

- **5 products** - Ready to edit or delete
- **3 orders** - Various statuses to test
- **4 customers** - Browse and search
- **3 vendors** - Approve or manage
- **Analytics** - Real-time metrics dashboard

### 3. Test Features

Try these actions right away:

- ✅ Search and filter products
- ✅ Create a new product
- ✅ Upload images via drag & drop
- ✅ Update product prices
- ✅ View and manage orders
- ✅ Check customer spending
- ✅ Generate PDF invoices
- ✅ Change your profile settings

## File Structure

```
admin-panel/
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication routes
│   │   ├── mock/              # Mock API endpoints
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   ├── vendors/
│   │   │   └── analytics/
│   │   └── uploads/           # File uploads
│   ├── dashboard/             # Protected admin routes
│   │   ├── products/          # Product management
│   │   ├── orders/            # Order management
│   │   ├── customers/         # Customer data
│   │   ├── vendors/           # Vendor management
│   │   ├── analytics/         # Analytics dashboard
│   │   └── settings/          # Admin settings
│   ├── login/                 # Login page
│   ├── layout.tsx             # Root layout with auth
│   └── globals.css            # Theme and styles
├── components/
│   ├── ui/                    # Shadcn UI components
│   ├── dashboard/             # Dashboard components
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── simple-image-uploader.tsx
│   └── ...
├── lib/
│   ├── types.ts               # TypeScript types
│   ├── permissions.ts         # Role-based access control
│   ├── api-client.ts          # API client with mock endpoints
│   ├── mock-data.ts           # Sample data
│   ├── pdf-generator.ts       # PDF invoice generation
│   └── ...
├── contexts/
│   └── AuthContext.tsx        # Authentication context
└── docs/
    ├── MOCK_API.md            # Mock API documentation
    ├── API_INTEGRATION.md     # Backend integration guide
    ├── DEPLOYMENT.md          # Deployment instructions
    └── QUICKSTART.md          # This file
```

## Key Features Explained

### Role-Based Access Control

The app includes two demo roles:

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| **Admin** | Everything | N/A |
| **Vendor** | Manage own products, View orders | Manage vendors, Analytics |

Check permissions in `/lib/permissions.ts`

### Product Management

Create, edit, and manage products with:
- Image uploads (drag & drop or click)
- Product variants (sizes, colors, etc.)
- Stock tracking
- Approval workflows
- Category management

### Order Management

Track orders from creation to delivery:
- Create manual orders
- Update order status
- Generate PDF invoices
- Customer tracking
- Shipping management

### Image Uploads

Use the built-in image uploader:
- Drag and drop support
- Multi-file upload (up to 4 images)
- Instant preview
- Base64 encoding for development
- Easy to swap with ImageKit or S3

### Analytics Dashboard

View key metrics:
- Total revenue and trends
- Order count and growth
- Vendor performance
- Product popularity
- Sales charts

## Environment Variables

No environment variables required for development!

For production, set these in your `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api.com/api

# Image Upload (Optional)
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id

IMAGEKIT_PRIVATE_KEY=your_private_key
```

## Common Tasks

### Add New Product

1. Go to Dashboard > Products
2. Click "Add Product"
3. Fill in product details
4. Upload images
5. Add variants if needed
6. Click "Create Product"

### Create Manual Order

1. Go to Dashboard > Orders
2. Click "Create Order"
3. Select customer (or add new)
4. Add products and quantities
5. Set shipping address
6. Click "Create Order"

### Generate Invoice

1. Go to Dashboard > Orders
2. Click on an order
3. Click "Download Invoice"
4. PDF is generated automatically

### Upload Product Images

1. In the Images tab, drag images or click to browse
2. Preview appears instantly
3. Click X to remove
4. Maximum 4 images allowed

### Change User Settings

1. Click your profile in top right
2. Update name, email, password
3. Upload new avatar
4. Click "Save Settings"

## Deployment

Ready to go live? See `/docs/DEPLOYMENT.md` for options:

- Deploy to Vercel (recommended)
- Deploy to AWS/Google Cloud
- Deploy to Docker
- Self-hosted on VPS

## Troubleshooting

### Images not uploading?

- Check browser console for errors
- Ensure images are under 10MB
- Clear browser cache and reload
- Try different image format

### API calls failing?

- Check if dev server is running on port 3000
- Mock API is built-in, no setup needed
- Check Network tab in browser DevTools
- Ensure you're logged in (check auth token)

### Styling issues?

- Theme uses forest green color scheme
- Check `/app/globals.css` for custom colors
- Tailwind CSS v4 is configured
- Light and dark mode supported

### Login not working?

- Use exact credentials: `admin@rooftop.com` / `admin123`
- Check browser console for auth errors
- Clear cookies and try again
- Auth tokens stored in HTTP-only cookies

## Next Steps

1. ✅ Run the app locally
2. ✅ Test with mock data
3. ✅ Explore the UI and features
4. ✅ Read `/docs/API_INTEGRATION.md` for backend setup
5. ✅ Connect to your real API
6. ✅ Deploy to production

## Support

- Check `/docs` folder for detailed guides
- Review component source code for implementation details
- Inspect the mock data in `/lib/mock-data.ts`
- Check browser console for error messages

## Key Technologies

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Sonner** - Toast notifications
- **Zod** - Schema validation
- **html2pdf** - Invoice generation

Happy building! 🚀
