import React from 'react'
import { cn } from '@/lib/utils'

interface DataTableSkeletonProps {
  columns: number
  rows?: number
  className?: string
}

export const DataTableSkeleton: React.FC<DataTableSkeletonProps> = ({
  columns,
  rows = 5,
  className,
}) => {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border',
        className,
      )}
    >
      {/* Header */}
      <div className="bg-muted/50 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              className="skeleton h-4 flex-1"
              style={{ maxWidth: i === 0 ? '60px' : undefined }}
            />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-4 py-4">
            <div className="flex items-center gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="skeleton h-4 flex-1"
                  style={{
                    maxWidth: colIndex === 0 ? '60px' : undefined,
                    animationDelay: `${(rowIndex * columns + colIndex) * 50}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
