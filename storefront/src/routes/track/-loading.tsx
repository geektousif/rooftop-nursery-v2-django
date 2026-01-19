import { Navbar } from '@/components/common/navbar'
import { Footer } from '@/components/common/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Search Form Skeleton */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex gap-2">
                <Skeleton className="flex-1 h-10" />
                <Skeleton className="w-20 h-10" />
              </div>
            </CardContent>
          </Card>

          {/* Tracking Info Skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
