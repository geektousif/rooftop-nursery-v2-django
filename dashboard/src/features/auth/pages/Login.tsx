import {
  Box,
  Button,
  Center,
  Container,
  Group,
  Overlay,
  Paper,
  PasswordInput,
  rem,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconAt, IconLeaf2, IconLock } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { useAuthStore } from '../auth.provider'
import { notifications } from '@mantine/notifications'
import { useNavigate } from '@tanstack/react-router'
import { UserRoles } from '@/utils/constants'

export function Login({ search }: { search?: { redirect?: string } }) {
  const { login, hasRole } = useAuthStore((state) => state)
  const navigate = useNavigate()

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : 'Please enter a valid email',
    },
  })

  const handleLogin = async (values: typeof form.values) => {
    try {
      await login(values.email, values.password)

      notifications.show({
        title: 'Login successful',
        message: 'Welcome back!',
        color: 'green',
      })

      if (search?.redirect) {
        navigate({ to: search.redirect })
      } else {
        hasRole(UserRoles.ADMIN)
          ? navigate({ to: '/admin/dashboard' })
          : navigate({ to: '/vendor/dashboard' })
      }
    } catch (error) {
      notifications.show({
        title: 'Login failed',
        message: 'Invalid email or password. Please try again.',
        color: 'red',
      })
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* LEFT SIDE - BRANDING
        visibleFrom="md" -> translates to Tailwind's "hidden lg:block"
      */}
      <Box
        visibleFrom="md"
        style={{
          width: '50%',
          position: 'relative',
          backgroundImage:
            'url(https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* The Gradient Overlay */}
        <Overlay
          gradient="linear-gradient(135deg, var(--mantine-color-green-9) 0%, var(--mantine-color-fairy-8) 100%)"
          opacity={0.85}
          zIndex={1}
        />

        {/* Content on top of image */}
        <Stack
          h="100%"
          p={60}
          justify="space-between"
          style={{ position: 'relative', zIndex: 2, color: 'white' }}
        >
          <Group>
            <Center
              w={48}
              h={48}
              bg="rgba(255,255,255,0.2)"
              style={{ borderRadius: 12, backdropFilter: 'blur(10px)' }}
            >
              <IconLeaf2 size={24} color="white" />
            </Center>
            <div>
              <Title order={3} style={{ fontFamily: 'serif' }}>
                Rooftop Nursery
              </Title>
              <Text size="sm" opacity={0.8}>
                Admin Dashboard
              </Text>
            </div>
          </Group>

          <Stack gap="lg">
            <Title
              style={{
                fontFamily: 'serif',
                fontSize: rem(42),
                lineHeight: 1.1,
              }}
            >
              Grow your business <br /> with nature
            </Title>
            <Text size="lg" opacity={0.9} maw={450}>
              Manage your plant nursery with our comprehensive admin dashboard.
              Track orders, manage vendors, and grow your green empire.
            </Text>
          </Stack>

          <Text size="sm" opacity={0.6}>
            © 2024 Rooftop Nursery. All rights reserved.
          </Text>
        </Stack>
      </Box>

      {/* RIGHT SIDE - FORM */}
      <Box
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container size={600} w="100%" my={40}>
          {/* Mobile Logo (hidden on Desktop) */}
          <Group hiddenFrom="md" justify="center" mb="xl">
            <Center
              w={48}
              h={48}
              bg="var(--mantine-primary-color-filled)"
              style={{ borderRadius: 12 }}
            >
              <IconLeaf2 size={24} color="white" />
            </Center>
            <Title order={3} style={{ fontFamily: 'serif' }}>
              Rooftop Nursery
            </Title>
          </Group>

          <Title ta="center" style={{ fontFamily: 'serif' }}>
            Welcome back
          </Title>
          <Text c="dimmed" size="sm" ta="center" mt={5}>
            Sign in to your account to continue
          </Text>

          {search && search.redirect && (
            <Text c="red" size="sm" ta="center" mt="sm">
              You need to login to access this page.
            </Text>
          )}

          <Paper shadow="md" p={50} mt={30} radius="md">
            {/* <form onSubmit={handleSubmit}> */}
            <form onSubmit={form.onSubmit(handleLogin)}>
              <Stack gap="lg">
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  leftSection={<IconAt size={16} />}
                  withAsterisk
                  required
                  size="md"
                  key={form.key('email')}
                  {...form.getInputProps('email')}
                  // value={email}
                  // onChange={(e) => setEmail(e.currentTarget.value)}
                />

                <PasswordInput
                  leftSection={<IconLock size={16} />}
                  label="Password"
                  placeholder="Your password"
                  required
                  withAsterisk
                  size="md"
                  key={form.key('password')}
                  {...form.getInputProps('password')}
                  // value={password}
                  // onChange={(e) => setPassword(e.currentTarget.value)}
                  // NOTE: Eye/EyeOff toggle is BUILT-IN to this component
                />

                <Button
                  size="lg"
                  fullWidth
                  mt="xl"
                  type="submit"
                  // loading={isLoading || isSubmitting}
                  variant="gradient"
                  gradient={{ from: 'green', to: 'fairy', deg: 90 }}
                >
                  Sign in
                </Button>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Box>
    </div>
  )
}
