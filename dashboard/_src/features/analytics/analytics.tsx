import React, { useState } from 'react'
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/PageHeader'
import { mockCategories, mockProducts, mockSalesData } from '@/data/mockData'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const COLORS = [
  'hsl(128, 28%, 25%)',
  'hsl(93, 37%, 48%)',
  'hsl(16, 53%, 64%)',
  'hsl(45, 93%, 47%)',
  'hsl(199, 89%, 48%)',
]

function Analytics() {
  const [timeRange, setTimeRange] = useState('30d')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate totals
  const totalRevenue = mockSalesData.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = mockSalesData.reduce((sum, d) => sum + d.orders, 0)
  const avgOrderValue = totalRevenue / totalOrders

  // Category data for pie chart
  const categoryData = mockCategories.slice(0, 5).map((cat, index) => ({
    name: cat.name,
    value: cat.productCount,
    color: COLORS[index],
  }))

  // Top products data
  const topProductsData = mockProducts.slice(0, 5).map((p) => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
    sales: Math.floor(Math.random() * 100) + 20,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Track your store performance">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold font-serif mt-1">
                {formatCurrency(totalRevenue)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+12.5%</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold font-serif mt-1">
                {totalOrders}
              </p>
              <div className="flex items-center gap-1 mt-2 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+8.2%</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-accent" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold font-serif mt-1">
                {formatCurrency(avgOrderValue)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-destructive">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm font-medium">-2.1%</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold font-serif mt-1">3.2%</p>
              <div className="flex items-center gap-1 mt-2 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+0.5%</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card-elevated p-6">
          <h3 className="font-serif text-lg font-semibold mb-6">
            Revenue Trend
          </h3>
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
                  tickFormatter={(value) =>
                    new Date(value).getDate().toString()
                  }
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
                  }}
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
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card-elevated p-6">
          <h3 className="font-serif text-lg font-semibold mb-6">
            Products by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {categoryData.map((cat, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                </div>
                <span className="text-muted-foreground">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders Chart */}
        <div className="card-elevated p-6">
          <h3 className="font-serif text-lg font-semibold mb-6">
            Orders Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSalesData.slice(-14)}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) =>
                    new Date(value).getDate().toString()
                  }
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                />
                <Bar
                  dataKey="orders"
                  fill="hsl(var(--accent))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="card-elevated p-6">
          <h3 className="font-serif text-lg font-semibold mb-6">
            Top Products by Sales
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
