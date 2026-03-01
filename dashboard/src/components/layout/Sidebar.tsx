import React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  IconChevronLeft,
  IconChevronRight,
  IconDoorExit,
  IconLeaf,
  IconUsers,
} from '@tabler/icons-react'
import { useAuthStore } from '@/features/auth/auth.provider'
import {
  Box,
  NavLink,
  ScrollArea,
  ThemeIcon,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  rem,
  Flex,
  Button,
} from '@mantine/core'
import { navItems } from './navItems'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { isAdmin } = useAuthStore((state) => state)
  const location = useLocation()

  const filteredNavItems = isAdmin() ? navItems.admin : navItems.vendor

  return (
    <Box
      component="aside"
      style={{
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--mantine-color-body)',
        // borderRight: '1px solid var(--mantine-color-default-border)',
        transition: 'width 300ms ease',
      }}
    >
      {/* HEADER / LOGO */}
      <Group h={64} px="md" align="center" wrap="nowrap">
        <ThemeIcon variant="filled" size="lg" radius="md" color="primary">
          <IconLeaf style={{ width: rem(20), height: rem(20) }} />
        </ThemeIcon>

        {!isCollapsed && (
          <Box style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <Text fw={600} size="lg" lh={1.2} style={{ fontFamily: 'serif' }}>
              Rooftop
            </Text>
            <Text size="xs" c="dimmed">
              Nursery Admin
            </Text>
          </Box>
        )}
      </Group>

      {/* NAVIGATION (ScrollArea handles the overflow nicely) */}
      <ScrollArea mt="md" style={{ flex: 1 }}>
        <Flex direction="column" h="80vh" p="xs">
          {filteredNavItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))

            return (
              <Tooltip
                key={item.path}
                label={item.label}
                position="right"
                disabled={!isCollapsed}
                withArrow
              >
                <NavLink
                  component={Link}
                  to={item.path}
                  label={!isCollapsed ? item.label : null}
                  leftSection={
                    <item.icon style={{ width: rem(20), height: rem(20) }} />
                  }
                  active={isActive}
                  variant="light" // or "filled" or "subtle"
                  // Styles to handle centering when collapsed
                  styles={{
                    root: {
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      borderRadius: 'var(--mantine-radius-md)',
                      marginBottom: 4,
                    },
                    section: {
                      marginRight: isCollapsed ? 0 : undefined,
                    },
                  }}
                />
              </Tooltip>
            )
          })}

          {/* Logout at the very bottom */}

          <Button
            leftSection={
              <IconDoorExit style={{ width: rem(20), height: rem(20) }} />
            }
            variant="filled"
            color="red"
            styles={{
              root: {
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--mantine-radius-md)',
                justifySelf: 'flex-end',
                marginBottom: 4,
                marginTop: 'auto',
              },
              section: {
                marginRight: isCollapsed ? 0 : undefined,
              },
            }}
            // put at last
          >
            {!isCollapsed && 'Logout'}
          </Button>
        </Flex>
      </ScrollArea>

      {/* COLLAPSE TOGGLE */}
      {/* We position this absolute relative to the aside to mimic your 
         "halfway off the edge" look.
      */}
      <ActionIcon
        variant="default"
        radius="xl"
        size="md"
        onClick={onToggle}
        style={{
          position: 'absolute',
          bottom: rem(20),
          right: 0,
          transform: 'translateX(50%)', // Pushes it half-way out
          zIndex: 50,
          boxShadow: 'var(--mantine-shadow-sm)',
        }}
      >
        {isCollapsed ? (
          <IconChevronRight style={{ width: rem(16), height: rem(16) }} />
        ) : (
          <IconChevronLeft style={{ width: rem(16), height: rem(16) }} />
        )}
      </ActionIcon>
    </Box>
  )
}
