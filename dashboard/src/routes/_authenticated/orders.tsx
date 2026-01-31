import React, { useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Calendar,
  Download,
  Eye,
  Plus,
  Search,
  Truck,
  XCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import type { OrderStatus } from '@/types'
import { useAuth } from '@/features/auth/auth.provider'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { mockOrders } from '@/data/mockData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const statusTabs: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const Route = createFileRoute('/_authenticated/orders')({
  component: Orders,
})

function Orders() {
  const { isAdmin } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  const filteredOrders = useMemo(() => {
    let orders = [...mockOrders]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      orders = orders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.customerEmail.toLowerCase().includes(query),
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      orders = orders.filter((order) => order.status === statusFilter)
    }

    // Date range filter
    if (dateRange.from) {
      orders = orders.filter(
        (order) => new Date(order.createdAt) >= dateRange.from!,
      )
    }
    if (dateRange.to) {
      orders = orders.filter(
        (order) => new Date(order.createdAt) <= dateRange.to!,
      )
    }

    return orders
  }, [searchQuery, statusFilter, dateRange])

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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const currentOrder = selectedOrder
    ? mockOrders.find((o) => o.id === selectedOrder)
    : null

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Manage customer orders">
        {isAdmin() && (
          <Button asChild className="btn-primary-gradient">
            <Link to="/orders/manual" className="gap-2">
              <Plus className="h-4 w-4" />
              Manual Order
            </Link>
          </Button>
        )}
      </PageHeader>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="card-elevated p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd')} -{' '}
                      {format(dateRange.to, 'LLL dd')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  'Select dates'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) =>
                  setDateRange({ from: range?.from, to: range?.to })
                }
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {dateRange.from && (
            <Button variant="ghost" size="sm" onClick={() => setDateRange({})}>
              Clear dates
            </Button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="table-header">
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow
                key={order.id}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedOrder(order.id)}
              >
                <TableCell className="font-medium">
                  {order.orderNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.customerEmail}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell>{order.items.length} items</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedOrder(order.id)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {order.status === 'confirmed' && (
                        <DropdownMenuItem className="gap-2">
                          <Truck className="h-4 w-4" />
                          Mark as Shipped
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="gap-2">
                        <Download className="h-4 w-4" />
                        Download Invoice
                      </DropdownMenuItem>
                      {!['shipped', 'delivered', 'cancelled'].includes(
                        order.status,
                      ) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                            <XCircle className="h-4 w-4" />
                            Cancel Order
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-foreground">No orders found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {currentOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif flex items-center gap-4">
                  Order {currentOrder.orderNumber}
                  <StatusBadge status={currentOrder.status} />
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Customer Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Customer
                    </h4>
                    <p className="font-medium">{currentOrder.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentOrder.customerEmail}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentOrder.customerPhone}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Shipping Address
                    </h4>
                    <p className="text-sm">
                      {currentOrder.shippingAddress.line1}
                      {currentOrder.shippingAddress.line2 &&
                        `, ${currentOrder.shippingAddress.line2}`}
                    </p>
                    <p className="text-sm">
                      {currentOrder.shippingAddress.city},{' '}
                      {currentOrder.shippingAddress.state}{' '}
                      {currentOrder.shippingAddress.pincode}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {currentOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-muted/50"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.variantName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.subtotal)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-4 rounded-xl bg-muted/50">
                  <h4 className="font-medium mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(currentOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatCurrency(currentOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {currentOrder.shipping === 0
                          ? 'Free'
                          : formatCurrency(currentOrder.shipping)}
                      </span>
                    </div>
                    {currentOrder.discount > 0 && (
                      <div className="flex justify-between text-sm text-success">
                        <span>Discount</span>
                        <span>-{formatCurrency(currentOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-2 border-t border-border">
                      <span>Total</span>
                      <span>{formatCurrency(currentOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-medium mb-3">Order Timeline</h4>
                  <div className="space-y-4">
                    {currentOrder.timeline.map((event, index) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              'w-3 h-3 rounded-full',
                              index === currentOrder.timeline.length - 1
                                ? 'bg-primary'
                                : 'bg-muted-foreground/30',
                            )}
                          />
                          {index < currentOrder.timeline.length - 1 && (
                            <div className="w-0.5 flex-1 bg-muted-foreground/20 my-1" />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="font-medium">{event.status}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Invoice
                  </Button>
                  {currentOrder.status === 'confirmed' && (
                    <Button className="btn-primary-gradient gap-2">
                      <Truck className="h-4 w-4" />
                      Mark as Shipped
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Orders
