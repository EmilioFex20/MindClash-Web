import { db } from '@/firebase/config'
import {
  doc,
  runTransaction,
  increment,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore'

const SUBJECT_FIELD: Record<string, string> = {
  Programming: 'programmingProgress',
  Algorithms: 'algorithmsProgress',
  Databases: 'databasesProgress',
  Networking: 'networkingProgress',
  'AI/ML': 'aiProgress',
  Security: 'securityProgress',
}

const MAX_PROGRESS = 100
const PROGRESS_DELTA_PER_PERFECT = 8

export async function awardQuizOnceAndUpdateProgress(opts: {
  uid: string
  quizId: string
  points: number
  subject?: string
  mirrorToProfile?: boolean
}): Promise<boolean> {
  const { uid, quizId, points, subject, mirrorToProfile } = opts

  const claimRef = doc(db, `users/${uid}/claims/quiz_${quizId}`)
  const progressRef = doc(db, `users/${uid}/meta/progress`)
  const profileRef = doc(db, `users/${uid}`)

  const subjField = subject ? SUBJECT_FIELD[subject.trim()] : undefined

  let awarded = false

  await runTransaction(db, async (tx) => {
    // Firestore transactions require every read to happen before any write.
    const [claimSnap, progSnap] = await Promise.all([tx.get(claimRef), tx.get(progressRef)])
    if (claimSnap.exists()) return

    const curr: DocumentData = progSnap.exists() ? progSnap.data() : {}

    tx.set(claimRef, {
      type: 'quiz_award',
      quizId,
      points,
      createdAt: serverTimestamp(),
    })

    const update: Record<string, unknown> = {
      totalXp: increment(points),
      quizzesCompleted: increment(1),
      updatedAt: serverTimestamp(),
    }

    if (subjField) {
      const currentVal = Number(curr[subjField] ?? 0)
      update[subjField] = Math.min(MAX_PROGRESS, currentVal + PROGRESS_DELTA_PER_PERFECT)
    }

    tx.set(progressRef, update, { merge: true })

    if (mirrorToProfile) {
      tx.set(
        profileRef,
        {
          xp: increment(points),
          totalPoints: increment(points),
          updatedAt: serverTimestamp(),
          quizzesCompleted: increment(1),
        },
        { merge: true },
      )
    }

    awarded = true
  })

  return awarded
}
