'use client'

import { useEffect, useMemo, useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { listenMatch } from '@/lib/duel'
import type { DuelMatch } from '@/types/domain'

export function useMatch(matchId: string | null) {
  const [match, setMatch] = useState<DuelMatch | null>(null)
  const [now, setNow] = useState(() => Timestamp.now())

  useEffect(() => {
    setMatch(null)
    if (!matchId) return
    return listenMatch(matchId, setMatch)
  }, [matchId])

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Timestamp.now()), 500)
    return () => window.clearInterval(interval)
  }, [])

  const remainingMs = useMemo(() => {
    if (!match || match.status !== 'active' || !match.lastAdvanceAt) return null
    const elapsed = now.toMillis() - match.lastAdvanceAt.toMillis()
    return Math.max(0, (match.perQuestionMs ?? 15_000) - elapsed)
  }, [match, now])

  return { match, remainingMs }
}
