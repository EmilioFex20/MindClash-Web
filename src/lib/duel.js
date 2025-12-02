// src/lib/duel.js
import { db } from '@/firebase/config'
import {
  Timestamp,
  FieldValue,
  doc,
  collection,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  limit,
  getDocs,
  runTransaction,
  serverTimestamp,
  increment,
} from 'firebase/firestore'

/**
 * @typedef {Object} Match
 * @property {"waiting"|"active"|"finished"|"cancelled"|"abandoned"} status
 * @property {any=} createdAt
 * @property {any=} startedAt
 * @property {string} hostUid
 * @property {string|null=} opponentUid
 * @property {number} currentIndex
 * @property {number} perQuestionMs
 * @property {string[]} questionIds
 * @property {any=} lastAdvanceAt
 * @property {Record<string, number>} scores
 * @property {Record<string, Record<string, {choice:number, at:any}>>=} answers
 * @property {string|null=} winnerUid
 * @property {any=} finishedAt
 */

export async function createMatch(hostUid, questionIds, perQuestionMs = 15000) {
  const ref = doc(collection(db, 'matches'))
  /** @type {Match} */
  const data = {
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
  }
  await setDoc(ref, data)
  return ref.id
}

/** H2H directo (arranca en active). */
async function createDirectedMatch(hostUid, opponentUid, questionIds, perQuestionMs) {
  const ref = doc(collection(db, 'matches'))
  const now = serverTimestamp()

  await setDoc(ref, {
    id: ref.id,
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

  return ref.id
}

export async function createHeadToHeadMatch(
  hostUid,
  opponentUid,
  questionIds,
  perQuestionMs = 15000,
) {
  return createDirectedMatch(hostUid, opponentUid, questionIds, perQuestionMs)
}

export async function createWaitingMatchForInvite(hostUid, questionIds, perQuestionMs = 15000) {
  // status waiting: el rival se une después
  const ref = doc(collection(db, 'matches'))
  const now = serverTimestamp()

  await setDoc(ref, {
    id: ref.id,
    status: 'waiting',
    hostUid,
    opponentUid: null,
    questionIds,
    perQuestionMs,
    createdAt: now,
    startedAt: null,
    lastAdvanceAt: null,
    currentIndex: 0,
    scores: { [hostUid]: 0 },
    answers: {},
    winnerUid: null,
    finishedAt: null,
  })

  return ref.id
}

/** Quick-match: intenta unirse a uno waiting; si no hay, crea uno. Si opponentUid existe -> H2H directo. */
export async function findOrCreateOpenMatch(uid, questionIds, perQuestionMs = 15000, opponentUid) {
  if (opponentUid) {
    return createDirectedMatch(uid, opponentUid, questionIds, perQuestionMs)
  }

  const q = query(collection(db, 'matches'), where('status', '==', 'waiting'), limit(10))
  const snap = await getDocs(q)

  // busca uno donde el host no seas tú
  const first = snap.docs.find((d) => d.data()?.hostUid !== uid)
  if (first) {
    await joinMatch(first.id, uid)
    return first.id
  }

  return createMatch(uid, questionIds, perQuestionMs)
}

/** join (solo si waiting y no hay opponent). */
export async function joinMatch(matchId, opponentUid) {
  const ref = doc(db, 'matches', String(matchId))

  await runTransaction(db, async (tx) => {
    // READS first
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error('Match not found')

    /** @type {Match} */
    const m = snap.data()
    if (m.status !== 'waiting' || m.opponentUid) throw new Error('Match unavailable')

    // WRITES after reads
    tx.update(ref, {
      opponentUid,
      status: 'active',
      startedAt: serverTimestamp(),
      lastAdvanceAt: serverTimestamp(),
      [`scores.${opponentUid}`]: 0,
    })
  })
}

export function listenMatch(matchId, cb) {
  const ref = doc(db, 'matches', String(matchId))
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) return cb(null)
      cb({ id: snap.id, ...snap.data() })
    },
    (err) => console.warn('listenMatch error:', err),
  )
}

/** Igual que joinMatch pero retorna boolean (si logró unirse). */
export async function joinOpenMatch(matchId, uid) {
  const ref = doc(db, 'matches', String(matchId))

  return runTransaction(db, async (tx) => {
    // READS first
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error('Match not found')
    const m = snap.data()

    if (m.status !== 'waiting') return false
    if (m.opponentUid) return false
    if (m.hostUid === uid) return false

    // WRITES after reads
    tx.update(ref, {
      opponentUid: uid,
      status: 'active',
      startedAt: serverTimestamp(),
      lastAdvanceAt: serverTimestamp(),
      [`scores.${uid}`]: 0,
    })

    return true
  })
}

