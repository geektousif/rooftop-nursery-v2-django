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
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import Link from 'next/link'

// Mock products data
const mockProducts = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    sku: 'MON-001',
    price: 1200,
    mrp: 1500,
    stock: 25,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=100&h=100&fit=crop',
    category: 'Indoor Plants',
  },
  {
    id: '2',
    name: 'Snake Plant',
    sku: 'SNK-001',
    price: 800,
    mrp: 1000,
    stock: 5,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac9dd65033?w=100&h=100&fit=crop',
    category: 'Low Light Plants',
  },
  {
    id: '3',
    name: 'Pothos Vine',
    sku: 'POT-001',
    price: 600,
    mrp: 900,
    stock: 0,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1585062080551-baabbab3e896?w=100&h=100&fit=crop',
    category: 'Trailing Plants',
  },
  {
    id: '4',
    name: 'Rubber Plant',
    sku: 'RUB-001',
    price: 1500,
    mrp: 2000,
    stock: 12,
    status: 'pending_approval',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=100&h=100&fit=crop',
    category: 'Large Plants',
  },
]

export default function ProductsPage() {
  const { isAdmin } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const filteredProducts = mockProducts
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'price') return a.price - b.price
      if (sortBy === 'stock') return b.stock - a.stock
      return 0
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Indoor Plants">Indoor Plants</SelectItem>
              <SelectItem value="Low Light Plants">Low Light Plants</SelectItem>
              <SelectItem value="Trailing Plants">Trailing Plants</SelectItem>
              <SelectItem value="Large Plants">Large Plants</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
            </SelectContent>
          </Select>

          {/* Admin Only: Pending Approvals */}
          {isAdmin() && (
            <Link href="/dashboard/products/pending">
              <Button variant="outline" className="w-full bg-transparent">
                Pending Approvals
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Product
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Price
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Stock
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Status
                </th>
                <th className="text-right px-6 py-4 font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.sku}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">
                        ₹{product.price}
                      </p>
                      {product.mrp > product.price && (
                        <p className="text-xs text-muted-foreground line-through">
                          ₹{product.mrp}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        product.stock > 10
                          ? 'bg-green-100 text-green-700'
                          : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : product.status === 'pending_approval'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {product.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Link href={`/dashboard/products/${product.id}`}>
                      <Button size="sm" variant="outline">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" className="text-destructive bg-transparent">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No products found</p>
        </Card>
      )}
    </div>
  )
}
