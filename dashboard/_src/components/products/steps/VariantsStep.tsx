// components/products/steps/VariantsStep.tsx

import { useState } from 'react'
import { Check, Copy, ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react'
import { Image } from '@imagekit/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function VariantsStep({
  data: variants,
  onChange,
  productId,
  productImages, // Pass product images from parent
  onUpdateProductImages, // Callback to update product images usage tracking
}) {
  const { toast } = useToast()
  const [creating, setCreating] = useState(false)
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null)

  const handleAddVariant = async () => {
    const newVariant = {
      id: `temp-${Date.now()}`,
      name: '',
      sku: '',
      description: '',
      price: '',
      mrp: '',
      stock: '',
      unit: 'piece',
      unitValue: '1',
      weight_grams: '',
      variant_attributes: {},
      images: [], // Array of image IDs from product pool + variant-specific uploads
      variantSpecificImages: [], // Images uploaded specifically for this variant
      isNew: true,
    }

    onChange([...variants, newVariant])
    setExpandedVariant(newVariant.id)
  }

  const handleSaveVariant = async (variant) => {
    setCreating(true)

    try {
      const response = await fetch(
        `/api/v1/vendor/products/${productId}/variants/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: variant.name,
            sku: variant.sku,
            description: variant.description,
            price: parseFloat(variant.price),
            mrp: parseFloat(variant.mrp),
            stock: parseInt(variant.stock),
            unit: variant.unit,
            unit_value: parseFloat(variant.unitValue),
            weight_grams: variant.weight_grams
              ? parseInt(variant.weight_grams)
              : null,
            variant_attributes: variant.variant_attributes,
            images: [...variant.images, ...variant.variantSpecificImages], // Combine all image URLs
          }),
        },
      )

      const savedVariant = await response.json()

      // Update product images usage tracking
      updateImageUsage(variant.images, savedVariant.name)

      onChange(
        variants.map((v) =>
          v.id === variant.id ? { ...savedVariant, isNew: false } : v,
        ),
      )

      toast({
        title: 'Variant saved',
        description: `${variant.name} has been created`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    } finally {
      setCreating(false)
    }
  }

  const updateImageUsage = (imageIds: Array<string>, variantName: string) => {
    // Update which variants use which images
    const updatedImages = productImages.map((img) => {
      if (imageIds.includes(img.id)) {
        return {
          ...img,
          usedByVariants: [...(img.usedByVariants || []), variantName],
        }
      }
      return img
    })
    onUpdateProductImages(updatedImages)
  }

  const handleVariantChange = (variantId, field, value) => {
    onChange(
      variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v)),
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Product Variants</h3>
          <p className="text-sm text-muted-foreground">
            Add variants and assign images to each
          </p>
        </div>
        <Button onClick={handleAddVariant} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {/* Variants List */}
      {variants.length > 0 ? (
        <Accordion
          type="single"
          collapsible
          value={expandedVariant}
          onValueChange={setExpandedVariant}
          className="space-y-3"
        >
          {variants.map((variant) => (
            <AccordionItem
              key={variant.id}
              value={variant.id}
              className="card-elevated border-0"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    {/* Variant Thumbnail */}
                    {variant.images && variant.images.length > 0 && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border">
                        <img
                          src={
                            productImages.find(
                              (img) => img.id === variant.images[0],
                            )?.thumbnail ||
                            variant.variantSpecificImages[0]?.thumbnail
                          }
                          alt={variant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="text-left">
                      <p className="font-medium">
                        {variant.name || 'Unnamed Variant'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {variant.sku || 'Not set'} • Stock:{' '}
                        {variant.stock || 0} • Images:{' '}
                        {(variant.images?.length || 0) +
                          (variant.variantSpecificImages?.length || 0)}
                      </p>
                    </div>
                    {variant.isNew && (
                      <Badge variant="outline" className="text-xs">
                        Unsaved
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{variant.price || '0'}</p>
                    {variant.mrp && variant.mrp > variant.price && (
                      <p className="text-sm text-muted-foreground line-through">
                        ₹{variant.mrp}
                      </p>
                    )}
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-6 pb-6">
                <VariantForm
                  variant={variant}
                  productImages={productImages}
                  productId={productId}
                  onChange={(field, value) =>
                    handleVariantChange(variant.id, field, value)
                  }
                  onSave={() => handleSaveVariant(variant)}
                  onDelete={() => {
                    onChange(variants.filter((v) => v.id !== variant.id))
                  }}
                  creating={creating}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="card-elevated p-12 text-center">
          <p className="text-muted-foreground mb-4">No variants added yet.</p>
          <Button onClick={handleAddVariant} className="gap-2">
            <Plus className="h-4 w-4" />
            Add First Variant
          </Button>
        </div>
      )}
    </div>
  )
}

// Variant Form Component
function VariantForm({
  variant,
  productImages,
  productId,
  onChange,
  onSave,
  onDelete,
  creating,
}) {
  const { toast } = useToast()
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [uploadingVariantImage, setUploadingVariantImage] = useState(false)

  const handleToggleProductImage = (imageId: string) => {
    const currentImages = variant.images || []
    const newImages = currentImages.includes(imageId)
      ? currentImages.filter((id) => id !== imageId)
      : [...currentImages, imageId]

    onChange('images', newImages)
  }

  const handleVariantImageUpload = (res) => {
    const newImage = {
      id: res.fileId,
      url: res.url,
      thumbnail: res.thumbnailUrl,
      fileId: res.fileId,
    }

    const currentVariantImages = variant.variantSpecificImages || []
    onChange('variantSpecificImages', [...currentVariantImages, newImage])

    toast({
      title: 'Image uploaded',
      description: 'Variant-specific image added',
    })

    setUploadingVariantImage(false)
  }

  const handleRemoveVariantImage = (imageId: string) => {
    const updatedImages = variant.variantSpecificImages.filter(
      (img) => img.id !== imageId,
    )
    onChange('variantSpecificImages', updatedImages)
  }

  const totalImages =
    (variant.images?.length || 0) + (variant.variantSpecificImages?.length || 0)

  return (
    <div className="space-y-6 pt-4">
      {/* Basic Fields (same as before) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ... Name, SKU, Price, MRP, Stock, Unit fields ... */}
      </div>

      {/* IMAGE MANAGEMENT SECTION */}
      <div className="border-t pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Variant Images</Label>
            <p className="text-sm text-muted-foreground">
              Select from product pool or upload variant-specific images
            </p>
          </div>
          <Badge variant="outline">
            {totalImages} image{totalImages !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Selected Images Preview */}
        {totalImages > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {/* Images from product pool */}
            {variant.images?.map((imageId) => {
              const image = productImages.find((img) => img.id === imageId)
              if (!image) return null

              return (
                <div
                  key={imageId}
                  className="relative group rounded-lg overflow-hidden border-2 border-primary"
                >
                  <img
                    src={image.thumbnail || image.url}
                    alt="Variant"
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleToggleProductImage(imageId)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      Pool
                    </Badge>
                  </div>
                </div>
              )
            })}

            {/* Variant-specific images */}
            {variant.variantSpecificImages?.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden border-2 border-blue-500"
              >
                <img
                  src={image.thumbnail || image.url}
                  alt="Variant specific"
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveVariantImage(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge className="bg-blue-500 text-xs">Variant</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Management Actions */}
        <div className="flex gap-2">
          {/* Select from Product Pool */}
          <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="gap-2 flex-1">
                <ImageIcon className="h-4 w-4" />
                Select from Pool ({productImages.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Select Images from Product Pool</DialogTitle>
                <DialogDescription>
                  Choose images to display for this variant. You can select
                  multiple images.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                {productImages.map((image) => {
                  const isSelected = variant.images?.includes(image.id)

                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => handleToggleProductImage(image.id)}
                      className={`
                        relative rounded-lg overflow-hidden border-2 transition-all
                        ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}
                      `}
                    >
                      <img
                        src={image.thumbnail || image.url}
                        alt="Product"
                        className="w-full aspect-square object-cover"
                      />

                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-2">
                            <Check className="h-6 w-6" />
                          </div>
                        </div>
                      )}

                      {image.isPrimary && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary text-xs">Primary</Badge>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {variant.images?.length || 0} image
                  {variant.images?.length !== 1 ? 's' : ''} selected
                </p>
                <Button onClick={() => setImageDialogOpen(false)}>Done</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Upload Variant-Specific Image */}
          <div className="flex-1">
            <Image
              fileName={`variant-${variant.id}-${Date.now()}.jpg`}
              folder={`/products/${productId}/variants`}
              tags={[productId, variant.id, 'variant-image']}
              useUniqueFileName={true}
              isPrivateFile={false}
              onError={(err) => {
                toast({
                  variant: 'destructive',
                  title: 'Upload failed',
                  description: err.message,
                })
                setUploadingVariantImage(false)
              }}
              onSuccess={handleVariantImageUpload}
              onUploadStart={() => setUploadingVariantImage(true)}
              className="hidden"
              id={`variant-image-upload-${variant.id}`}
            />

            <label htmlFor={`variant-image-upload-${variant.id}`}>
              <Button
                type="button"
                variant="outline"
                className="gap-2 w-full"
                disabled={uploadingVariantImage}
                asChild
              >
                <span>
                  {uploadingVariantImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Upload Variant Image
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </div>

        {/* Image Tips */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong> Use{' '}
            <Badge variant="secondary" className="text-xs mx-1">
              Pool
            </Badge>
            for images shared across variants. Use{' '}
            <Badge className="bg-blue-500 text-xs mx-1">Variant</Badge>
            for color/size-specific images (e.g., Pink flower, Blue flower).
          </p>
        </div>
      </div>

      {/* Variant Description */}
      <div className="space-y-2">
        <Label htmlFor={`desc-${variant.id}`}>
          Variant Description (Optional)
        </Label>
        <Textarea
          id={`desc-${variant.id}`}
          value={variant.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Pink Achimenes produces vibrant pink flowers with yellow center..."
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Specific description for this variant. Leave empty to use product
          description.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onDelete}
          className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-4 w-4" />
          Delete Variant
        </Button>

        {variant.isNew && (
          <Button
            onClick={onSave}
            disabled={
              creating ||
              !variant.name ||
              !variant.sku ||
              !variant.price ||
              totalImages === 0
            }
            className="gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Variant'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
