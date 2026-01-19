'use client'

import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { User, ShoppingBag, Heart, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AccountSidebarProps {
  activeTab: string
}

export function AccountSidebar({ activeTab }: AccountSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User, href: '/account' },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      href: '/account/orders',
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      href: '/account/wishlist',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/account/settings',
    },
  ]

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden mb-4 w-full flex items-center gap-2 p-3 bg-surface rounded-lg border border-border"
      >
        <User className="w-4 h-4" />
        <span>Menu</span>
      </button>

      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } md:block bg-surface rounded-lg border border-border p-4 md:sticky md:top-24`}
      >
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <Link
                key={item.id}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-6 pt-6 border-t border-border">
          <Button
            variant="outline"
            className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </>
  )
}
