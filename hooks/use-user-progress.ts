'use client'

import { useEffect, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { useAuth } from '@/components/auth/auth-provider'
import { db } from '@/lib/firebase/client'
import type { UserProgress } from '@/types/domain'

export const DEFAULT_PROGRESS: UserProgress = {
  totalXp: 0,
  quizzesCompleted: 0,
  programmingProgress: 0,
  algorithmsProgress: 0,
  databasesProgress: 0,
  networkingProgress: 0,
  aiProgress: 0,
  securityProgress: 0,
}

export function useUserProgress() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<UserProgress>({ ...DEFAULT_PROGRESS })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setProgress({ ...DEFAULT_PROGRESS })
      setLoading(false)
      return
    }

    let initialized = false
    setLoading(true)
    setError(null)
    const progressRef = doc(db, 'users', user.uid, 'meta', 'progress')

    return onSnapshot(
      progressRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          if (!initialized) {
            initialized = true
            try {
              await setDoc(
                progressRef,
                { ...DEFAULT_PROGRESS, updatedAt: serverTimestamp() },
                { merge: true },
              )
            } catch (initializationError) {
              console.warn('Failed to initialize progress document:', initializationError)
            }
          }
          setProgress({ ...DEFAULT_PROGRESS })
          setLoading(false)
          return
        }

        setProgress({ ...DEFAULT_PROGRESS, ...snapshot.data() } as UserProgress)
        setLoading(false)
      },
      (snapshotError) => {
        console.error('useUserProgress snapshot error:', snapshotError)
        setError(snapshotError.message || 'Error loading progress')
        setLoading(false)
      },
    )
  }, [user])

  return { progress, loading, error }
}
