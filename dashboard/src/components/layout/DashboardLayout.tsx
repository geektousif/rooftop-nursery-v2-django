import React from 'react'
import { Outlet } from '@tanstack/react-router'
import { AppShell, useMantineTheme } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const DashboardLayout: React.FC = () => {
  const theme = useMantineTheme()

  // 1. Manage Mobile "Burger" state
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()

  // 2. Manage Desktop "Mini Sidebar" state
  const [desktopCollapsed, { toggle: toggleDesktop }] = useDisclosure(false)

  return (
    <AppShell
      header={{ height: 64 }} // Matches the h-16 (64px) from your Header
      navbar={{
        width: desktopCollapsed ? 80 : 250, // Matches sidebar collapsed/expanded widths
        breakpoint: 'md', // When to switch to mobile overlay mode
        collapsed: { mobile: !mobileOpened, desktop: false },
      }}
      padding="md"
      transitionDuration={300} // Smooth animation for width changes
      layout="alt" // "alt" puts the Header *inside* the Sidebar space (optional, common for dashboards)
      // OR remove layout="alt" if you want the Header to span the full width of the top
    >
      <AppShell.Header>
        <Header onMobileMenuToggle={toggleMobile} />
      </AppShell.Header>

      <AppShell.Navbar p={0}>
        {/* We pass the state down so the Sidebar can render the 
           correct icons and the toggle button 
        */}
        <Sidebar isCollapsed={desktopCollapsed} onToggle={toggleDesktop} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
