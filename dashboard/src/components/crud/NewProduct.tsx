import {
  Button,
  Group,
  Stack,
  Box,
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
  Paper,
  Accordion,
  ThemeIcon,
  rem,
  Stepper,
  Container,
  JsonInput,
  Collapse,
  UnstyledButton,
} from '@mantine/core'
import { Form, useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'
import { useCanGoBack, useRouter } from '@tanstack/react-router'
import {
  IconArrowLeft,
  IconPlus,
  IconTrash,
  IconShirt,
  IconTag,
  IconCurrencyDollar,
  IconScale,
  IconBoxSeam,
  IconChevronRight,
  IconPhoto,
  IconListNumbers,
  IconRuler,
  IconChevronDown,
} from '@tabler/icons-react'
import { useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
// const variantSchema = z.object({
//   name: z.string().min(1),
//   description: z.string().optional(),
//   sku: z.string().min(1),
//   price: z.coerce.number().min(0),
//   mrp: z.coerce.number().min(0),
//   cost_price: z.coerce.number().optional(),
//   stock: z.coerce.number().min(0),
//   variantAttributes: z.object(z.any()).optional(),
//   weightInGrams: z.coerce.number().min(0).optional(),
//   unit: z.string().min(1).optional(),
//   unitValue: z.coerce.number().min(0).optional(),
//   displayOrder: z.coerce.number().min(0).optional(),
//   isActive: z.boolean().default(true),
//   // isFeatured: z.boolean().default(false),
// })

// const productSchema = z.object({
//   productName: z.string().min(1),
//   description: z.string().optional(),
//   attributes: z.object(z.any()).optional(),
//   tags: z.object({
//     tags: z.array(z.any()).optional(),
//   }),
//   category: z.array(z.any()).optional(),
//   isActive: z.boolean().default(true),
//   variants: z.array(variantSchema).min(1),
// })

// export const CreateProduct = () => {
//   const canGoBack = useCanGoBack()
//   const router = useRouter()

//   const form = useForm({
//     initialValues: {
//       productName: '',
//       description: '',
//       attributes: {},
//       tags: [],
//       category: [],
//       isActive: true,
//       variants: [
//         {
//           name: '',
//           description: '',
//           sku: '',
//           price: 0,
//           mrp: 0,
//           cost_price: 0,
//           stock: 0,
//           variantAttributes: {},
//           weightInGrams: 0,
//           unit: '',
//           unitValue: 0,
//           displayOrder: 0,
//           isActive: true,
//         },
//       ],
//     },
//   })

//   const handleSubmit = (values) => {
//     console.log('values', values)
//   }

//   return (
//     <Card p="md">
//       <Group align="center">
//         <Stack>
//           <Group>
//             <ActionIcon>
//               {canGoBack && (
//                 <Button onClick={() => router.history.back()}>Back</Button>
//               )}
//             </ActionIcon>

//             <Title
//               order={3}
//               size="h3"
//               style={{
//                 textTransform: 'capitalize',
//               }}
//             >
//               Create Product
//             </Title>
//           </Group>
//         </Stack>
//       </Group>
//       <Box pt="sm">
//         <Form onSubmit={handleSubmit} form={form}>
//           <Stack>
//             <Button type="submit">Submit</Button>
//           </Stack>
//         </Form>
//       </Box>
//     </Card>
//   )
// }

const variantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be positive'),
  mrp: z.number().min(0, 'MRP must be positive'),
  cost_price: z.number().optional(),
  stock: z.number().min(0),
  variantAttributes: z.string().optional(), // Changed to string for JsonInput handling
  weightInGrams: z.number().optional(),
  unit: z.string().optional(),
  unitValue: z.number().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().default(true),
})

const productSchema = z.object({
  productName: z.string().min(1, 'Product Name is required'),
  description: z.string().optional(),
  attributes: z.string().optional(), // Changed to string for JsonInput handling
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
})

export const CreateProduct = () => {
  const canGoBack = useCanGoBack()
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [showProductAttributes, { toggle: toggleProductAttributes }] =
    useDisclosure(false)

  // --- Form Setup ---
  const form = useForm({
    validate: zodResolver(productSchema),
    initialValues: {
      productName: '',
      description: '',
      attributes: '',
      tags: [],
      category: '',
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
      // Parse JSON strings back to objects before submission if valid
      attributes: values.attributes ? JSON.parse(values.attributes) : {},
      variants: values.variants.map((v) => ({
        ...v,
        variantAttributes: v.variantAttributes
          ? JSON.parse(v.variantAttributes)
          : {},
      })),
    }),
  })

  // --- Handlers ---
  const handleSubmit = (values: typeof form.values) => {
    console.log('Submitting Product:', values)
    setActiveStep(1)
  }

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

  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Toys']
  const tagSuggestions = ['New Arrival', 'Best Seller', 'Summer', 'Winter']

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
                Add details and initial variants
              </Text>
            </Stack>
          </Group>
        </Group>

        {/* Stepper Context */}
        <Stepper
          active={activeStep}
          onStepClick={setActiveStep}
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

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="xl">
            {/* SECTION 1: General Info */}
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
                <TextInput
                  withAsterisk
                  label="Product Name"
                  placeholder="e.g. Cotton Oversized T-Shirt"
                  {...form.getInputProps('productName')}
                />
                <Textarea
                  label="Description"
                  placeholder="Describe the product..."
                  minRows={3}
                  {...form.getInputProps('description')}
                />
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Select
                    label="Category"
                    placeholder="Select category"
                    data={categories}
                    searchable
                    {...form.getInputProps('category')}
                  />
                  <MultiSelect
                    label="Tags"
                    placeholder="Search tags"
                    data={tagSuggestions}
                    searchable
                    creatable
                    getCreateLabel={(query) => `+ Create ${query}`}
                    onCreate={(query) => query}
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

            {/* SECTION 2: Variants */}
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

              <Accordion
                variant="separated"
                radius="md"
                defaultValue="variant-0"
              >
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
                          {...form.getInputProps(
                            `variants.${index}.description`,
                          )}
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
                            {...form.getInputProps(
                              `variants.${index}.cost_price`,
                            )}
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
                            {...form.getInputProps(
                              `variants.${index}.unitValue`,
                            )}
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
                            {...form.getInputProps(
                              `variants.${index}.isActive`,
                              { type: 'checkbox' },
                            )}
                          />
                        </Group>
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Stack>

            {/* Footer Actions */}
            <Group justify="flex-end" mt="xl">
              <Button variant="default" onClick={() => router.history.back()}>
                Cancel
              </Button>
              <Button type="submit" size="md" color="blue">
                Save & Continue
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  )
}
