import React, { useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/PageHeader'
import { mockInventoryLogs } from '@/data/mockData'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_authenticated/inventory')({
  component: Inventory,
})

function Inventory() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <ArrowUpCircle className="h-4 w-4 text-success" />
      case 'out':
        return <ArrowDownCircle className="h-4 w-4 text-destructive" />
      default:
        return <RefreshCw className="h-4 w-4 text-warning" />
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Logs"
        description="Track all inventory changes"
      />

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="table-header">
              <TableHead>Type</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Stock Change</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInventoryLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{getTypeIcon(log.type)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{log.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.variantName}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={log.type === 'in' ? 'default' : 'destructive'}
                  >
                    {log.type === 'in' ? '+' : ''}
                    {log.quantity}
                  </Badge>
                </TableCell>
                <TableCell>
                  {log.previousStock} → {log.newStock}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {log.reason}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(log.createdAt)}
                </TableCell>
                <TableCell>{log.createdBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Inventory
