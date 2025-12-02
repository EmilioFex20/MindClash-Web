// src/lib/invites.ts
import { db } from '@/firebase/config'
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
  type Query,
  type Unsubscribe,
} from 'firebase/firestore'

import { createWaitingMatchForInvite, joinOpenMatch } from './duel'

export type InviteDoc = {
  fromUid: string
  matchId: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt?: any
  acceptedAt?: any
  updatedAt?: any
}

export type IncomingInvite = {
  id: string
  fromUid: string
  matchId: string
}

export async function sendInvite(opts: {
  fromUid: string
  toUid: string
  questionIds: string[]
  perQuestionMs: number
}) {
  const { fromUid, toUid, questionIds, perQuestionMs } = opts

  // 1) host creates a WAITING match
  const matchId = await createWaitingMatchForInvite(fromUid, questionIds, perQuestionMs)

  // 2) write invite under recipient: users/{toUid}/invites/{autoId}
  const invitesCol = collection(db, 'users', String(toUid), 'invites')
  const ref = await addDoc(invitesCol, {
    fromUid,
    matchId,
    status: 'pending',
    createdAt: serverTimestamp(),
  } satisfies InviteDoc)

  return { inviteId: ref.id, matchId }
}

/**
 * Subscribe to incoming pending invites.
 * Includes fallback if missing index on (status + createdAt desc).
 */
export function listenIncomingInvites(toUid: string, cb: (invites: IncomingInvite[]) => void) {
  const base = query(
    collection(db, 'users', String(toUid), 'invites'),
    where('status', '==', 'pending'),
  )

  const withOrder = query(base, orderBy('createdAt', 'desc'), limit(10))
  const noOrder = query(base, limit(10))

  let activeUnsub: Unsubscribe | null = null
  let usingFallback = false

  const attach = (q: Query) =>
    onSnapshot(
      q,
      (snap) => {
        const out: IncomingInvite[] = (snap.docs || [])
          .map((d) => {
            const x = d.data() as any
            return {
              id: d.id,
              fromUid: String(x?.fromUid ?? ''),
              matchId: String(x?.matchId ?? ''),
            }
          })
          .filter((v) => v.id && v.fromUid && v.matchId)

        cb(out)
      },
      (err: any) => {
        console.warn('[Invites] onSnapshot error:', err?.code, err?.message)

        // Missing index commonly appears as failed-precondition and message mentions index
        const looksLikeIndex =
          err?.code === 'failed-precondition' ||
          String(err?.message || '')
            .toLowerCase()
            .includes('index')

        if (!usingFallback && looksLikeIndex) {
          usingFallback = true
          if (activeUnsub) activeUnsub()
          activeUnsub = attach(noOrder)
          return
        }

        cb([])
      },
    )

  activeUnsub = attach(withOrder)

  return () => {
    if (activeUnsub) activeUnsub()
    activeUnsub = null
  }
}

/**
 * Accept: read invite -> try join the waiting match -> update invite status
 */
export async function acceptInvite(opts: { toUid: string; inviteId: string }) {
  const { toUid, inviteId } = opts

  const invRef = doc(db, 'users', String(toUid), 'invites', String(inviteId))
  const invSnap = await getDoc(invRef)
  if (!invSnap.exists()) throw new Error('Invite not found')

  const inv = invSnap.data() as any
  if (inv.status !== 'pending') throw new Error('Invite not pending')

  const matchId = String(inv.matchId || '')
  if (!matchId) throw new Error('Invite missing matchId')

  const ok = await joinOpenMatch(matchId, String(toUid))

  if (!ok) {
    await setDoc(
      invRef,
      { status: 'expired', updatedAt: serverTimestamp() } satisfies Partial<InviteDoc>,
      { merge: true },
    )
    throw new Error('Invite expired')
  }

  await setDoc(
    invRef,
    { status: 'accepted', acceptedAt: serverTimestamp() } satisfies Partial<InviteDoc>,
    { merge: true },
  )

  return matchId
}

export async function declineInvite(opts: { toUid: string; inviteId: string }) {
  const { toUid, inviteId } = opts
  const invRef = doc(db, 'users', String(toUid), 'invites', String(inviteId))
  await updateDoc(invRef, { status: 'declined', updatedAt: serverTimestamp() })
}
