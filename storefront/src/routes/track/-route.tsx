'use client'

import { createFileRoute, Outlet } from '@tanstack/react-router'
import React from 'react'

import { Suspense } from 'react'

export const Route = createFileRoute('/track')({
  component: TrackingLayout,
})

export default function TrackingLayout() {
  return (
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  )
}
