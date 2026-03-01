import { z } from 'zod'

const variantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be positive'),
  mrp: z.number().min(0, 'MRP must be positive'),
  cost_price: z.number().optional(),
  stock: z.number().min(0),
  variantAttributes: z.string().optional(),
  weightInGrams: z.number().optional(),
  unit: z.string().optional(),
  unitValue: z.number().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().default(true),
})

const productSchema = z.object({
  productName: z.string().min(1, 'Product Name is required'),
  description: z.string().optional(),
  attributes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
})

// --- Types for Image Handling ---
type ProductImage = {
  id: string
  url: string
  file: File
  isMain: boolean
}

export { variantSchema, productSchema, type ProductImage }
