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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Search } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Mock vendors data
const mockVendors = [
  {
    id: '1',
    name: 'Green Thumb Nursery',
    email: 'contact@greenthumb.com',
    products: 24,
    revenue: 125000,
    commission: 15,
    status: 'approved',
  },
  {
    id: '2',
    name: 'Urban Plants Co',
    email: 'info@urbanplants.com',
    products: 18,
    revenue: 89000,
    commission: 12,
    status: 'approved',
  },
  {
    id: '3',
    name: 'Botanical Paradise',
    email: 'hello@botanical.com',
    products: 0,
    revenue: 0,
    commission: 20,
    status: 'pending',
  },
]

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredVendors = mockVendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingVendors = mockVendors.filter((v) => v.status === 'pending')

  const handleApprove = (vendorId: string) => {
    toast.success('Vendor approved!')
  }

  const handleReject = (vendorId: string) => {
    toast.success('Vendor rejected!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Vendors</h1>
        <p className="text-muted-foreground mt-1">
          Manage vendors and their commissions
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Vendors</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approvals ({pendingVendors.length})
          </TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        {/* All Vendors Tab */}
        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <Card className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
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
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Vendors Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Business Name
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Products
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Revenue
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Commission
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="border-b border-border hover:bg-muted/30"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {vendor.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vendor.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {vendor.products}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        ₹{vendor.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {vendor.commission}%
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            vendor.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : vendor.status === 'pending'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/vendors/${vendor.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingVendors.map((vendor) => (
              <Card key={vendor.id} className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {vendor.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {vendor.email}
                    </p>
                  </div>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Pending
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Commission Rate:
                    </span>
                    <span className="font-medium text-foreground">
                      {vendor.commission}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive bg-transparent"
                    onClick={() => handleReject(vendor.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleApprove(vendor.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Vendor Payouts
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Vendor
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Total Sales
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Commission Rate
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Amount Due
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockVendors
                    .filter((v) => v.status === 'approved')
                    .map((vendor) => {
                      const amountDue = (vendor.revenue * vendor.commission) / 100
                      return (
                        <tr
                          key={vendor.id}
                          className="border-b border-border hover:bg-muted/30"
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-foreground">
                              {vendor.name}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-foreground">
                            ₹{vendor.revenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-foreground">
                            {vendor.commission}%
                          </td>
                          <td className="px-6 py-4 font-semibold text-foreground">
                            ₹{amountDue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              Pending
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Button size="sm">Mark as Paid</Button>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
