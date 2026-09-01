'use client'

import { collection, orderBy, query, Timestamp, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

export function onlineUsersQuery(withinSeconds = 30) {
  const cutoff = Timestamp.fromMillis(Date.now() - withinSeconds * 1000)
  return query(collection(db, 'users'), where('lastSeen', '>', cutoff), orderBy('lastSeen', 'desc'))
}
