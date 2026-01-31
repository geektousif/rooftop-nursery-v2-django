'use client'

import React from "react"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  requiredPermission?: string
  adminOnly?: boolean
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout, isAdmin } = useAuth()

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Products',
      href: '/dashboard/products',
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: 'Orders',
      href: '/dashboard/orders',
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      label: 'Customers',
      href: '/dashboard/customers',
      icon: <Users className="w-5 h-5" />,
      adminOnly: true,
    },
    {
      label: 'Vendors',
      href: '/dashboard/vendors',
      icon: <Store className="w-5 h-5" />,
      adminOnly: true,
    },
    {
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ]

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin()
  )

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold">
            R
          </div>
          <div>
            <h1 className="font-bold text-lg">Rooftop</h1>
            <p className="text-xs opacity-75">Nursery Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-4 p-3 rounded-lg bg-sidebar-accent bg-opacity-10">
          <p className="text-xs font-semibold text-sidebar-foreground truncate">
            {user?.name}
          </p>
          <p className="text-xs text-sidebar-foreground opacity-75 truncate">
            {user?.email}
          </p>
          <p className="text-xs mt-1 font-medium text-sidebar-primary capitalize">
            {user?.role}
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
