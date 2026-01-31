import { NextRequest, NextResponse } from 'next/server'
import { mockCustomers } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.toLowerCase()

  let filtered = [...mockCustomers]

  if (query) {
    filtered = filtered.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.includes(query)
    )
  }

  return NextResponse.json({ customers: filtered })
}
