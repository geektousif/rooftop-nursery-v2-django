import {
  Box,
  Button,
  Card,
  Group,
  Image,
  Stack,
  Text,
  SimpleGrid,
  ActionIcon,
  rem,
  Tabs,
  ThemeIcon,
  Badge,
  FileButton,
  Loader,
  Overlay,
  Center,
  Tooltip,
  Title,
  Progress,
} from '@mantine/core'
import {
  IconUpload,
  IconTrash,
  IconStar,
  IconPhoto,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { notifications } from '@mantine/notifications'
import { useProductStore } from '@/features/products/productStore'
import {
  authenticateImageUploadApi,
  deleteImageApi,
  setPrimaryImageApi,
  uploadImageApi,
} from '@/api/services/images'
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from '@imagekit/react'
import { IMAGEKIT_PUBLIC_KEY } from '@/utils/imagekit'

// --- Types ---
type Variant = {
  id: string
  name: string
  sku: string
}

type ProductData = {
  id: string
  name: string
  variants: Variant[]
}

type VariantImage = {
  id: string // Local ID for tracking
  url: string
  isMain: boolean
  status: 'uploading' | 'success' | 'error'
  progress: number // 0-100
  fileId?: string // Real ImageKit File ID (populated after success)
}

// Map: VariantID -> Array of Images
type MediaState = Record<string, VariantImage[]>

export const VariantMediaManager = ({ onFinish }: { onFinish: () => void }) => {
  const product = useProductStore((state) => state.unsavedProduct)

  const [activeTab, setActiveTab] = useState<string>('')
  const [mediaState, setMediaState] = useState<MediaState>({})

  const [isGlobalUploading, setIsGlobalUploading] = useState(false)

  useEffect(() => {
    if (product) {
      setActiveTab(product.variants[0]?.id || '')

      const initialState = product.variants.reduce(
        (acc, v) => ({ ...acc, [v.id]: [] }),
        {},
      )

      setMediaState(initialState)
    }
  }, [product])

  if (!product) return null

  // State to hold images for EACH variant separately

  // --- 1. Authenticator Function (From your snippet) ---
  const authenticator = async () => {
    try {
      const response = await authenticateImageUploadApi()
      if (!response.status || response.status !== 200) {
        throw new Error(`Auth failed: ${response.statusText}`)
      }
      const data = response.data
      // Ensure your backend returns exactly these keys
      const { signature, expire, token } = data
      return { signature, expire, token }
    } catch (error) {
      console.error('Authentication error:', error)
      throw error // Propagate to stop upload
    }
  }

  // --- 2. Upload Handler ---
  const handleUpload = async (files: File[], variantId: string) => {
    if (!files.length) return
    setIsGlobalUploading(true)

    // A. Generate Optimistic Placeholders
    const newPlaceholders: VariantImage[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9), // Temp ID
      url: URL.createObjectURL(file), // Immediate Local Preview
      isMain: false,
      status: 'uploading',
      progress: 0,
    }))

    // Update UI immediately
    setMediaState((prev) => ({
      ...prev,
      [variantId]: [...(prev[variantId] || []), ...newPlaceholders],
    }))

    // B. Process Uploads (Parallel)
    const uploadPromises = files.map(async (file, index) => {
      const placeholder = newPlaceholders[index]

      try {
        // 1. Get Auth Params
        const { signature, expire, token } = await authenticator()

        // 2. Upload to ImageKit
        const uploadResponse = await upload({
          file,
          fileName: `${variantId}_${file.name}`,
          useUniqueFileName: true,
          tags: ['product', `variant-${variantId}`],
          publicKey: IMAGEKIT_PUBLIC_KEY,
          signature,
          expire,
          token,
          onProgress: (event) => {
            // Update Progress Bar
            const percent = (event.loaded / event.total) * 100
            setMediaState((prev) => ({
              ...prev,
              [variantId]: prev[variantId].map((img) =>
                img.id === placeholder.id ? { ...img, progress: percent } : img,
              ),
            }))
          },
        })

        // 3. Sync with Backend (Crucial Step!)
        await uploadImageApi({
          variant_id: variantId,
          image_url: uploadResponse.url,
          image_provider_id: uploadResponse.fileId,
          thumbnail_url: uploadResponse.thumbnailUrl,
        })

        notifications.show({
          color: 'green',
          message: 'Image uploaded successfully',
        })

        // 4. Update State to Success
        setMediaState((prev) => ({
          ...prev,
          [variantId]: prev[variantId].map((img) =>
            img.id === placeholder.id
              ? {
                  ...img,
                  status: 'success',
                  url: uploadResponse.url, // Switch to real URL
                  fileId: uploadResponse.fileId,
                }
              : img,
          ),
        }))
      } catch (error) {
        // Handle Errors
        let errorMessage = 'Upload failed'
        if (error instanceof ImageKitAbortError) errorMessage = 'Aborted'
        else if (error instanceof ImageKitInvalidRequestError)
          errorMessage = 'Invalid Request'
        else if (error instanceof ImageKitUploadNetworkError)
          errorMessage = 'Network Error'
        else if (error instanceof ImageKitServerError)
          errorMessage = 'Server Error'

        console.error(errorMessage, error)

        setMediaState((prev) => ({
          ...prev,
          [variantId]: prev[variantId].map((img) =>
            img.id === placeholder.id ? { ...img, status: 'error' } : img,
          ),
        }))

        notifications.show({
          color: 'red',
          message: `Failed to upload ${file.name}: ${errorMessage}`,
        })
      }
    })

    await Promise.allSettled(uploadPromises)
    setIsGlobalUploading(false)
  }

  // --- 3. Other Actions ---

  const handleDelete = async (variantId: string, imageId: string) => {
    // 1. Optimistic Delete
    setMediaState((prev) => ({
      ...prev,
      [variantId]: prev[variantId].filter((img) => img.id !== imageId),
    }))

    // 2. API Call (If it was a successful upload)
    const image = mediaState[variantId].find((i) => i.id === imageId)
    if (image?.fileId) {
      try {
        await deleteImageApi(image.fileId)
        notifications.show({
          color: 'green',
          message: 'Image deleted successfully',
        })
      } catch (error) {
        console.log('error', error)
        notifications.show({
          color: 'red',
          message: `Failed to delete image: ${error}`,
        })
      }
    }
  }

  const handleSetMain = async (
    variantId: string,
    imageId: string,
    fileId: string,
  ) => {
    setMediaState((prev) => ({
      ...prev,
      [variantId]: prev[variantId].map((img) => ({
        ...img,
        isMain: img.id === imageId,
      })),
    }))
    // await api.patch(...)

    try {
      await setPrimaryImageApi(fileId)
      notifications.show({
        color: 'green',
        message: 'Primary image set successfully',
      })
    } catch (error) {
      console.log('error', error)
      notifications.show({
        color: 'red',
        message: `Failed to set primary image: ${error}`,
      })
    }
  }

  // --- 4. Render ---
  return (
    <Stack h="100%">
      <Group justify="space-between" mb="md">
        <Stack gap={0}>
          <Text size="lg" fw={600}>
            Media Management
          </Text>
          <Text size="sm" c="dimmed">
            Upload images for each variant independently.
          </Text>
        </Stack>
        <Button onClick={onFinish} color="green" disabled={isGlobalUploading}>
          Finish & Publish
        </Button>
      </Group>

      <Card withBorder radius="md" p={0} h={600} style={{ overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          orientation="vertical"
          h="100%"
          variant="pills"
          radius="0"
        >
          {/* Sidebar: Variant List */}
          <Tabs.List
            bg="gray.0"
            style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }}
            w={280}
          >
            <Box p="md" pb="xs">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                Select Variant
              </Text>
            </Box>

            {product.variants.map((variant) => {
              const images = mediaState[variant.id] || []
              const count = images.length
              const hasError = images.some((i) => i.status === 'error')
              const isUploading = images.some((i) => i.status === 'uploading')

              return (
                <Tabs.Tab
                  key={variant.id}
                  value={variant.id.toString()}
                  p="md"
                  style={{ justifyContent: 'space-between' }}
                  rightSection={
                    <Group gap={5}>
                      {isUploading && <Loader size={12} />}
                      {hasError && <IconAlertCircle size={16} color="red" />}
                      <Badge
                        size="sm"
                        variant={count > 0 ? 'filled' : 'light'}
                        color={count > 0 ? 'blue' : 'gray'}
                      >
                        {count}
                      </Badge>
                    </Group>
                  }
                >
                  <Stack gap={0} align="flex-start">
                    <Text size="sm" fw={500} truncate w={150}>
                      {variant.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {variant.sku}
                    </Text>
                  </Stack>
                </Tabs.Tab>
              )
            })}
          </Tabs.List>

          {/* Main Area: Image Grid */}
          {product.variants.map((variant) => (
            <Tabs.Panel key={variant.id} value={variant.id.toString()} p="xl">
              <Stack h="100%">
                <Group justify="space-between">
                  <Title order={4}>{variant.name} Images</Title>
                  <FileButton
                    onChange={(files) => handleUpload(files, variant.id)}
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                  >
                    {(props) => (
                      <Button
                        {...props}
                        leftSection={<IconUpload size={18} />}
                        variant="light"
                        loading={mediaState[variant.id]?.some(
                          (i) => i.status === 'uploading',
                        )}
                      >
                        Upload Images
                      </Button>
                    )}
                  </FileButton>
                </Group>

                <Box style={{ flex: 1, overflowY: 'auto' }}>
                  {mediaState[variant.id]?.length === 0 ? (
                    <Center h={300}>
                      <Stack align="center" gap="xs">
                        <ThemeIcon
                          size={60}
                          radius="xl"
                          variant="light"
                          color="gray"
                        >
                          <IconPhoto size={30} />
                        </ThemeIcon>
                        <Text c="dimmed">
                          No images allocated to this variant.
                        </Text>
                      </Stack>
                    </Center>
                  ) : (
                    <SimpleGrid
                      cols={{ base: 2, sm: 3, md: 4, lg: 5 }}
                      spacing="lg"
                    >
                      {mediaState[variant.id]?.map((img) => (
                        <Card
                          key={img.id}
                          padding={0}
                          radius="md"
                          withBorder
                          shadow="sm"
                        >
                          <Card.Section>
                            <Box pos="relative" h={140}>
                              <Image
                                src={img.url}
                                h={140}
                                fit="cover"
                                style={{
                                  opacity: img.status === 'uploading' ? 0.6 : 1,
                                  filter:
                                    img.status === 'error'
                                      ? 'grayscale(1)'
                                      : 'none',
                                }}
                              />

                              {/* Progress Overlay */}
                              {img.status === 'uploading' && (
                                <Stack
                                  pos="absolute"
                                  inset={0}
                                  justify="center"
                                  px="xs"
                                  bg="rgba(255,255,255,0.8)"
                                >
                                  <Loader size="sm" mb={5} />
                                  <Progress
                                    value={img.progress}
                                    w="100%"
                                    size="sm"
                                  />
                                </Stack>
                              )}

                              {/* Error Overlay */}
                              {img.status === 'error' && (
                                <Center
                                  pos="absolute"
                                  inset={0}
                                  bg="rgba(255,0,0,0.1)"
                                >
                                  <IconAlertCircle color="red" size={30} />
                                </Center>
                              )}

                              {/* Main Badge */}
                              {img.isMain && (
                                <Badge
                                  pos="absolute"
                                  top={5}
                                  left={5}
                                  color="yellow"
                                  variant="filled"
                                >
                                  Main
                                </Badge>
                              )}
                            </Box>
                          </Card.Section>

                          <Group justify="space-between" p="xs" gap={5}>
                            <Tooltip label="Set as Main">
                              <ActionIcon
                                variant={img.isMain ? 'filled' : 'subtle'}
                                color={img.isMain ? 'yellow' : 'gray'}
                                onClick={() =>
                                  handleSetMain(variant.id, img.id, img.fileId!)
                                }
                                disabled={img.status !== 'success'}
                              >
                                <IconStar size={16} />
                              </ActionIcon>
                            </Tooltip>

                            <Tooltip label="Delete">
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => handleDelete(variant.id, img.id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}
                </Box>
              </Stack>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Card>
    </Stack>
  )
}
