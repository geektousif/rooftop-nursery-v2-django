import { NextRequest, NextResponse } from 'next/server'
import { mockOrders } from '@/lib/mock-data'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = mockOrders.find(o => o.id === params.id)

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ order })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await request.json()

  const orderIndex = mockOrders.findIndex(o => o.id === params.id)
  if (orderIndex === -1) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const updated = {
    ...mockOrders[orderIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json({ order: updated })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { status } = await request.json()

  const orderIndex = mockOrders.findIndex(o => o.id === params.id)
  if (orderIndex === -1) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const updated = {
    ...mockOrders[orderIndex],
    status,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json({ order: updated })
}
