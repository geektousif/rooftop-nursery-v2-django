import {
  IconBuildingStore,
  IconChartBar,
  IconClipboardList,
  IconLayoutDashboard,
  IconPackage,
  IconSettings,
  IconShoppingCart,
  IconTags,
  IconUsers,
} from '@tabler/icons-react'

export const navItems = {
  admin: [
    {
      label: 'Dashboard',
      icon: IconLayoutDashboard,
      path: '/admin/dashboard',
    },
    {
      label: 'Categories',
      icon: IconTags,
      path: '/admin/categories',
    },
    {
      label: 'Products',
      icon: IconPackage,
      path: '/admin/products',
    },
    {
      label: 'Orders',
      icon: IconShoppingCart,
      path: '/admin/orders',
    },
    {
      label: 'Vendors',
      icon: IconBuildingStore,
      path: '/admin/vendors',
    },
    {
      label: 'Customers',
      icon: IconUsers,
      path: '/admin/customers',
    },
    {
      label: 'Analytics',
      icon: IconChartBar,
      path: '/admin/analytics',
    },
    {
      label: 'Inventory',
      icon: IconClipboardList,
      path: '/admin/inventory',
    },
    {
      label: 'Settings',
      icon: IconSettings,
      path: '/admin/settings',
    },
  ],
  vendor: [
    {
      label: 'Dashboard',
      icon: IconLayoutDashboard,
      path: '/vendor/dashboard',
    },
    {
      label: 'Orders',
      icon: IconShoppingCart,
      path: '/vendor/orders',
    },
    {
      label: 'Analytics',
      icon: IconChartBar,
      path: '/vendor/analytics',
    },
    {
      label: 'Inventory',
      icon: IconClipboardList,
      path: '/vendor/inventory',
    },
  ],
}
