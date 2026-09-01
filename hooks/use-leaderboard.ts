'use client'

import { useEffect, useState } from 'react'
import { listenGlobalLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard'

export function useGlobalLeaderboard(count = 25) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    return listenGlobalLeaderboard((records) => {
      setEntries(records)
      setLoading(false)
    }, count)
  }, [count])

  return { entries, loading }
}
