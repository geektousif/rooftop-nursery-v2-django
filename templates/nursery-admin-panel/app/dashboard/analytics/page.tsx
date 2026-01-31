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
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// Mock data
const chartData = [
  { date: 'Jan 1', revenue: 2400, orders: 24 },
  { date: 'Jan 2', revenue: 1398, orders: 13 },
  { date: 'Jan 3', revenue: 9800, orders: 45 },
  { date: 'Jan 4', revenue: 3908, orders: 32 },
  { date: 'Jan 5', revenue: 4800, orders: 38 },
  { date: 'Jan 6', revenue: 3800, orders: 28 },
]

const categoryData = [
  { name: 'Indoor Plants', value: 35 },
  { name: 'Low Light Plants', value: 25 },
  { name: 'Trailing Plants', value: 20 },
  { name: 'Large Plants', value: 20 },
]

const COLORS = ['#2F5233', '#76A84F', '#D5896F', '#F5B5A6']

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your business performance
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground font-medium">
            Total Revenue
          </p>
          <p className="text-3xl font-bold text-foreground mt-2">₹325,680</p>
          <p className="text-xs text-green-600 mt-3">+22% vs last month</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground font-medium">
            Total Orders
          </p>
          <p className="text-3xl font-bold text-foreground mt-2">8,234</p>
          <p className="text-xs text-green-600 mt-3">+18% vs last month</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground font-medium">
            Avg. Order Value
          </p>
          <p className="text-3xl font-bold text-foreground mt-2">₹3,950</p>
          <p className="text-xs text-green-600 mt-3">+5% vs last month</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground font-medium">
            Conversion Rate
          </p>
          <p className="text-3xl font-bold text-foreground mt-2">4.2%</p>
          <p className="text-xs text-red-600 mt-3">-0.8% vs last month</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Revenue Trend
          </h2>
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
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Sales by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Orders Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Orders Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="orders" fill="hsl(var(--accent))" name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
