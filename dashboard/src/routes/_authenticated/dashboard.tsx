import React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  IndianRupee,
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
} from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '@/features/auth/auth.provider'
import { PageHeader } from '@/components/ui/PageHeader'
import { MetricCard } from '@/components/ui/MetricCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import {
  mockMetrics,
  mockOrders,
  mockProducts,
  mockSalesData,
} from '@/data/mockData'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PermissionGuard } from '@/components/PermissionGuard'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { user, isAdmin } = useAuth()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const recentOrders = mockOrders.slice(0, 5)
  const topProducts = mockProducts
    .filter((p) => p.status === 'active')
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}!`}
        description="Here's what's happening with your store today."
      />

      <div>
        <PermissionGuard roles={['admin']}>
          <button className="bg-red-600 text-white px-4 py-2 rounded">
            Admin Only Button
          </button>
        </PermissionGuard>

        <PermissionGuard
          permissions={['users:write']}
          fallback={<p className="text-gray-500">You cannot edit users</p>}
        >
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Edit Users
          </button>
        </PermissionGuard>

        <PermissionGuard
          roles={['admin', 'moderator']}
          permissions={['content:moderate']}
          requireAll={true}
        >
          <button className="bg-yellow-600 text-white px-4 py-2 rounded">
            Moderate Content (Admin/Mod + Permission)
          </button>
        </PermissionGuard>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(mockMetrics.totalRevenue)}
          change={mockMetrics.revenueChange}
          icon={IndianRupee}
        />
        <MetricCard
          title="Total Orders"
          value={mockMetrics.totalOrders.toLocaleString()}
          change={mockMetrics.ordersChange}
          icon={ShoppingCart}
        />
        {isAdmin() && (
          <MetricCard
            title="Active Vendors"
            value={mockMetrics.activeVendors}
            change={mockMetrics.vendorsChange}
            icon={Store}
          />
        )}
        <MetricCard
          title="Products Listed"
          value={mockMetrics.totalProducts.toLocaleString()}
          icon={Package}
        />
      </div>

      {/* Sales Chart */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl font-semibold text-foreground">
              Sales Overview
            </h3>
            <p className="text-sm text-muted-foreground">
              Revenue over the last 30 days
            </p>
          </div>
          <div className="flex items-center gap-2 text-success">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">+12.5% vs last month</span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockSalesData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => new Date(value).getDate().toString()}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-md)',
                }}
                labelFormatter={(value) => formatDate(value)}
                formatter={(value: number) => [
                  formatCurrency(value),
                  'Revenue',
                ]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Orders */}
        <div className="lg:col-span-3 card-elevated overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h3 className="font-serif text-xl font-semibold text-foreground">
                Recent Orders
              </h3>
              <p className="text-sm text-muted-foreground">
                Latest customer orders
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders" className="flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-muted/50 cursor-pointer"
                >
                  <TableCell className="font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2 card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-xl font-semibold text-foreground">
                Top Products
              </h3>
              <p className="text-sm text-muted-foreground">
                Best sellers this month
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/products" className="flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                  {product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.vendorName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {formatCurrency(product.variants[0]?.price || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.floor(Math.random() * 50 + 20)} sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
