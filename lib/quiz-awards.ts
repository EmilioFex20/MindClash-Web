'use client'

import { doc, increment, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

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

export async function awardQuizOnceAndUpdateProgress({
  uid,
  quizId,
  points,
  subject,
  mirrorToProfile = true,
}: {
  uid: string
  quizId: string
  points: number
  subject?: string
  mirrorToProfile?: boolean
}) {
  const claimRef = doc(db, 'users', uid, 'claims', `quiz_${quizId}`)
  const progressRef = doc(db, 'users', uid, 'meta', 'progress')
  const profileRef = doc(db, 'users', uid)
  const subjectField = subject?.trim() ? SUBJECT_FIELD[subject.trim()] : undefined

  return runTransaction(db, async (transaction) => {
    const reads = [transaction.get(claimRef), transaction.get(progressRef)]
    if (mirrorToProfile) reads.push(transaction.get(profileRef))
    const [claimSnapshot, progressSnapshot] = await Promise.all(reads)

    if (claimSnapshot.exists()) return false
    const currentProgress = progressSnapshot.exists() ? progressSnapshot.data() : {}

    transaction.set(claimRef, {
      type: 'quiz_award',
      quizId,
      points,
      createdAt: serverTimestamp(),
    })

    const progressUpdate: Record<string, unknown> = {
      totalXp: increment(points),
      quizzesCompleted: increment(1),
      updatedAt: serverTimestamp(),
    }
    if (subjectField) {
      const currentValue = Number(currentProgress[subjectField] ?? 0)
      progressUpdate[subjectField] = Math.min(
        MAX_PROGRESS,
        currentValue + PROGRESS_DELTA_PER_PERFECT,
      )
    }
    transaction.set(progressRef, progressUpdate, { merge: true })

    if (mirrorToProfile) {
      transaction.set(
        profileRef,
        {
          xp: increment(points),
          totalPoints: increment(points),
          quizzesCompleted: increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    }
    return true
  })
}
