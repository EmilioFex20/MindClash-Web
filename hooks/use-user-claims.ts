'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { listenUserClaims, type ClaimRecord } from '@/lib/users'

export function useUserClaims(count = 25) {
  const { user } = useAuth()
  const [claims, setClaims] = useState<ClaimRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setClaims([])
      setLoading(false)
      return
    }

    setLoading(true)
    return listenUserClaims(
      user.uid,
      (records) => {
        setClaims(records)
        setLoading(false)
      },
      count,
    )
  }, [user, count])

  return { claims, loading }
}
