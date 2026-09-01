'use client'

import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import type { UserProfile } from '@/types/domain'

export type ClaimRecord = {
  id: string
  type: string
  points: number
  quizId?: string
  matchId?: string
  won?: boolean
  createdAt?: Timestamp
}

export type OnboardingPayload = {
  username: string
  selectedAvatar: string
  learningGoal: string
}

export async function saveOnboarding(uid: string, payload: OnboardingPayload) {
  await setDoc(
    doc(db, 'users', uid),
    {
      username: payload.username,
      selectedAvatar: payload.selectedAvatar,
      learningGoal: payload.learningGoal,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function getProfile(uid: string) {
  const snapshot = await getDoc(doc(db, 'users', uid))
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null
}

export function listenUserClaims(
  uid: string,
  callback: (claims: ClaimRecord[]) => void,
  count = 25,
) {
  return onSnapshot(
    query(collection(db, 'users', uid, 'claims'), orderBy('createdAt', 'desc'), limit(count)),
    (snapshot) => {
      callback(
        snapshot.docs.map((claimSnapshot) => ({
          id: claimSnapshot.id,
          ...claimSnapshot.data(),
        })) as ClaimRecord[],
      )
    },
    (error) => {
      console.warn('listenUserClaims snapshot error:', error)
      callback([])
    },
  )
}
