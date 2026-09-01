'use client'

import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import type { DuelMatch, QuizQuestion } from '@/types/domain'

/**
 * Duel question refs are encoded as "{quizId}::{questionId}" so the match
 * document's plain `questionIds: string[]` field can point at real Firestore
 * questions without adding a separate quizId field to the schema.
 */
export async function pickDuelQuestionRefs(count = 3): Promise<string[]> {
  const quizzesSnapshot = await getDocs(collection(db, 'quizzes'))
  const quizIds = quizzesSnapshot.docs.map((quizSnapshot) => quizSnapshot.id)
  if (!quizIds.length) return []

  const quizId = quizIds[Math.floor(Math.random() * quizIds.length)]
  const questionsSnapshot = await getDocs(
    query(collection(db, 'quizzes', quizId, 'questions'), orderBy('order', 'asc'), limit(count)),
  )
  return questionsSnapshot.docs.map((questionSnapshot) => `${quizId}::${questionSnapshot.id}`)
}

export async function fetchQuestionsByRefs(refs: string[]): Promise<QuizQuestion[]> {
  const questions = await Promise.all(
    refs.map(async (ref) => {
      const [quizId, questionId] = ref.split('::')
      if (!quizId || !questionId) return null
      const snapshot = await getDoc(doc(db, 'quizzes', quizId, 'questions', questionId))
      return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as QuizQuestion) : null
    }),
  )
  return questions.filter((question): question is QuizQuestion => question !== null)
}

export async function createMatch(hostUid: string, questionIds: string[], perQuestionMs = 15_000) {
  const matchRef = doc(collection(db, 'matches'))
  await setDoc(matchRef, {
    id: matchRef.id,
    status: 'waiting',
    createdAt: serverTimestamp(),
    startedAt: null,
    hostUid,
    opponentUid: null,
    currentIndex: 0,
    perQuestionMs,
    questionIds,
    lastAdvanceAt: null,
    scores: { [hostUid]: 0 },
    answers: {},
    winnerUid: null,
    finishedAt: null,
  })
  return matchRef.id
}

async function createDirectedMatch(
  hostUid: string,
  opponentUid: string,
  questionIds: string[],
  perQuestionMs: number,
) {
  const matchRef = doc(collection(db, 'matches'))
  const now = serverTimestamp()
  await setDoc(matchRef, {
    id: matchRef.id,
    status: 'active',
    hostUid,
    opponentUid,
    questionIds,
    perQuestionMs,
    createdAt: now,
    startedAt: now,
    lastAdvanceAt: now,
    currentIndex: 0,
    scores: { [hostUid]: 0, [opponentUid]: 0 },
    answers: {},
    winnerUid: null,
    finishedAt: null,
  })
  return matchRef.id
}

export function createHeadToHeadMatch(
  hostUid: string,
  opponentUid: string,
  questionIds: string[],
  perQuestionMs = 15_000,
) {
  return createDirectedMatch(hostUid, opponentUid, questionIds, perQuestionMs)
}

export async function createWaitingMatchForInvite(
  hostUid: string,
  questionIds: string[],
  perQuestionMs = 15_000,
) {
  return createMatch(hostUid, questionIds, perQuestionMs)
}

export async function findOrCreateOpenMatch(
  uid: string,
  questionIds: string[],
  perQuestionMs = 15_000,
  opponentUid?: string,
) {
  if (opponentUid) return createDirectedMatch(uid, opponentUid, questionIds, perQuestionMs)

  const openMatches = await getDocs(
    query(collection(db, 'matches'), where('status', '==', 'waiting'), limit(10)),
  )
  const available = openMatches.docs.find((snapshot) => snapshot.data()?.hostUid !== uid)
  if (available) {
    await joinOpenMatch(available.id, uid)
    return available.id
  }
  return createMatch(uid, questionIds, perQuestionMs)
}

export function listenMatch(matchId: string, callback: (match: DuelMatch | null) => void) {
  return onSnapshot(
    doc(db, 'matches', matchId),
    (snapshot) => {
      callback(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as DuelMatch) : null)
    },
    (error) => console.warn('listenMatch error:', error),
  )
}

export async function joinOpenMatch(matchId: string, uid: string) {
  return runTransaction(db, async (transaction) => {
    const matchRef = doc(db, 'matches', matchId)
    const snapshot = await transaction.get(matchRef)
    if (!snapshot.exists()) throw new Error('Match not found')
    const match = snapshot.data() as DocumentData
    if (match.status !== 'waiting' || match.opponentUid || match.hostUid === uid) return false

    transaction.update(matchRef, {
      opponentUid: uid,
      status: 'active',
      startedAt: serverTimestamp(),
      lastAdvanceAt: serverTimestamp(),
      [`scores.${uid}`]: 0,
    })
    return true
  })
}

