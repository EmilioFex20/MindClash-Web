'use client'

import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type Query,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { createWaitingMatchForInvite, joinOpenMatch } from '@/lib/duel'

export type InviteDoc = {
  fromUid: string
  matchId: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
}

export type IncomingInvite = {
  id: string
  fromUid: string
  matchId: string
}

export async function sendInvite({
  fromUid,
  toUid,
  questionIds,
  perQuestionMs,
}: {
  fromUid: string
  toUid: string
  questionIds: string[]
  perQuestionMs: number
}) {
  const matchId = await createWaitingMatchForInvite(fromUid, questionIds, perQuestionMs)
  const inviteRef = await addDoc(collection(db, 'users', toUid, 'invites'), {
    fromUid,
    matchId,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
  return { inviteId: inviteRef.id, matchId }
}

export function listenIncomingInvites(
  toUid: string,
  callback: (invites: IncomingInvite[]) => void,
) {
  const baseQuery = query(
    collection(db, 'users', toUid, 'invites'),
    where('status', '==', 'pending'),
  )
  const orderedQuery = query(baseQuery, orderBy('createdAt', 'desc'), limit(10))
  const fallbackQuery = query(baseQuery, limit(10))
  let unsubscribe: Unsubscribe | null = null
  let usingFallback = false

  const attach = (inviteQuery: Query<DocumentData>) =>
    onSnapshot(
      inviteQuery,
      (snapshot) => {
        callback(
          snapshot.docs
            .map((inviteSnapshot) => {
              const invite = inviteSnapshot.data() as Partial<InviteDoc>
              return {
                id: inviteSnapshot.id,
                fromUid: String(invite.fromUid ?? ''),
                matchId: String(invite.matchId ?? ''),
              }
            })
            .filter((invite) => invite.id && invite.fromUid && invite.matchId),
        )
      },
      (error) => {
        const looksLikeMissingIndex =
          error.code === 'failed-precondition' || error.message.toLowerCase().includes('index')
        if (!usingFallback && looksLikeMissingIndex) {
          usingFallback = true
          unsubscribe?.()
          unsubscribe = attach(fallbackQuery)
          return
        }
        console.warn('[Invites] onSnapshot error:', error)
        callback([])
      },
    )

  unsubscribe = attach(orderedQuery)
  return () => {
    unsubscribe?.()
    unsubscribe = null
  }
}

export async function acceptInvite({ toUid, inviteId }: { toUid: string; inviteId: string }) {
  const inviteRef = doc(db, 'users', toUid, 'invites', inviteId)
  const snapshot = await getDoc(inviteRef)
  if (!snapshot.exists()) throw new Error('Invite not found')
  const invite = snapshot.data() as InviteDoc
  if (invite.status !== 'pending') throw new Error('Invite not pending')
  if (!invite.matchId) throw new Error('Invite missing matchId')

  const joined = await joinOpenMatch(invite.matchId, toUid)
  if (!joined) {
    await setDoc(
      inviteRef,
      { status: 'expired', updatedAt: serverTimestamp() },
      { merge: true },
    )
    throw new Error('Invite expired')
  }

  await setDoc(
    inviteRef,
    { status: 'accepted', acceptedAt: serverTimestamp() },
    { merge: true },
  )
  return invite.matchId
}

export async function declineInvite({ toUid, inviteId }: { toUid: string; inviteId: string }) {
  await updateDoc(doc(db, 'users', toUid, 'invites', inviteId), {
    status: 'declined',
    updatedAt: serverTimestamp(),
  })
}
