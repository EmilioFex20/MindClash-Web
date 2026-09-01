'use client'

import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import type { UserProfile } from '@/types/domain'

export type LeaderboardEntry = UserProfile & { uid: string }

export function listenGlobalLeaderboard(callback: (entries: LeaderboardEntry[]) => void, count = 25) {
  return onSnapshot(
    query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(count)),
    (snapshot) => {
      callback(
        snapshot.docs.map(
          (userSnapshot) =>
            ({ uid: userSnapshot.id, ...userSnapshot.data() }) as LeaderboardEntry,
        ),
      )
    },
    (error) => {
      console.warn('listenGlobalLeaderboard snapshot error:', error)
      callback([])
    },
  )
}
