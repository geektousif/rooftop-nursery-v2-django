import {
  Button,
  Group,
  Stack,
  Card,
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
  Paper,
  Accordion,
  JsonInput,
  Collapse,
  UnstyledButton,
  Box,
  TagsInput,
} from '@mantine/core'
import {
  IconPlus,
  IconTrash,
  IconCurrencyDollar,
  IconScale,
  IconBoxSeam,
  IconChevronDown,
  IconChevronRight,
  IconRuler,
  IconListNumbers,
} from '@tabler/icons-react'
import { productSchema } from '@/features/products/schema'
import { zod4Resolver, zodResolver } from 'mantine-form-zod-resolver'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { productApi } from '@/api/services/products'
import { UserRoles } from '@/utils/constants'
import { notifications } from '@mantine/notifications'
import { useProductStore } from '@/features/products/productStore'
import { SearchableSelect } from '@/components/common/Combobox'
import { getCategoriesQueryOptions } from '@/features/categories/queryOptions'
import { getVendorsQueryOptions } from '@/features/vendors/queryOptions'
import { updateProductsMutationOptions } from '@/features/products/queryOptions'

export const CreateProductBasicDetails = ({ setActiveStep }) => {
  const {
    data: categories,
    isLoading,
    isError,
  } = useQuery(getCategoriesQueryOptions)

  const {
    data: vendors,
    isLoading: isLoadingVendors,
    isError: isErrorVendors,
  } = useQuery(getVendorsQueryOptions)

  const vendorOptions = useMemo(() => {
    return !isErrorVendors && vendors
      ? vendors.map((v) => ({
          label: v.business_name || v.name,
          value: v.id,
        }))
      : []
  }, [vendors, isErrorVendors])

  const setCreatedProduct = useProductStore((state) => state.setUnsavedProduct)

  // useEffect(() => {

  //   console.log('categories', categories)
  // }, [categories])

  // const { mutateAsync: updateProduct, isLoading: isUpdating } = useMutation(
  //   updateProductsMutationOptions,
  // )

  const router = useRouter()
  const form = useForm({
    validate: zod4Resolver(productSchema),
    initialValues: {
      productName: '',
      description: '',
      attributes: '',
      tags: [],
      category: [],
      vendor_id: null,
      isActive: true,
      variants: [
        {
          name: 'Default Variant',
          description: '',
          sku: '',
          price: 0,
          mrp: 0,
          cost_price: 0,
          stock: 0,
          variantAttributes: '',
          weightInGrams: 0,
          unit: '',
          unitValue: 0,
          displayOrder: 0,
          isActive: true,
        },
      ],
    },
    transformValues: (values) => ({
      ...values,
      attributes: values.attributes ? JSON.parse(values.attributes) : {},
      variants: values.variants.map((v) => ({
        ...v,
        variantAttributes: v.variantAttributes
          ? JSON.parse(v.variantAttributes)
          : {},
      })),
    }),
  })

  const { mutateAsync: createProduct } = useMutation({
    mutationFn: async (data) => {
      console.info('create product', data)
      //send api update request here
      return await productApi.create(UserRoles.ADMIN, data)
    },
    //client side optimistic update
    onMutate: (newProd) => {
      console.log('newProd', newProd)
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  })

  const handleSubmitStep1 = async () => {
    const data = form.getTransformedValues()
    // setActiveStep(1)
    const res = await createProduct({
      ...data,
      category_ids: data.category,
      name: data.productName,
    })

    setCreatedProduct({
      ...res.data?.product,
      variants: res.data?.variants,
    })
    notifications.show({
      title: 'Success',
      message: 'Product created successfully',
      color: 'green',
    })

    setActiveStep(1)
  }

  const [showProductAttributes, { toggle: toggleProductAttributes }] =
    useDisclosure(false)

  const addVariant = () => {
    form.insertListItem('variants', {
      name: '',
      description: '',
      sku: '',
      price: 0,
      mrp: 0,
      cost_price: 0,
      stock: 0,
      variantAttributes: '',
      weightInGrams: 0,
      unit: '',
      unitValue: 0,
      displayOrder: 0,
      isActive: true,
    })
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmitStep1)}>
      <Stack gap="xl">
        {/* General Info */}
        <Card withBorder shadow="sm" radius="md">
          <Card.Section withBorder inheritPadding py="xs">
            <Group justify="space-between">
              <Text fw={500}>General Information</Text>
              <Switch
                labelPosition="left"
                label="Product Active"
                {...form.getInputProps('isActive', { type: 'checkbox' })}
              />
            </Group>
          </Card.Section>
          <Stack gap="md" mt="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                withAsterisk
                label="Product Name"
                placeholder="e.g. Cotton Oversized T-Shirt"
                {...form.getInputProps('productName')}
              />
              <SearchableSelect
                label="Vendor"
                isLoading={isLoadingVendors}
                placeholder="Select a vendor"
                data={vendorOptions}
                // This hooks it up to the Mantine useForm
                {...form.getInputProps('vendor_id')}
              />
            </SimpleGrid>
            <Textarea
              label="Description"
              placeholder="Describe the product..."
              minRows={3}
              {...form.getInputProps('description')}
            />
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <MultiSelect
                label="Category"
                placeholder="Select category"
                data={
                  !isLoading &&
                  !isError &&
                  categories?.map((c) => ({ label: c.name, value: c.id }))
                }
                searchable
                nothingFoundMessage="No categories found"
                {...form.getInputProps('category')}
              />
              <TagsInput
                label="Tags"
                placeholder="Search tags"
                data={['New Arrival', 'Best Seller', 'Summer', 'Winter']}
                {...form.getInputProps('tags')}
              />
            </SimpleGrid>

            {/* Advanced Product Attributes Toggle */}
            <Box>
              <UnstyledButton
                onClick={toggleProductAttributes}
                fz="sm"
                c="blue"
                fw={500}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {showProductAttributes ? (
                  <IconChevronDown size={14} />
                ) : (
                  <IconChevronRight size={14} />
                )}
                <Text span ml={5}>
                  Advanced Attributes
                </Text>
              </UnstyledButton>
              <Collapse in={showProductAttributes}>
                <JsonInput
                  mt="xs"
                  label="Custom Attributes (JSON)"
                  placeholder='{"material": "cotton", "care": "wash cold"}'
                  validationError="Invalid JSON"
                  formatOnBlur
                  autosize
                  minRows={2}
                  {...form.getInputProps('attributes')}
                />
              </Collapse>
            </Box>
          </Stack>
        </Card>

        {/* Variants */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Variants
            </Text>
            <Button
              leftSection={<IconPlus size={16} />}
              variant="light"
              onClick={addVariant}
              size="xs"
            >
              Add Variant
            </Button>
          </Group>

          {form.values.variants.length === 0 && (
            <Paper withBorder p="xl" ta="center" bg="gray.0">
              <Text c="dimmed">
                No variants added. Please add at least one.
              </Text>
            </Paper>
          )}

          <Accordion variant="separated" radius="md" defaultValue="variant-0">
            {form.values.variants.map((_, index) => (
              <Accordion.Item key={index} value={`variant-${index}`}>
                <Accordion.Control
                  icon={<IconBoxSeam size={20} color="gray" />}
                >
                  <Group justify="space-between" w="100%" pr="md">
                    <Text fw={500}>
                      {form.values.variants[index].name ||
                        `Variant ${index + 1}`}
                    </Text>
                    {form.values.variants.length > 1 && (
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={(e) => {
                          e.stopPropagation()
                          form.removeListItem('variants', index)
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="md">
                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                      <TextInput
                        label="Variant Name"
                        placeholder="e.g. Red / Large"
                        withAsterisk
                        {...form.getInputProps(`variants.${index}.name`)}
                      />
                      <TextInput
                        label="SKU"
                        placeholder="PROD-RED-L"
                        withAsterisk
                        {...form.getInputProps(`variants.${index}.sku`)}
                      />
                    </SimpleGrid>

                    <Textarea
                      label="Variant Description"
                      placeholder="Specific details for this variant"
                      autosize
                      minRows={2}
                      {...form.getInputProps(`variants.${index}.description`)}
                    />

                    <Divider
                      label="Pricing & Inventory"
                      labelPosition="center"
                    />

                    <SimpleGrid cols={{ base: 1, sm: 3 }}>
                      <NumberInput
                        label="Selling Price"
                        leftSection={<IconCurrencyDollar size={16} />}
                        min={0}
                        withAsterisk
                        {...form.getInputProps(`variants.${index}.price`)}
                      />
                      <NumberInput
                        label="MRP"
                        leftSection={<IconCurrencyDollar size={16} />}
                        min={0}
                        {...form.getInputProps(`variants.${index}.mrp`)}
                      />
                      <NumberInput
                        label="Cost Price"
                        leftSection={<IconCurrencyDollar size={16} />}
                        min={0}
                        {...form.getInputProps(`variants.${index}.cost_price`)}
                      />
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                      <NumberInput
                        label="Stock Quantity"
                        min={0}
                        {...form.getInputProps(`variants.${index}.stock`)}
                      />
                      <NumberInput
                        label="Weight (grams)"
                        rightSection={<IconScale size={16} />}
                        min={0}
                        {...form.getInputProps(
                          `variants.${index}.weightInGrams`,
                        )}
                      />
                    </SimpleGrid>

                    <Divider
                      label="Specifications & Display"
                      labelPosition="center"
                    />

                    <SimpleGrid cols={{ base: 1, sm: 3 }}>
                      <TextInput
                        label="Unit"
                        placeholder="e.g. kg, ml, pcs"
                        leftSection={<IconRuler size={16} />}
                        {...form.getInputProps(`variants.${index}.unit`)}
                      />
                      <NumberInput
                        label="Unit Value"
                        placeholder="e.g. 1.5"
                        min={0}
                        {...form.getInputProps(`variants.${index}.unitValue`)}
                      />
                      <NumberInput
                        label="Display Order"
                        min={0}
                        leftSection={<IconListNumbers size={16} />}
                        {...form.getInputProps(
                          `variants.${index}.displayOrder`,
                        )}
                      />
                    </SimpleGrid>

                    <JsonInput
                      label="Variant Attributes (JSON)"
                      placeholder='{"color": "#ff0000", "size": "XL"}'
                      validationError="Invalid JSON"
                      formatOnBlur
                      autosize
                      minRows={1}
                      {...form.getInputProps(
                        `variants.${index}.variantAttributes`,
                      )}
                    />

                    <Group justify="flex-end">
                      <Switch
                        label="Variant Enabled"
                        {...form.getInputProps(`variants.${index}.isActive`, {
                          type: 'checkbox',
                        })}
                      />
                    </Group>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={() => router.history.back()}>
            Cancel
          </Button>
          <Button type="submit" size="md" color="blue">
            Continue to Media
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
