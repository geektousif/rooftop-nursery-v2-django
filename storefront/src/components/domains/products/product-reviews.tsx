"use client"

import { useState } from "react"
import { ThumbsUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockReviews } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [sortBy, setSortBy] = useState<"helpful" | "recent" | "rating">("helpful")

  const productReviews = mockReviews
    .filter((review) => review.productId === productId)
    .sort((a, b) => {
      if (sortBy === "helpful") return b.helpfulCount - a.helpfulCount
      if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return b.rating - a.rating
    })

  const avgRating = productReviews.length > 0
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>See what other customers think about this product</CardDescription>
          </div>
          <Button onClick={() => setShowReviewForm(!showReviewForm)} variant={showReviewForm ? "default" : "outline"}>
            {showReviewForm ? "Close" : "Write a Review"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showReviewForm && (
          <div className="p-4 bg-muted rounded-lg border border-border space-y-4">
            <h4 className="font-semibold">Share Your Experience</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="text-2xl hover:text-primary transition-colors"
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="title" className="text-sm font-medium mb-2 block">
                  Review Title
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Summarize your experience"
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="comment" className="text-sm font-medium mb-2 block">
                  Your Review
                </label>
                <textarea
                  id="comment"
                  placeholder="Tell us what you think..."
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowReviewForm(false)}>Submit Review</Button>
                <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{avgRating}</span>
              <span className="text-muted-foreground">out of 5</span>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${
                    i < Math.floor(Number(avgRating))
                      ? "text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{productReviews.length} reviews</p>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "helpful" | "recent" | "rating")}
            className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="helpful">Most Helpful</option>
            <option value="recent">Most Recent</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <div className="space-y-4">
          {productReviews.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            productReviews.map((review) => (
              <div key={review.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{review.title}</p>
                    <p className="text-sm text-muted-foreground">by {review.userName}</p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < review.rating
                            ? "text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm mb-3">{review.comment}</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs gap-1"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    Helpful ({review.helpfulCount})
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