/** Answer once per question; adds score if correct. */
export async function submitAnswer({ matchId, uid, index, choice, correctChoice, points = 100 }) {
  const ref = doc(db, 'matches', String(matchId))
  const idxKey = String(index)

  await runTransaction(db, async (tx) => {
    // READS first
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error('Match missing')
    /** @type {Match} */
    const m = snap.data()
    if (m.status !== 'active' || m.currentIndex !== index) return

    const already = m.answers?.[uid]?.[idxKey]
    if (already) return

    const isCorrect = choice === correctChoice

    // WRITES after reads
    const updates = {
      [`answers.${uid}.${idxKey}`]: { choice, at: serverTimestamp() },
    }

    if (isCorrect) {
      const curr = Number(m.scores?.[uid] ?? 0)
      updates[`scores.${uid}`] = curr + points
    }

    tx.update(ref, updates)
  })
}

export async function abandonIfStillWaiting(matchId, uid) {
  const ref = doc(db, 'matches', String(matchId))

  await runTransaction(db, async (tx) => {
    // READS first
    const snap = await tx.get(ref)
    if (!snap.exists()) return
    const m = snap.data()

    if (m.status === 'waiting' && m.hostUid === uid && !m.opponentUid) {
      // WRITES after reads
      tx.update(ref, { status: 'abandoned', endedAt: serverTimestamp() })
    }
  })
}

/** Advance when both answered or timer expired. */
export async function tryAdvance(matchId) {
  const ref = doc(db, 'matches', String(matchId))

  await runTransaction(db, async (tx) => {
    // READS first
    const snap = await tx.get(ref)
    if (!snap.exists()) return
    /** @type {Match} */
    const m = snap.data()
    if (m.status !== 'active') return

    const now = Timestamp.now()
    const last = m.lastAdvanceAt ?? now
    const msElapsed = now.toMillis() - last.toMillis()
    const perMs = m.perQuestionMs ?? 15000

    const idxKey = String(m.currentIndex)
    const bothAnswered =
      !!m.hostUid &&
      !!m.opponentUid &&
      !!m.answers?.[m.hostUid]?.[idxKey] &&
      !!m.answers?.[m.opponentUid]?.[idxKey]

    if (!bothAnswered && msElapsed < perMs) return

    const nextIndex = m.currentIndex + 1
    const isLast = nextIndex >= (m.questionIds?.length || 0)

    // WRITES after reads
    if (isLast) {
      const hostScore = Number(m.scores?.[m.hostUid] || 0)
      const oppScore = m.opponentUid ? Number(m.scores?.[m.opponentUid] || 0) : 0
      const winner =
        hostScore === oppScore ? null : hostScore > oppScore ? m.hostUid : m.opponentUid

      tx.update(ref, {
        status: 'finished',
        winnerUid: winner,
        finishedAt: serverTimestamp(),
      })
    } else {
      tx.update(ref, {
        currentIndex: nextIndex,
        lastAdvanceAt: serverTimestamp(),
      })
    }
  })
}

/** Award XP once per match using claim pattern. */
export async function awardDuelOnce({ uid, matchId, points, mirrorToProfile = true }) {
  const safeUid = String(uid)
  const safeMatchId = String(matchId)

  const claimRef = doc(db, 'users', safeUid, 'claims', `duel_${safeMatchId}`)
  const progressRef = doc(db, 'users', safeUid, 'meta', 'progress')
  const profileRef = doc(db, 'users', safeUid)

  await runTransaction(db, async (tx) => {
    // READS first
    const claimSnap = await tx.get(claimRef)
    if (claimSnap.exists()) return

    // WRITES after reads
    tx.set(claimRef, {
      type: 'duel_award',
      matchId: safeMatchId,
      points: Number(points) || 0,
      createdAt: serverTimestamp(),
    })

    tx.set(
      progressRef,
      {
        totalXp: increment(Number(points) || 0),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    if (mirrorToProfile) {
      tx.set(
        profileRef,
        {
          xp: increment(Number(points) || 0),
          totalPoints: increment(Number(points) || 0),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    }
  })
}
