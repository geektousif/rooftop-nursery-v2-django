// components/products/steps/ImagesStep.tsx

import { useState } from 'react'
import { Image as ImageIcon, Loader2, Star, Trash2, Upload } from 'lucide-react'
import { Image as IKUpload } from '@imagekit/react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

export function ImagesStep({ data: images, onChange, productId }) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)

  const onSuccess = (res) => {
    const newImage = {
      id: res.fileId,
      url: res.url,
      thumbnail: res.thumbnailUrl,
      fileId: res.fileId, // ImageKit file ID for deletion
      isPrimary: images.length === 0,
      usedByVariants: [], // Track which variants use this image
    }

    onChange([...images, newImage])

    toast({
      title: 'Image uploaded',
      description: 'Image added to product pool',
    })

    setUploading(false)
  }

  const handleRemoveImage = async (imageId: string) => {
    const image = images.find((img) => img.id === imageId)

    // Check if image is used by variants
    if (image.usedByVariants && image.usedByVariants.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot delete',
        description: `This image is used by ${image.usedByVariants.length} variant(s)`,
      })
      return
    }

    // Delete from ImageKit
    try {
      await fetch(`/api/imagekit/delete/${image.fileId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Failed to delete from ImageKit:', error)
    }

    const updatedImages = images.filter((img) => img.id !== imageId)

    // If removed image was primary, make first image primary
    if (
      updatedImages.length > 0 &&
      !updatedImages.some((img) => img.isPrimary)
    ) {
      updatedImages[0].isPrimary = true
    }

    onChange(updatedImages)

    toast({
      title: 'Image removed',
      description: 'Image deleted from product pool',
    })
  }

  const handleSetPrimary = (imageId: string) => {
    onChange(
      images.map((img) => ({
        ...img,
        isPrimary: img.id === imageId,
      })),
    )
  }

  return (
    <div className="card-elevated p-6 space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Product Image Pool:</strong> Upload all product images here.
          When creating variants, you can select which images to use for each
          variant.
        </p>
      </div>

      {/* Upload Area */}
      <div>
        <Label className="mb-4 block">Upload Images</Label>

        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
          <IKUpload
            fileName={`product-${productId}-${Date.now()}.jpg`}
            folder={`/products/${productId}`}
            tags={[productId, 'product-image']}
            useUniqueFileName={true}
            isPrivateFile={false}
            onError={(err) => {
              toast({
                variant: 'destructive',
                title: 'Upload failed',
                description: err.message,
              })
              setUploading(false)
            }}
            onSuccess={onSuccess}
            onUploadStart={() => setUploading(true)}
            className="hidden"
            id="image-upload"
          />

          <label htmlFor="image-upload" className="cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="h-12 w-12 mx-auto text-primary mb-4 animate-spin" />
                <p className="text-foreground font-medium">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-foreground font-medium">
                  Click to upload images
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG, WEBP up to 5MB each
                </p>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {images.length} image{images.length !== 1 ? 's' : ''} in pool
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`
                  relative group rounded-xl overflow-hidden border-2 transition-all
                  ${image.isPrimary ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
                `}
              >
                <img
                  src={image.thumbnail || image.url}
                  alt="Product"
                  className="w-full aspect-square object-cover"
                />

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetPrimary(image.id)}
                    disabled={image.isPrimary}
                    title="Set as primary (default thumbnail)"
                  >
                    <Star
                      className={`h-4 w-4 ${image.isPrimary ? 'fill-current' : ''}`}
                    />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveImage(image.id)}
                    title="Delete image"
                    disabled={image.usedByVariants?.length > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-primary shadow-lg">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Primary
                    </Badge>
                  </div>
                )}

                {/* Usage Badge */}
                {image.usedByVariants && image.usedByVariants.length > 0 && (
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="shadow-lg">
                      {image.usedByVariants.length} variant
                      {image.usedByVariants.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
