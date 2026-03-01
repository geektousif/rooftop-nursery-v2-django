import React, { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Image as ImageIcon,
  Package,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { mockCategories } from '@/data/mockData'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { VariantCard } from '@/components/products/steps/VariantCard'

interface Variant {
  id: string
  name: string
  sku: string
  price: string
  mrp: string
  stock: string
  unit: string
  unitValue: string
}

function ProductForm() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Array<string>>(
    [],
  )
  const [tags, setTags] = useState<Array<string>>([])
  const [tagInput, setTagInput] = useState('')
  const [variants, setVariants] = useState<Array<Variant>>([
    {
      id: '1',
      name: 'Default',
      sku: '',
      price: '',
      mrp: '',
      stock: '',
      unit: 'piece',
      unitValue: '1',
    },
  ])
  const [images, setImages] = useState<
    Array<{ id: string; url: string; isPrimary: boolean }>
  >([])
  const [activeTab, setActiveTab] = useState('basic')

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleAddVariant = () => {
    const newVariant: Variant = {
      id: Date.now().toString(),
      name: '',
      sku: '',
      price: '',
      mrp: '',
      stock: '',
      unit: 'piece',
      unitValue: '1',
    }
    setVariants([...variants, newVariant])
  }

  const handleRemoveVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter((v) => v.id !== id))
    }
  }

  const handleVariantChange = (
    variantId: string,
    updates: Partial<Variant>,
  ) => {
    setVariants(
      variants.map((v) => (v.id === variantId ? { ...v, ...updates } : v)),
    )
  }

  // const handleVariantChange = (
  //   id: string,
  //   field: keyof Variant,
  //   value: string,
  // ) => {
  //   setVariants(
  //     variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
  //   )
  // }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const newImage = {
            id: Date.now().toString() + Math.random(),
            url: event.target?.result as string,
            isPrimary: images.length === 0,
          }
          setImages((prev) => [...prev, newImage])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id)
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true
      }
      return updated
    })
  }

  const handleSetPrimaryImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === id })),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Product created',
      description: 'Your product has been created successfully.',
    })
    navigate('/products')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Product"
        description="Create a new product listing"
      >
        <Button
          variant="outline"
          onClick={() => navigate('/products')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Tab */}

        <div className="card-elevated p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
                rows={4}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Categories *</Label>
              <div className="flex flex-wrap gap-2">
                {mockCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryToggle(category.name)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedCategories.includes(category.name)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card-elevated overflow-hidden">
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
                    // productId={productId}
                    // productName={productName}
                    onChange={(updates) =>
                      handleVariantChange(variant.id, updates)
                    }
                    onRemove={() => handleRemoveVariant(variant.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="space-y-4">
            <Label>Product Images</Label>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-foreground font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG, WEBP up to 5MB each
                </p>
              </label>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative group rounded-xl overflow-hidden border-2 transition-colors ${
                      image.isPrimary ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt="Product"
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetPrimaryImage(image.id)}
                        disabled={image.isPrimary}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-primary">Primary</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/products')}
          >
            Cancel
          </Button>
          <Button type="submit" className="btn-primary-gradient">
            Create Product
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm
