'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { FullPageLoader } from './full-page-loader'

export function GuestRoute({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, initializing } = useAuth()

  useEffect(() => {
    if (!initializing && user) router.replace('/dashboard')
  }, [initializing, router, user])

  if (initializing || user) return <FullPageLoader label="Checking your session" />
  return children
}
