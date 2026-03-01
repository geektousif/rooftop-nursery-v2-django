// components/products/steps/BasicInfoStep.tsx

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function BasicInfoStep({ data, onChange }) {
  const [categories, setCategories] = useState([])
  const [tagInput, setTagInput] = useState('')

  // Fetch categories
  useEffect(() => {
    fetch('/api/v1/public/categories/')
      .then((res) => res.json())
      .then(setCategories)
  }, [])

  const handleAddTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      onChange({ ...data, tags: [...data.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    onChange({ ...data, tags: data.tags.filter((t) => t !== tag) })
  }

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = data.categories.includes(categoryId)
      ? data.categories.filter((c) => c !== categoryId)
      : [...data.categories, categoryId]

    onChange({ ...data, categories: newCategories })
  }

  return (
    <div className="card-elevated p-6 space-y-6">
      <div className="space-y-6">
        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Product Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="e.g., Lotus Bulb"
            className="text-lg"
            autoFocus
          />
          <p className="text-sm text-muted-foreground">
            Keep it short and descriptive. You'll add variant names later.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Product Description</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Describe your product. This is the base description shown for all variants. You can add variant-specific descriptions later."
            rows={6}
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground">
            General information about the product family (e.g., care
            instructions, benefits)
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <Label>
            Categories <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryToggle(category.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    data.categories.includes(category.id)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                {category.name}
              </button>
            ))}
          </div>
          {data.categories.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Select at least one category
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags (Optional)</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tags (e.g., indoor, flowering)"
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
          {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {data.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 px-3 py-1"
                >
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
  )
}