export async function submitAnswer({
  matchId,
  uid,
  index,
  choice,
  correctChoice,
  points = 100,
}: {
  matchId: string
  uid: string
  index: number
  choice: number
  correctChoice: number
  points?: number
}) {
  await runTransaction(db, async (transaction) => {
    const matchRef = doc(db, 'matches', matchId)
    const snapshot = await transaction.get(matchRef)
    if (!snapshot.exists()) throw new Error('Match missing')
    const match = snapshot.data() as DuelMatch
    if (match.status !== 'active' || match.currentIndex !== index) return
    const indexKey = String(index)
    if (match.answers?.[uid]?.[indexKey]) return

    const updates: Record<string, unknown> = {
      [`answers.${uid}.${indexKey}`]: { choice, at: serverTimestamp() },
    }
    if (choice === correctChoice) {
      updates[`scores.${uid}`] = Number(match.scores?.[uid] ?? 0) + points
    }
    transaction.update(matchRef, updates)
  })
}

export async function abandonIfStillWaiting(matchId: string, uid: string) {
  await runTransaction(db, async (transaction) => {
    const matchRef = doc(db, 'matches', matchId)
    const snapshot = await transaction.get(matchRef)
    if (!snapshot.exists()) return
    const match = snapshot.data() as DuelMatch
    if (match.status === 'waiting' && match.hostUid === uid && !match.opponentUid) {
      transaction.update(matchRef, { status: 'abandoned', endedAt: serverTimestamp() })
    }
  })
}

export async function tryAdvance(matchId: string) {
  await runTransaction(db, async (transaction) => {
    const matchRef = doc(db, 'matches', matchId)
    const snapshot = await transaction.get(matchRef)
    if (!snapshot.exists()) return
    const match = snapshot.data() as DuelMatch
    if (match.status !== 'active') return

    const now = Timestamp.now()
    const lastAdvanceAt = match.lastAdvanceAt ?? now
    const elapsed = now.toMillis() - lastAdvanceAt.toMillis()
    const indexKey = String(match.currentIndex)
    const bothAnswered =
      Boolean(match.hostUid) &&
      Boolean(match.opponentUid) &&
      Boolean(match.answers?.[match.hostUid]?.[indexKey]) &&
      Boolean(match.opponentUid && match.answers?.[match.opponentUid]?.[indexKey])

    if (!bothAnswered && elapsed < (match.perQuestionMs ?? 15_000)) return
    const nextIndex = match.currentIndex + 1
    if (nextIndex >= (match.questionIds?.length || 0)) {
      const hostScore = Number(match.scores?.[match.hostUid] ?? 0)
      const opponentScore = match.opponentUid
        ? Number(match.scores?.[match.opponentUid] ?? 0)
        : 0
      const winnerUid =
        hostScore === opponentScore
          ? null
          : hostScore > opponentScore
            ? match.hostUid
            : match.opponentUid
      transaction.update(matchRef, {
        status: 'finished',
        winnerUid,
        finishedAt: serverTimestamp(),
      })
    } else {
      transaction.update(matchRef, { currentIndex: nextIndex, lastAdvanceAt: serverTimestamp() })
    }
  })
}

export async function awardDuelOnce({
  uid,
  matchId,
  points,
  won,
  mirrorToProfile = true,
}: {
  uid: string
  matchId: string
  points: number
  won: boolean
  mirrorToProfile?: boolean
}) {
  const claimRef = doc(db, 'users', uid, 'claims', `duel_${matchId}`)
  const progressRef = doc(db, 'users', uid, 'meta', 'progress')
  const profileRef = doc(db, 'users', uid)

  await runTransaction(db, async (transaction) => {
    const claimSnapshot = await transaction.get(claimRef)
    if (claimSnapshot.exists()) return
    transaction.set(claimRef, {
      type: 'duel_award',
      matchId,
      points,
      won,
      createdAt: serverTimestamp(),
    })
    transaction.set(
      progressRef,
      { totalXp: increment(points), updatedAt: serverTimestamp() },
      { merge: true },
    )
    if (mirrorToProfile) {
      transaction.set(
        profileRef,
        {
          xp: increment(points),
          totalPoints: increment(points),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    }
  })
}
