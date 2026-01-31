'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, Search, Plus } from 'lucide-react'
import Link from 'next/link'

// Mock orders data
const mockOrders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    email: 'john@example.com',
    total: 3450,
    items: 2,
    status: 'delivered',
    date: '2024-01-15',
    time: '10:30 AM',
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    email: 'jane@example.com',
    total: 2100,
    items: 1,
    status: 'shipped',
    date: '2024-01-18',
    time: '2:45 PM',
  },
  {
    id: 'ORD-003',
    customer: 'Bob Johnson',
    email: 'bob@example.com',
    total: 5670,
    items: 3,
    status: 'confirmed',
    date: '2024-01-20',
    time: '11:20 AM',
  },
  {
    id: 'ORD-004',
    customer: 'Alice Williams',
    email: 'alice@example.com',
    total: 1890,
    items: 1,
    status: 'pending',
    date: '2024-01-21',
    time: '9:15 AM',
  },
]

export default function OrdersPage() {
  const { isAdmin } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusConfig = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-700' },
    shipped: { bg: 'bg-purple-100', text: 'text-purple-700' },
    delivered: { bg: 'bg-green-100', text: 'text-green-700' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your orders
          </p>
        </div>
        {isAdmin() && (
          <Link href="/dashboard/orders/manual">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Order
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Order ID
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Customer
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Date & Time
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Items
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Total
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Status
                </th>
                <th className="text-center px-6 py-4 font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const status =
                  statusConfig[order.status as keyof typeof statusConfig]
                return (
                  <tr
                    key={order.id}
                    className="border-b border-border hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">
                        {order.id}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {order.customer}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {order.date}
                      <br />
                      {order.time}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {order.items} item{order.items > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      ₹{order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${status.bg} ${status.text}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No orders found</p>
        </Card>
      )}
    </div>
  )
}
