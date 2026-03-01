import React, { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  IconBell,
  IconChevronRight,
  IconDoorExit,
  IconMoon,
  IconSearch,
  IconSettings,
  IconSun,
} from '@tabler/icons-react'
import { useAuthStore } from '@/features/auth/auth.provider'
import {
  Menu,
  Group,
  ActionIcon,
  TextInput,
  Avatar,
  Text,
  UnstyledButton,
  Breadcrumbs,
  Burger,
  rem,
  Box,
  Indicator,
  useMantineColorScheme,
  ScrollArea,
  Divider,
} from '@mantine/core'
import { navItems } from './navItems'

interface HeaderProps {
  onMobileMenuToggle: () => void
}

const adminBreadcrumbs = navItems.admin.map((item) => ({
  label: item.label,
  path: item.path,
}))

const vendorBreadcrumbs = navItems.vendor.map((item) => ({
  label: item.label,
  path: item.path,
}))

interface HeaderProps {
  onMobileMenuToggle: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuthStore((state) => state)
  const location = useLocation()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const [searchQuery, setSearchQuery] = useState('')

  // Generate breadcrumbs logic (kept same)
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    ...pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/')
      return {
        label:
          segment === 'admin' ||
          segment.charAt(0).toUpperCase() + segment.slice(1),
        path,
      }
    }),
  ]

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Helper styles for the sticky blur effect
  const headerStyle = {
    zIndex: 30,
    background: 'var(--mantine-color-body)', // Fallback
    backgroundColor:
      colorScheme === 'dark'
        ? 'rgba(36, 36, 36, 0.8)'
        : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
  }

  return (
    <Box component="header" h={64} px="md" style={headerStyle}>
      <Group h="100%" justify="space-between">
        {/* LEFT: Mobile Menu + Breadcrumbs */}
        <Group>
          <Burger
            opened={false}
            onClick={onMobileMenuToggle}
            hiddenFrom="md"
            size="sm"
          />

          {/* Mantine Breadcrumbs component */}
          <Breadcrumbs
            separator={<IconChevronRight size={14} />}
            visibleFrom="md"
            style={{ fontSize: '0.875rem' }}
          >
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1
              return isLast ? (
                <Text key={item.path} size="sm" fw={500} c="dimmed">
                  {item.label}
                </Text>
              ) : (
                <Text
                  key={item.path}
                  component={Link}
                  to={item.path}
                  size="sm"
                  c="blue" // or your primary color
                  style={{ textDecoration: 'none' }}
                >
                  {item.label}
                </Text>
              )
            })}
          </Breadcrumbs>
        </Group>

        {/* CENTER: Search */}
        <Box
          visibleFrom="md"
          style={{ flex: 1, maxWidth: 400, margin: '0 20px' }}
        >
          <TextInput
            placeholder="Search products, orders, vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
          />
        </Box>

        {/* RIGHT: Actions */}
        <Group gap="sm">
          {/* Dark Mode Toggle */}
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={toggleColorScheme}
            size="lg"
            aria-label="Toggle color scheme"
          >
            {colorScheme === 'dark' ? (
              <IconSun style={{ width: rem(20), height: rem(20) }} />
            ) : (
              <IconMoon style={{ width: rem(20), height: rem(20) }} />
            )}
          </ActionIcon>

          {/* Notifications */}
          <Menu shadow="md" width={320} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="lg">
                <Indicator
                  label="3"
                  size={16}
                  offset={4}
                  color="red"
                  withBorder
                >
                  <IconBell style={{ width: rem(20), height: rem(20) }} />
                </Indicator>
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Notifications</Menu.Label>
              <Divider mb={5} />

              <ScrollArea.Autosize type="scroll" mah={300}>
                <Menu.Item>
                  <Box>
                    <Text size="sm" fw={500}>
                      New order received
                    </Text>
                    <Text size="xs" c="dimmed">
                      Order #1234 from John Doe
                    </Text>
                    <Text size="xs" c="dimmed" mt={2}>
                      2 minutes ago
                    </Text>
                  </Box>
                </Menu.Item>
                <Menu.Item>
                  <Box>
                    <Text size="sm" fw={500}>
                      Vendor approval pending
                    </Text>
                    <Text size="xs" c="dimmed">
                      Green Thumb Gardens requested approval
                    </Text>
                    <Text size="xs" c="dimmed" mt={2}>
                      1 hour ago
                    </Text>
                  </Box>
                </Menu.Item>
                <Menu.Item>
                  <Box>
                    <Text size="sm" fw={500}>
                      Low stock alert
                    </Text>
                    <Text size="xs" c="dimmed">
                      Money Plant is running low
                    </Text>
                    <Text size="xs" c="dimmed" mt={2}>
                      3 hours ago
                    </Text>
                  </Box>
                </Menu.Item>
              </ScrollArea.Autosize>

              <Divider mt={5} />
              <Menu.Item c="blue" style={{ textAlign: 'center' }}>
                View all notifications
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* User Menu */}
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <UnstyledButton
                style={{
                  padding: '4px',
                  borderRadius: 'var(--mantine-radius-sm)',
                }}
              >
                <Group gap="xs">
                  <Avatar src={user?.avatar} color="blue" radius="xl">
                    {user ? getInitials(user.name) : 'U'}
                  </Avatar>
                  <Box visibleFrom="md">
                    <Text size="sm" fw={500} lh={1}>
                      {user?.name}
                    </Text>
                    <Text size="xs" c="dimmed" tt="capitalize">
                      {user?.role === 'ADMIN' ? 'Admin' : 'Vendor'}
                    </Text>
                  </Box>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>My Account</Menu.Label>
              <Menu.Item
                component={Link}
                to={
                  user?.role === 'ADMIN'
                    ? '/admin/settings'
                    : '/vendor/settings'
                }
                leftSection={
                  <IconSettings style={{ width: rem(14), height: rem(14) }} />
                }
              >
                Settings
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                color="red"
                onClick={logout}
                leftSection={
                  <IconDoorExit style={{ width: rem(14), height: rem(14) }} />
                }
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Box>
  )
}
