'use client'

import React from "react"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface SimpleImageUploaderProps {
  value?: string[]
  onChange?: (urls: string[]) => void
  maxFiles?: number
}

export function SimpleImageUploader({
  value = [],
  onChange,
  maxFiles = 4,
}: SimpleImageUploaderProps) {
  const [images, setImages] = useState<string[]>(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    for (const file of files) {
      if (images.length >= maxFiles) {
        alert(`Maximum ${maxFiles} images allowed`)
        break
      }

      // Convert to base64 for preview
      const reader = new FileReader()
      reader.onload = event => {
        const base64 = event.target?.result as string
        const newImages = [...images, base64]
        setImages(newImages)
        onChange?.(newImages)
      }
      reader.readAsDataURL(file)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onChange?.(newImages)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files)
    const fileInput = fileInputRef.current
    if (fileInput) {
      fileInput.files = e.dataTransfer.files
      handleFileChange({
        target: fileInput,
      } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={images.length >= maxFiles}
          className="hidden"
        />

        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-foreground mb-1">
          Drag images here or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG, GIF up to 10MB ({images.length}/{maxFiles} images)
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 bg-transparent"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxFiles}
        >
          Choose Files
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square group">
              <Image
                src={image || "/placeholder.svg"}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
