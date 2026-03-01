import { Anchor, Center, Flex, NavLink, Text, Title } from '@mantine/core'
import { useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname,
    )
  }, [location.pathname])

  return (
    <Flex
      mih={'90vh'}
      justify="center"
      align="center"
      wrap="wrap"
      direction="column"
    >
      <Title order={1}>404</Title>
      <Text c="dimmed" mb={'md'} size="lg">
        Oops! Page not found
      </Text>
      <Anchor href="/" c="primary" underline="always">
        Return to Home
      </Anchor>
    </Flex>
  )
}

export default NotFound
