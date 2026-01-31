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
import { Search } from 'lucide-react'

// Mock customers data
const mockCustomers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    orders: 5,
    spent: 12500,
    status: 'active',
    joined: '2023-06-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    orders: 8,
    spent: 24300,
    status: 'active',
    joined: '2023-03-22',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    orders: 2,
    spent: 5600,
    status: 'inactive',
    joined: '2024-01-10',
  },
]

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || customer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your customers
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Customers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Customer
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Orders
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Total Spent
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Status
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Joined
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-border hover:bg-muted/30"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {customer.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {customer.orders}
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    ₹{customer.spent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        customer.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {customer.joined}
                  </td>
                  <td className="px-6 py-4">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No customers found</p>
        </Card>
      )}
    </div>
  )
}
