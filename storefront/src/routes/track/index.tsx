'use client'

import { Suspense } from 'react'
import { TrackingContent } from '@/components/domains/user-account/tracking-content'
import Loading from './-loading'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/track/')({
  validateSearch: (order: string) => {
    return order
  },
  component: TrackingPage,
})

export default function TrackingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TrackingContent />
    </Suspense>
  )
}
