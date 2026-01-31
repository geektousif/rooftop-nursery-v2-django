import { NextRequest, NextResponse } from 'next/server'
import { mockProducts } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.toLowerCase()
  const status = searchParams.get('status')
  const category = searchParams.get('category')

  let filtered = [...mockProducts]

  if (query) {
    filtered = filtered.filter(
      p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
    )
  }

  if (status) {
    filtered = filtered.filter(p => p.status === status)
  }

  if (category) {
    filtered = filtered.filter(p => p.categories.includes(category))
  }

  return NextResponse.json({ products: filtered })
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  const newProduct = {
    ...data,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(newProduct, { status: 201 })
}
