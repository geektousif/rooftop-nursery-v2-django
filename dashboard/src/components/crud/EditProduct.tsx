import {
  Button,
  Group,
  Stack,
  Card,
  Title,
  ActionIcon,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  MultiSelect,
  Switch,
  SimpleGrid,
  Text,
  Divider,
  Tabs,
  Container,
  JsonInput,
  Badge,
  Table,
  Drawer,
  Menu,
  rem,
  Paper,
  Grid,
  ThemeIcon,
  Image,
  ScrollArea,
  Overlay,
  Center,
  FileButton,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import {
  IconArrowLeft,
  IconPlus,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconPhoto,
  IconBoxSeam,
  IconDeviceFloppy,
  IconExternalLink,
  IconUpload,
  IconCheck,
  IconStar,
  IconStarFilled,
  IconSettings,
} from '@tabler/icons-react'
import { useState } from 'react'

// --- MOCK DATA (Simulating fetched product) ---
const EXISTING_PRODUCT = {
  id: 'prod_123',
  productName: 'Premium Cotton T-Shirt',
  description: 'High quality cotton t-shirt...',
  category: 'Clothing',
  tags: ['Summer', 'Best Seller'],
  isActive: true,
  images: [
    {
      id: 'img_1',
      url: 'https://placehold.co/400x400/228be6/FFF?text=Blue+Tee',
      isMain: true,
    },
    {
      id: 'img_2',
      url: 'https://placehold.co/400x400/fa5252/FFF?text=Red+Tee',
      isMain: false,
    },
  ],
  variants: [
    {
      id: 'var_1',
      sku: 'TSHIRT-BLU-M',
      name: 'Blue / Medium',
      price: 25,
      stock: 100,
      isActive: true,
      imageIds: ['img_1'],
    },
    {
      id: 'var_2',
      sku: 'TSHIRT-RED-M',
      name: 'Red / Medium',
      price: 25,
      stock: 45,
      isActive: true,
      imageIds: ['img_2'],
    },
    {
      id: 'var_3',
      sku: 'TSHIRT-RED-L',
      name: 'Red / Large',
      price: 28,
      stock: 0,
      isActive: false,
      imageIds: ['img_2'],
    },
  ],
}

export const EditProduct = (product: any) => {
  const [activeTab, setActiveTab] = useState<string | null>('general')
  const [isDrawerOpen, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false)
  const [editingVariant, setEditingVariant] = useState<any>(null)

  // --- Main Product Form (General Tab) ---
  const productForm = useForm({
    initialValues: {
      productName: EXISTING_PRODUCT.productName,
      description: EXISTING_PRODUCT.description,
      category: EXISTING_PRODUCT.category,
      tags: EXISTING_PRODUCT.tags,
      isActive: EXISTING_PRODUCT.isActive,
    },
  })

  // --- Variant Form (Inside Drawer) ---
  const variantForm = useForm({
    initialValues: {
      id: '',
      name: '',
      sku: '',
      price: 0,
      stock: 0,
      isActive: true,
    },
  })

  // --- Handlers ---
  const handleEditVariant = (variant: any) => {
    setEditingVariant(variant)
    variantForm.setValues(variant)
    openDrawer()
  }

  const handleAddVariant = () => {
    setEditingVariant(null) // New mode
    variantForm.reset()
    openDrawer()
  }

  const handleSaveVariant = (values: typeof variantForm.values) => {
    console.log('Saving Variant:', values)
    closeDrawer()
    // TODO: API Call to update/create variant
  }

  // --- RENDERERS ---

  const renderGeneralTab = () => (
    <Card withBorder shadow="sm" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={4}>Basic Information</Title>
          <Button leftSection={<IconDeviceFloppy size={18} />}>
            Save Details
          </Button>
        </Group>
        <Divider />
        <TextInput
          label="Product Name"
          {...productForm.getInputProps('productName')}
        />
        <Textarea
          label="Description"
          minRows={4}
          {...productForm.getInputProps('description')}
        />
        <SimpleGrid cols={2}>
          <Select
            label="Category"
            data={['Clothing', 'Electronics']}
            {...productForm.getInputProps('category')}
          />
          <MultiSelect
            label="Tags"
            data={['Summer', 'Winter']}
            {...productForm.getInputProps('tags')}
          />
        </SimpleGrid>
        <Switch
          label="Product is live on store"
          {...productForm.getInputProps('isActive', { type: 'checkbox' })}
        />
      </Stack>
    </Card>
  )

  const renderVariantsTab = () => (
    <Stack>
      <Group justify="space-between">
        <Title order={4}>Variants ({EXISTING_PRODUCT.variants.length})</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleAddVariant}>
          Add Variant
        </Button>
      </Group>

      <Card withBorder padding={0} radius="md" style={{ overflow: 'hidden' }}>
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th>Active</Table.Th>
              <Table.Th>Variant Name</Table.Th>
              <Table.Th>SKU</Table.Th>
              <Table.Th>Price</Table.Th>
              <Table.Th>Stock</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {EXISTING_PRODUCT.variants.map((variant) => (
              <Table.Tr
                key={variant.id}
                style={{ opacity: variant.isActive ? 1 : 0.6 }}
              >
                <Table.Td>
                  <ThemeIcon
                    variant={variant.isActive ? 'light' : 'outline'}
                    color={variant.isActive ? 'green' : 'gray'}
                    size="xs"
                    radius="xl"
                  >
                    <IconCheck size={10} />
                  </ThemeIcon>
                </Table.Td>
                <Table.Td fw={500}>{variant.name}</Table.Td>
                <Table.Td>
                  <Badge variant="outline" color="gray" tt="none">
                    {variant.sku}
                  </Badge>
                </Table.Td>
                <Table.Td>${variant.price.toFixed(2)}</Table.Td>
                <Table.Td>
                  <Badge
                    color={variant.stock > 0 ? 'blue' : 'red'}
                    variant="light"
                  >
                    {variant.stock} units
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group justify="flex-end" gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={() => handleEditVariant(variant)}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <Menu position="bottom-end" shadow="md">
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconBoxSeam size={14} />}>
                          Duplicate
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={14} />}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  )

  const renderMediaTab = () => (
    <Grid gutter="xl">
      {/* Simplified for brevity - reuse the Logic from CreateProduct Step 2 here */}
      <Grid.Col span={12}>
        <Card
          withBorder
          radius="md"
          p="xl"
          style={{ borderStyle: 'dashed', textAlign: 'center' }}
        >
          <Stack align="center">
            <IconUpload size={40} color="gray" />
            <Text size="lg" fw={500}>
              Media Manager
            </Text>
            <Text c="dimmed">
              In Edit Mode, images are uploaded immediately.
              <br />
              (Reuse the Split-View Component from CreateProduct here)
            </Text>
            <Button variant="light">Upload New Images</Button>
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  )

  return (
    <Container size="xl" pb="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <ActionIcon variant="subtle" color="gray" size="lg">
              <IconArrowLeft size={24} />
            </ActionIcon>
            <Stack gap={0}>
              <Group gap="xs">
                <Title order={2}>{EXISTING_PRODUCT.productName}</Title>
                <Badge color={EXISTING_PRODUCT.isActive ? 'green' : 'gray'}>
                  {EXISTING_PRODUCT.isActive ? 'Active' : 'Draft'}
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                ID: {EXISTING_PRODUCT.id}
              </Text>
            </Stack>
          </Group>
          <Group>
            <Button
              variant="default"
              leftSection={<IconExternalLink size={16} />}
            >
              View on Store
            </Button>
          </Group>
        </Group>

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          variant="pills"
          radius="md"
        >
          <Tabs.List mb="md">
            <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
              General
            </Tabs.Tab>
            <Tabs.Tab value="variants" leftSection={<IconBoxSeam size={16} />}>
              Variants & Stock
            </Tabs.Tab>
            <Tabs.Tab value="media" leftSection={<IconPhoto size={16} />}>
              Media
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general">{renderGeneralTab()}</Tabs.Panel>
          <Tabs.Panel value="variants">{renderVariantsTab()}</Tabs.Panel>
          <Tabs.Panel value="media">{renderMediaTab()}</Tabs.Panel>
        </Tabs>
      </Stack>

      {/* DRAWER FOR EDITING VARIANTS */}
      <Drawer
        opened={isDrawerOpen}
        onClose={closeDrawer}
        position="right"
        title={
          <Text size="lg" fw={600}>
            {editingVariant ? 'Edit Variant' : 'Add New Variant'}
          </Text>
        }
        padding="xl"
        size="md"
      >
        <form onSubmit={variantForm.onSubmit(handleSaveVariant)}>
          <Stack gap="md">
            <TextInput
              label="Variant Name"
              withAsterisk
              {...variantForm.getInputProps('name')}
            />
            <TextInput
              label="SKU"
              withAsterisk
              {...variantForm.getInputProps('sku')}
            />
            <SimpleGrid cols={2}>
              <NumberInput
                label="Price"
                leftSection="$"
                min={0}
                {...variantForm.getInputProps('price')}
              />
              <NumberInput
                label="Stock"
                min={0}
                {...variantForm.getInputProps('stock')}
              />
            </SimpleGrid>

            <Switch
              label="Active"
              {...variantForm.getInputProps('isActive', { type: 'checkbox' })}
            />

            {/* Advanced Variant Fields could go here in an Accordion */}

            <Group mt="xl" justify="flex-end">
              <Button variant="default" onClick={closeDrawer}>
                Cancel
              </Button>
              <Button type="submit">
                {editingVariant ? 'Update Variant' : 'Create Variant'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Drawer>
    </Container>
  )
}
