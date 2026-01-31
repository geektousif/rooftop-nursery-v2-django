import { NextRequest, NextResponse } from 'next/server'
import { mockVendors } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')

  let filtered = [...mockVendors]

  if (status) {
    filtered = filtered.filter(v => v.status === status)
  }

  return NextResponse.json({ vendors: filtered })
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  const newVendor = {
    ...data,
    id: `vendor-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json(newVendor, { status: 201 })
}
