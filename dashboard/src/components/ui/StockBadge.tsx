import React from 'react'
import { cn } from '@/lib/utils'

interface StockBadgeProps {
  stock: number
  className?: string
}

export const StockBadge: React.FC<StockBadgeProps> = ({ stock, className }) => {
  const getStockStyle = () => {
    if (stock === 0) {
      return 'bg-destructive/10 text-destructive border-destructive/20'
    }
    if (stock <= 10) {
      return 'bg-warning/10 text-warning border-warning/20'
    }
    return 'bg-success/10 text-success border-success/20'
  }

  const getStockLabel = () => {
    if (stock === 0) return 'Out of stock'
    if (stock <= 10) return `Low: ${stock}`
    return `${stock} in stock`
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        getStockStyle(),
        className,
      )}
    >
      {getStockLabel()}
    </span>
  )
}
