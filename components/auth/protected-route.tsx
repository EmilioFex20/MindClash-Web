'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { FullPageLoader } from './full-page-loader'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, initializing } = useAuth()

  useEffect(() => {
    if (!initializing && !user) {
      const requestedPath = `${window.location.pathname}${window.location.search}`
      router.replace(`/register?redirect=${encodeURIComponent(requestedPath)}`)
    }
  }, [initializing, router, user])

  if (initializing || !user) return <FullPageLoader label="Restoring your session" />
  return children
}
