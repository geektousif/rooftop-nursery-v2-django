import { NextRequest, NextResponse } from 'next/server'
import { LoginRequest, LoginResponse, AuthUser } from '@/lib/types'

// Mock database - replace with real API calls
const mockUsers = [
  {
    id: '1',
    email: 'admin@rooftop.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  },
  {
    id: '2',
    email: 'vendor@rooftop.com',
    password: 'vendor123',
    name: 'Vendor User',
    role: 'vendor' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vendor',
  },
]

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()

    // Validate input
    if (!body.email || !body.password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user (in production, query your API/database)
    const user = mockUsers.find(
      (u) => u.email === body.email && u.password === body.password
    )

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create response with auth user
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      createdAt: new Date().toISOString(),
    }

    const response: LoginResponse = {
      user: authUser,
      token: 'mock-jwt-token-' + user.id, // In production, generate real JWT
    }

    const nextResponse = NextResponse.json(response, { status: 200 })
    
    // Set auth token in HTTP-only cookie
    nextResponse.cookies.set('auth_token', response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return nextResponse
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
