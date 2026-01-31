import { NextRequest, NextResponse } from 'next/server'
import { AuthUser } from '@/lib/types'

// Mock user data - in production, validate token and fetch from database
const mockUsers: Record<string, AuthUser> = {
  'mock-jwt-token-1': {
    id: '1',
    email: 'admin@rooftop.com',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    createdAt: new Date().toISOString(),
  },
  'mock-jwt-token-2': {
    id: '2',
    email: 'vendor@rooftop.com',
    name: 'Vendor User',
    role: 'vendor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vendor',
    createdAt: new Date().toISOString(),
  },
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = mockUsers[token]

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('[v0] Get me error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
