import { NextRequest, NextResponse } from 'next/server'
import { mockOrders } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  const customerId = searchParams.get('customerId')

  let filtered = [...mockOrders]

  if (status) {
    filtered = filtered.filter(o => o.status === status)
  }

  if (customerId) {
    filtered = filtered.filter(o => o.customerId === customerId)
  }

  return NextResponse.json({ orders: filtered })
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  const newOrder = {
    ...data,
    id: `ord-${Date.now()}`,
    orderNumber: `ORD-2024-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(newOrder, { status: 201 })
}
