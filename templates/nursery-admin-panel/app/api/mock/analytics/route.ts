import { NextResponse } from 'next/server'
import { mockDashboardMetrics, mockSalesData } from '@/lib/mock-data'

export async function GET() {
  return NextResponse.json({
    metrics: mockDashboardMetrics,
    salesData: mockSalesData,
  })
}
