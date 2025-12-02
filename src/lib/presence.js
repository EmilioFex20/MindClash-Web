// src/lib/presence.js
import { db } from '@/firebase/config'
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore'

export function onlineUsersQuery(withinSeconds = 30) {
  const cutoff = Timestamp.fromMillis(Date.now() - withinSeconds * 1000)
  return query(collection(db, 'users'), where('lastSeen', '>', cutoff), orderBy('lastSeen', 'desc'))
}
