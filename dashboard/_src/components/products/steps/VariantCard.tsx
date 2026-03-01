// components/products/VariantCard.tsx

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { Image as IKUpload } from '@imagekit/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface VariantCardProps {
  variant: any
  index: number
  // productId: string
  // productName: string
  onChange: (updates: Partial<any>) => void
  onRemove: () => void
}

export function VariantCard({
  variant,
  index,
  // productId,
  // productName,
  onChange,
  onRemove,
}: VariantCardProps) {
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(variant.isExpanded || false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const isComplete =
    variant.name && variant.sku && variant.price && variant.images?.length > 0

  const handleSave = async () => {
    // Validate
    if (!variant.name || !variant.sku || !variant.price) {
      toast({
        variant: 'destructive',
        title: 'Missing required fields',
        description: 'Name, SKU, and Price are required',
      })
      return
    }

    if (variant.images?.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No images',
        description: 'Add at least one image for this variant',
      })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/v1/vendor/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: variant.name,
          sku: variant.sku,
          description: variant.description,
          price: parseFloat(variant.price),
          mrp: variant.mrp ? parseFloat(variant.mrp) : null,
          stock: parseInt(variant.stock) || 0,
          unit: variant.unit,
          unit_value: parseFloat(variant.unitValue),
          weight_grams: variant.weight_grams
            ? parseInt(variant.weight_grams)
            : null,
          images: variant.images,
          variant_attributes: variant.variant_attributes,
        }),
      })

      const savedVariant = await response.json()

      onChange({
        ...savedVariant,
        isNew: false,
        isExpanded: false,
      })

      setIsExpanded(false)

      toast({
        title: 'Variant saved',
        description: `${variant.name} has been created`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error saving variant',
        description: error.message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (res) => {
    const newImage = {
      id: res.fileId,
      url: res.url,
      thumbnail: res.thumbnailUrl,
    }

    onChange({
      images: [...variant.images, newImage],
    })

    toast({
      title: 'Image uploaded',
      description: 'Image added to variant',
    })

    setUploadingImage(false)
  }

  const handleRemoveImage = (imageId: string) => {
    onChange({
      images: variant.images?.filter((img) => img.id !== imageId),
    })
  }

  return (
    <div className="card-elevated overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Variant Thumbnail */}
          {variant.images?.length > 0 ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-border">
              <img
                src={variant.images?.[0].thumbnail || variant.images?.[0].url}
                alt={variant.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}

          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                #{index}
              </span>
              <h4 className="font-medium">
                {variant.name || 'Unnamed Variant'}
              </h4>
              {variant.isNew && (
                <Badge variant="outline" className="text-xs">
                  Unsaved
                </Badge>
              )}
              {!variant.isNew && (
                <Badge className="bg-green-500 text-xs">Saved</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {variant.sku ? `SKU: ${variant.sku}` : 'No SKU'} •
              {variant.price ? ` ₹${variant.price}` : ' No price'} •
              {variant.images?.length} image
              {variant.images?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isComplete && variant.isNew && (
            <Badge variant="secondary" className="text-xs">
              Ready to save
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6 border-t">
          <div className="pt-6 space-y-6">
            {/* Images Section - FIRST! */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>
                  Variant Images <span className="text-destructive">*</span>
                </Label>
                <Badge variant="outline">
                  {variant.images?.length} image
                  {variant.images?.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            {/* Image Upload */}
            {/* <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <IKUpload
                  fileName={`variant-${productId}-${Date.now()}.jpg`}
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
                    setUploadingImage(false)
                  }}
                  onSuccess={handleImageUpload}
                  onUploadStart={() => setUploadingImage(true)}
                  className="hidden"
                  id={`variant-image-${variant.id}`}
                />

                <label
                  htmlFor={`variant-image-${variant.id}`}
                  className="cursor-pointer"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-8 w-8 mx-auto text-primary mb-2 animate-spin" />
                      <p className="text-sm text-foreground font-medium">
                        Uploading...
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-foreground font-medium">
                        Click to upload images
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </>
                  )}
                </label>
              </div>

              {/* Image Grid 
              {variant.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {variant.images.map((image, idx) => (
                    <div
                      key={image.id}
                      className="relative group rounded-lg overflow-hidden border-2 border-border"
                    >
                      <img
                        src={image.thumbnail || image.url}
                        alt={`Variant ${idx + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {idx === 0 && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary text-xs">Primary</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div> */}

            {/* Variant Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`name-${variant.id}`}>
                  Variant Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`name-${variant.id}`}
                  value={variant.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  placeholder="e.g., Pink, Small, 100g"
                />
                {/* <p className="text-xs text-muted-foreground">
                  Will show as: {productName} - {variant.name || '...'}
                </p> */}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`sku-${variant.id}`}>
                  SKU <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`sku-${variant.id}`}
                  value={variant.sku}
                  onChange={(e) => onChange({ sku: e.target.value })}
                  placeholder="ACHIM-PINK-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`price-${variant.id}`}>
                  Price (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`price-${variant.id}`}
                  type="number"
                  step="0.01"
                  value={variant.price}
                  onChange={(e) => onChange({ price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`mrp-${variant.id}`}>MRP (₹)</Label>
                <Input
                  id={`mrp-${variant.id}`}
                  type="number"
                  step="0.01"
                  value={variant.mrp}
                  onChange={(e) => onChange({ mrp: e.target.value })}
                  placeholder="0.00"
                />
                {variant.mrp &&
                  variant.price &&
                  parseFloat(variant.mrp) > parseFloat(variant.price) && (
                    <p className="text-xs text-green-600">
                      {Math.round(
                        ((parseFloat(variant.mrp) - parseFloat(variant.price)) /
                          parseFloat(variant.mrp)) *
                          100,
                      )}
                      % off
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`stock-${variant.id}`}>Stock</Label>
                <Input
                  id={`stock-${variant.id}`}
                  type="number"
                  value={variant.stock}
                  onChange={(e) => onChange({ stock: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Unit</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={variant.unitValue}
                    onChange={(e) => onChange({ unitValue: e.target.value })}
                    placeholder="1"
                    className="w-20"
                  />
                  <Select
                    value={variant.unit}
                    onValueChange={(value) => onChange({ unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="bulb">Bulb</SelectItem>
                      <SelectItem value="pot">Pot</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="gram">Gram</SelectItem>
                      <SelectItem value="packet">Packet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor={`desc-${variant.id}`}>
                  Variant Description
                </Label>
                <Textarea
                  id={`desc-${variant.id}`}
                  value={variant.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  placeholder="Pink Achimenes produces vibrant pink flowers..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use product description
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={onRemove}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete Variant
              </Button>

              {variant.isNew && (
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !isComplete}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Variant
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
