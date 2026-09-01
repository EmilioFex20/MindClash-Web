'use client'

import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { useAuth } from '@/components/auth/auth-provider'
import { db } from '@/lib/firebase/client'
import type { UserProfile } from '@/types/domain'

export function useUserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    return onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        setProfile(snapshot.exists() ? (snapshot.data() as UserProfile) : null)
        setLoading(false)
      },
      (snapshotError) => {
        console.error('useUserProfile snapshot error:', snapshotError)
        setError(snapshotError.message || 'Error loading profile')
        setLoading(false)
      },
    )
  }, [user])

  return { profile, loading, error }
}
