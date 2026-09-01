import { doc, runTransaction, serverTimestamp, increment } from 'firebase/firestore'

const SUBJECT_FIELD = {
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
  db,
  uid,
  quizId,
  points,
  subject,
  mirrorToProfile = true,
}) {
  const qid = Array.isArray(quizId) ? quizId[0] : quizId

  const claimRef = doc(db, 'users', uid, 'claims', `quiz_${qid}`)
  const progressRef = doc(db, 'users', uid, 'meta', 'progress')
  const profileRef = doc(db, 'users', uid)

  const subjField = subject?.trim() ? SUBJECT_FIELD[subject.trim()] : null

  return await runTransaction(db, async (tx) => {
    // ✅ 1) TODAS LAS LECTURAS PRIMERO
    const reads = [tx.get(claimRef), tx.get(progressRef)]
    if (mirrorToProfile) reads.push(tx.get(profileRef)) // aunque no uses data, lo leíste antes de escribir

    const [claimSnap, progSnap] = await Promise.all(reads)

    if (claimSnap.exists()) return false // ya se premió antes

    const curr = progSnap.exists() ? progSnap.data() : {}

    // ✅ 2) AHORA SÍ, ESCRITURAS
    tx.set(claimRef, {
      type: 'quiz_award',
      quizId: qid,
      points,
      createdAt: serverTimestamp(),
    })

    const progressUpdate = {
      totalXp: increment(points),
      quizzesCompleted: increment(1),
      updatedAt: serverTimestamp(),
    }

    if (subjField) {
      const currentVal = Number(curr[subjField] ?? 0)
      progressUpdate[subjField] = Math.min(MAX_PROGRESS, currentVal + PROGRESS_DELTA_PER_PERFECT)
    }

    tx.set(progressRef, progressUpdate, { merge: true })

    if (mirrorToProfile) {
      tx.set(
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
