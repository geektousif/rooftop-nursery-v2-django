// routes/products/new.tsx

import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Check, Loader2, Package, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { VariantCard } from '@/components/products/steps/VariantCard'

export const Route = createFileRoute('/_authenticated/admin/products/new')({
  component: NewProduct,
})

export default function NewProduct() {
  const navigate = useNavigate()
  const { toast } = useToast()

  // Product (container) - minimal info
  const [productId, setProductId] = useState<string | null>(null)
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Array<string>>(
    [],
  )
  const [tags, setTags] = useState<Array<string>>([])

  // Variants (the actual products)
  const [variants, setVariants] = useState<Array<Variant>>([])

  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // Auto-create product once name is entered
  useEffect(() => {
    //   if (
    //     productName.length >= 3 &&
    //     selectedCategories.length > 0 &&
    //     !productId
    //   ) {
    //     handleCreateProduct()
    //   }
    // }, [productName, selectedCategories])
    setProductId('temp')
  }, [])

  const handleCreateProduct = async () => {
    setIsCreatingProduct(true)

    try {
      const response = await fetch('/api/v1/vendor/products/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          description: productDescription,
          categories: selectedCategories,
          tags: tags,
          is_active: false, // Draft mode
        }),
      })

      const data = await response.json()
      setProductId(data.id)

      toast({
        title: 'Product created',
        description: 'Now add your first variant',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    } finally {
      setIsCreatingProduct(false)
    }
  }

  const handleAddVariant = () => {
    const newVariant: Variant = {
      id: `temp-${Date.now()}`,
      name: '',
      sku: '',
      description: '',
      price: '',
      mrp: '',
      stock: '',
      unit: 'piece',
      unitValue: '1',
      images: [],
      variant_attributes: {},
      isNew: true,
      isExpanded: true, // Auto-expand new variants
    }

    setVariants([...variants, newVariant])
  }

  const handleVariantChange = (
    variantId: string,
    updates: Partial<Variant>,
  ) => {
    setVariants(
      variants.map((v) => (v.id === variantId ? { ...v, ...updates } : v)),
    )
  }

  const handleRemoveVariant = (variantId: string) => {
    setVariants(variants.filter((v) => v.id !== variantId))
  }

  const handlePublish = async () => {
    // Validate
    if (variants.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No variants',
        description: 'Add at least one variant before publishing',
      })
      return
    }

    const unsavedVariants = variants.filter((v) => v.isNew)
    if (unsavedVariants.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Unsaved variants',
        description: `Save all variants before publishing (${unsavedVariants.length} unsaved)`,
      })
      return
    }

    setIsPublishing(true)

    try {
      // Activate product
      await fetch(`/api/v1/vendor/products/${productId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true }),
      })

      toast({
        title: 'Product published!',
        description: 'Your product is now live',
      })

      navigate({ to: '/products' })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Add New Product"
        description={
          productId
            ? `Product ID: ${productId} (Draft)`
            : 'Enter basic info to start'
        }
      >
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/products' })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Product Setup Card (stays at top) */}
          <div className="card-elevated p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">Product Information</h3>
                <p className="text-sm text-muted-foreground">
                  Basic details about your product family
                </p>
              </div>
              {productId && (
                <Badge variant="outline" className="gap-1">
                  <Check className="h-3 w-3" />
                  Created
                </Badge>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., Achimenes Bulb"
                  disabled={!!productId}
                  className="text-lg"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">
                  General Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="General info about this product family (shown if variant has no description)"
                  rows={3}
                  disabled={!!productId}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>
                  Categories <span className="text-destructive">*</span>
                </Label>
                {/* <CategorySelector
                  selected={selectedCategories}
                  onChange={setSelectedCategories}
                  disabled={!!productId}
                /> */}

                {/* mock category selector */}
                <div className="flex flex-wrap gap-2">
                  {['Bulbs', 'Perennials', 'Indoor'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setSelectedCategories((prev) =>
                          prev.includes(cat)
                            ? prev.filter((c) => c !== cat)
                            : [...prev, cat],
                        )
                      }
                      disabled={!!productId}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${
                          selectedCategories.includes(cat)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }
                      `}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isCreatingProduct && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating product...
              </div>
            )}
          </div>

          {/* Variants Section */}
          {productId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Product Variants</h3>
                  <p className="text-sm text-muted-foreground">
                    Each variant is a sellable item with its own images and
                    details
                  </p>
                </div>
                <Button onClick={handleAddVariant} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Variant
                </Button>
              </div>

              {variants.length === 0 ? (
                <div className="card-elevated p-12 text-center">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h4 className="font-medium mb-2">No variants yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first variant to start selling this product
                  </p>
                  <Button onClick={handleAddVariant} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Variant
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <VariantCard
                      key={variant.id}
                      variant={variant}
                      index={index + 1}
                      productId={productId}
                      productName={productName}
                      onChange={(updates) =>
                        handleVariantChange(variant.id, updates)
                      }
                      onRemove={() => handleRemoveVariant(variant.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Publish Button */}
          {productId && variants.length > 0 && (
            <div className="flex justify-end gap-3 sticky bottom-6 bg-background/95 backdrop-blur p-4 rounded-lg border shadow-lg">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/products' })}
              >
                Save as Draft
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isPublishing || variants.some((v) => v.isNew)}
                className="btn-primary-gradient gap-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Publish Product
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar - Progress/Tips */}
        <div className="lg:sticky lg:top-6 h-fit space-y-4">
          <div className="card-elevated p-6 space-y-4">
            <h4 className="font-medium">Progress</h4>

            <div className="space-y-3">
              <ProgressItem
                done={!!productId}
                label="Product created"
                description="Basic info saved"
              />
              <ProgressItem
                done={variants.length > 0}
                label="Variants added"
                description={`${variants.length} variant${variants.length !== 1 ? 's' : ''}`}
              />
              <ProgressItem
                done={variants.length > 0 && !variants.some((v) => v.isNew)}
                label="All variants saved"
                description="Ready to publish"
              />
            </div>
          </div>

          <div className="card-elevated p-6 space-y-3">
            <h4 className="font-medium text-sm">💡 Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Each variant needs its own images</li>
              <li>• Add variant-specific descriptions for better SEO</li>
              <li>• Use clear SKU codes (e.g., LOTUS-PINK-001)</li>
              <li>• Set accurate stock levels from the start</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgressItem({ done, label, description }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`
          mt-0.5 flex h-5 w-5 items-center justify-center rounded-full
          ${done ? 'bg-primary text-primary-foreground' : 'bg-muted'}
        `}
      >
        {done && <Check className="h-3 w-3" />}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${done ? '' : 'text-muted-foreground'}`}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}
