'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { TrendingUp, ShoppingCart, Users, Package } from 'lucide-react'

// Mock data
const chartData = [
  { date: 'Jan 1', revenue: 2400, orders: 24 },
  { date: 'Jan 2', revenue: 1398, orders: 13 },
  { date: 'Jan 3', revenue: 9800, orders: 45 },
  { date: 'Jan 4', revenue: 3908, orders: 32 },
  { date: 'Jan 5', revenue: 4800, orders: 38 },
  { date: 'Jan 6', revenue: 3800, orders: 28 },
]

const recentOrders = [
  { id: 'ORD-001', customer: 'John Doe', total: 1200, status: 'delivered' },
  { id: 'ORD-002', customer: 'Jane Smith', total: 850, status: 'shipped' },
  { id: 'ORD-003', customer: 'Bob Johnson', total: 2300, status: 'confirmed' },
]

const topProducts = [
  { name: 'Monstera Deliciosa', sales: 245 },
  { name: 'Snake Plant', sales: 198 },
  { name: 'Pothos Vine', sales: 156 },
  { name: 'Rubber Plant', sales: 142 },
]

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name}! Here's your admin overview.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">₹45,230</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/10 text-accent">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-3">+12% from last month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">1,234</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-3">+5% from last month</p>
        </Card>

        {isAdmin() && (
          <>
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Active Vendors
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">24</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 text-green-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-3">+2 this month</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Products Listed
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">342</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600">
                  <Package className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-3">+18 this month</p>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Sales Chart
            </h2>
            <p className="text-sm text-muted-foreground">
              Last 30 days revenue
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="hsl(var(--accent))"
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Top Products
          </h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {product.name}
                  </p>
                  <div className="w-full bg-muted/50 rounded-full h-2 mt-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{
                        width: `${(product.sales / 245) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-primary ml-4">
                  {product.sales}
                </p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-6 bg-transparent">
            View All
          </Button>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Recent Orders
            </h2>
            <p className="text-sm text-muted-foreground">
              Latest transactions from your store
            </p>
          </div>
          <Button variant="outline">View All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Order
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Customer
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Total
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {order.id}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.customer}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    ₹{order.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
