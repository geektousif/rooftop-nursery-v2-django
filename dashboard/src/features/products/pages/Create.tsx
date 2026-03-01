import {
  Button,
  Group,
  Stack,
  Card,
  Title,
  ActionIcon,
  SimpleGrid,
  Text,
  Paper,
  Stepper,
  Container,
  FileButton,
  Image,
  Badge,
  Grid,
  ThemeIcon,
  ScrollArea,
  Overlay,
  Center,
  Box,
} from '@mantine/core'

import { useCanGoBack, useRouter } from '@tanstack/react-router'
import {
  IconArrowLeft,
  IconTrash,
  IconShirt,
  IconTag,
  IconPhoto,
  IconUpload,
  IconStar,
  IconStarFilled,
  IconCheck,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import { type ProductImage } from '../schema'
import { CreateProductBasicDetails } from '@/components/products/create/BasicDetails'
import { VariantMediaManager } from '@/components/products/create/variant'
import { useProductStore } from '../productStore'
import { useMutation } from '@tanstack/react-query'
import { updateProductsMutationOptions } from '../queryOptions'
import { UserRoles } from '@/utils/constants'

// --- Schemas ---

// --- Main Component ---

export const CreateProduct = () => {
  const canGoBack = useCanGoBack()
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)

  // --- Step 2 State (Media) ---
  const [images, setImages] = useState<ProductImage[]>([])
  const [variantImageMap, setVariantImageMap] = useState<
    Record<string, string[]>
  >({}) // SKU -> Image IDs
  const [activeVariantSku, setActiveVariantSku] = useState<string | null>(null) // null = Global/All View

  const { unsavedProduct } = useProductStore((state) => state)

  const { mutateAsync: updateProduct, isPending: isUpdating } = useMutation(
    updateProductsMutationOptions,
  )
  // --- Form Setup ---

  // --- Handlers ---
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

  // const [createdProduct, setCreatedProduct] = useState<any>(null)
  const handleFinalSubmit = async () => {
    // Combine form data with image data
    // const finalData = {
    //   ...form.getTransformedValues(),
    //   images,
    //   variantImageMap,
    // }
    console.log('Final Submission:')

    const promises = unsavedProduct.variants.map((v) => {
      return updateProduct({
        role: UserRoles.ADMIN,
        id: v.id,
        data: {
          is_active: true,
        },
      })
    })
    // TODO: API Call here

    const res = await Promise.all(promises)
    console.log('res', res)
    // setCreatedProduct(res)
  }

  // --- Image Helpers ---
  const handleUpload = (files: File[]) => {
    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      file,
      isMain: images.length === 0, // First image is main by default
    }))
    setImages((prev) => [...prev, ...newImages])
  }

  const toggleImageForVariant = (imageId: string) => {
    if (!activeVariantSku) return

    setVariantImageMap((prev) => {
      const currentList = prev[activeVariantSku] || []
      const isSelected = currentList.includes(imageId)

      if (isSelected) {
        return {
          ...prev,
          [activeVariantSku]: currentList.filter((id) => id !== imageId),
        }
      } else {
        return {
          ...prev,
          [activeVariantSku]: [...currentList, imageId],
        }
      }
    })
  }

  const removeImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId))
    // Also remove from all mappings
    setVariantImageMap((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((sku) => {
        next[sku] = next[sku].filter((id) => id !== imageId)
      })
      return next
    })
  }

  const setMainImage = (imageId: string) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isMain: img.id === imageId })),
    )
  }

  // --- Render Steps ---

  // const renderMediaStep = () => (
  //   <Stack gap="xl">
  //     {/* Upload Area */}
  //     <Card withBorder padding="xl" radius="md">
  //       <Stack align="center" gap="xs">
  //         <ThemeIcon size={50} radius="xl" variant="light" color="blue">
  //           <IconUpload size={30} />
  //         </ThemeIcon>
  //         <Text size="xl" fw={500}>
  //           Upload Product Images
  //         </Text>
  //         <Text size="sm" c="dimmed">
  //           Drag & drop images here or click to select
  //         </Text>
  //         <FileButton
  //           onChange={handleUpload}
  //           accept="image/png,image/jpeg"
  //           multiple
  //         >
  //           {(props) => (
  //             <Button {...props} size="md" mt="md" variant="outline">
  //               Select Files
  //             </Button>
  //           )}
  //         </FileButton>
  //         <Text size="xs" c="dimmed">
  //           {images.length} images uploaded
  //         </Text>
  //       </Stack>
  //     </Card>

  //     {/* Media Workspace */}
  //     <Grid gutter="xl">
  //       {/* LEFT: Context Sidebar */}
  //       <Grid.Col span={{ base: 12, md: 4 }}>
  //         <Stack>
  //           <Text fw={600} size="sm" tt="uppercase" c="dimmed">
  //             Allocation Context
  //           </Text>

  //           <Paper
  //             withBorder
  //             p="md"
  //             radius="md"
  //             onClick={() => setActiveVariantSku(null)}
  //             style={{
  //               cursor: 'pointer',
  //               borderColor:
  //                 activeVariantSku === null
  //                   ? 'var(--mantine-color-blue-filled)'
  //                   : undefined,
  //               backgroundColor:
  //                 activeVariantSku === null
  //                   ? 'var(--mantine-color-blue-light)'
  //                   : undefined,
  //             }}
  //           >
  //             <Group justify="space-between">
  //               <Group gap="sm">
  //                 <IconPhoto size={20} />
  //                 <Text fw={500}>All Images</Text>
  //               </Group>
  //               <Badge variant="light" color="gray">
  //                 {images.length}
  //               </Badge>
  //             </Group>
  //           </Paper>

  //           <ScrollArea h={400}>
  //             <Stack gap="xs">
  //               {form.values.variants.map((v, i) => {
  //                 const sku = v.sku || `temp-${i}`
  //                 const count = variantImageMap[sku]?.length || 0
  //                 const isActive = activeVariantSku === sku

  //                 return (
  //                   <Paper
  //                     key={i}
  //                     withBorder
  //                     p="sm"
  //                     radius="md"
  //                     onClick={() => setActiveVariantSku(sku)}
  //                     style={{
  //                       cursor: 'pointer',
  //                       borderColor: isActive
  //                         ? 'var(--mantine-color-blue-filled)'
  //                         : undefined,
  //                       borderWidth: isActive ? 2 : 1,
  //                     }}
  //                   >
  //                     <Group justify="space-between">
  //                       <Stack gap={0} w="70%">
  //                         <Text truncate fw={500} size="sm">
  //                           {v.name || 'Unnamed Variant'}
  //                         </Text>
  //                         <Text c="dimmed" size="xs">
  //                           SKU: {sku}
  //                         </Text>
  //                       </Stack>
  //                       <Badge
  //                         color={count > 0 ? 'blue' : 'gray'}
  //                         variant={isActive ? 'filled' : 'light'}
  //                       >
  //                         {count}
  //                       </Badge>
  //                     </Group>
  //                   </Paper>
  //                 )
  //               })}
  //             </Stack>
  //           </ScrollArea>
  //         </Stack>
  //       </Grid.Col>

  //       {/* RIGHT: Image Grid */}
  //       <Grid.Col span={{ base: 12, md: 8 }}>
  //         <Stack>
  //           <Group justify="space-between">
  //             <Text fw={600} size="lg">
  //               {activeVariantSku
  //                 ? `Images for: ${activeVariantSku}`
  //                 : 'Global Gallery'}
  //             </Text>
  //             {activeVariantSku && (
  //               <Text size="xs" c="dimmed">
  //                 Click images to assign/unassign
  //               </Text>
  //             )}
  //           </Group>

  //           <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }}>
  //             {images.map((img) => {
  //               const isSelectedForVariant = activeVariantSku
  //                 ? variantImageMap[activeVariantSku]?.includes(img.id)
  //                 : false

  //               return (
  //                 <Card
  //                   key={img.id}
  //                   padding={0}
  //                   radius="md"
  //                   withBorder
  //                   style={{
  //                     cursor: activeVariantSku ? 'pointer' : 'default',
  //                     borderColor: isSelectedForVariant
  //                       ? 'var(--mantine-color-green-6)'
  //                       : undefined,
  //                     borderWidth: isSelectedForVariant ? 3 : 1,
  //                   }}
  //                   onClick={() => toggleImageForVariant(img.id)}
  //                 >
  //                   <Card.Section>
  //                     <Image src={img.url} h={120} fit="cover" />
  //                     {/* Overlays */}
  //                     {isSelectedForVariant && (
  //                       <Overlay color="#fff" backgroundOpacity={0} zIndex={5}>
  //                         <Center h="100%">
  //                           <ThemeIcon color="green" size="lg" radius="xl">
  //                             <IconCheck size={20} />
  //                           </ThemeIcon>
  //                         </Center>
  //                       </Overlay>
  //                     )}
  //                   </Card.Section>

  //                   <Group justify="space-between" p="xs">
  //                     <ActionIcon
  //                       variant="transparent"
  //                       color={img.isMain ? 'yellow' : 'gray'}
  //                       onClick={(e) => {
  //                         e.stopPropagation()
  //                         setMainImage(img.id)
  //                       }}
  //                       title="Set as Main Image"
  //                     >
  //                       {img.isMain ? (
  //                         <IconStarFilled size={18} />
  //                       ) : (
  //                         <IconStar size={18} />
  //                       )}
  //                     </ActionIcon>
  //                     <ActionIcon
  //                       variant="transparent"
  //                       color="red"
  //                       onClick={(e) => {
  //                         e.stopPropagation()
  //                         removeImage(img.id)
  //                       }}
  //                       title="Remove Image"
  //                     >
  //                       <IconTrash size={18} />
  //                     </ActionIcon>
  //                   </Group>
  //                 </Card>
  //               )
  //             })}
  //           </SimpleGrid>

  //           {images.length === 0 && (
  //             <Center py="xl">
  //               <Text c="dimmed">No images uploaded yet.</Text>
  //             </Center>
  //           )}
  //         </Stack>
  //       </Grid.Col>
  //     </Grid>

  //     <Group justify="space-between" mt="xl">
  //       <Button variant="default" onClick={() => setActiveStep(0)}>
  //         Back to Details
  //       </Button>
  //       <Button
  //         color="green"
  //         onClick={handleFinalSubmit}
  //         disabled={images.length === 0}
  //       >
  //         Create Product
  //       </Button>
  //     </Group>
  //   </Stack>

  return (
    <Container size="xl">
      <Stack gap="lg" pb="xl">
        {/* Header Section */}
        <Group justify="space-between" align="center">
          <Group>
            {canGoBack && (
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => router.history.back()}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
            )}
            <Stack gap={0}>
              <Title order={2}>Create Product</Title>
              <Text c="dimmed" size="sm">
                {activeStep === 0
                  ? 'Add details and initial variants'
                  : 'Manage product media'}
              </Text>
            </Stack>
          </Group>
        </Group>

        {/* Stepper Context */}
        <Stepper
          active={activeStep}
          onStepClick={setActiveStep}
          allowNextStepsSelect={unsavedProduct && unsavedProduct.id}
          breakpoint="sm"
        >
          <Stepper.Step
            label="Product Details"
            description="Basic info & variants"
            icon={<IconShirt size={18} />}
          />
          <Stepper.Step
            label="Media"
            description="Images & Gallery"
            icon={<IconPhoto size={18} />}
          />
          <Stepper.Step
            label="Review"
            description="Final check"
            icon={<IconTag size={18} />}
          />
        </Stepper>

        <Box>
          <div style={{ display: activeStep === 0 ? 'block' : 'none' }}>
            <CreateProductBasicDetails setActiveStep={setActiveStep} />
          </div>
          <div style={{ display: activeStep === 1 ? 'block' : 'none' }}>
            <VariantMediaManager onFinish={handleFinalSubmit} />
          </div>
        </Box>
      </Stack>
    </Container>
  )
}
