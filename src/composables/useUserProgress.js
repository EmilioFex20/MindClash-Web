// src/composables/useUserProgress.js
import { ref as vueRef, watchEffect, onUnmounted } from 'vue'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from '@/composables/useAuth'

export const DEFAULT_PROGRESS = {
  totalXp: 0,
  quizzesCompleted: 0,
  programmingProgress: 0,
  algorithmsProgress: 0,
  databasesProgress: 0,
  networkingProgress: 0,
  aiProgress: 0,
  securityProgress: 0,
}

export function useUserProgress() {
  const { user } = useAuth()
  const progress = vueRef({ ...DEFAULT_PROGRESS })
  const loading = vueRef(true)
  const error = vueRef(null)

  let unsub = null
  let initialized = false // evita loop de setDoc

  watchEffect(() => {
    if (unsub) {
      unsub()
      unsub = null
    }

    const uid = user.value?.uid
    if (!uid) {
      progress.value = { ...DEFAULT_PROGRESS }
      loading.value = false
      return
    }

    loading.value = true
    error.value = null
    initialized = false

    const ref = doc(db, 'users', uid, 'meta', 'progress')

    unsub = onSnapshot(
      ref,
      async (snap) => {
        if (!snap.exists()) {
          // crear doc 1 vez para que existan los fields
          if (!initialized) {
            initialized = true
            try {
              await setDoc(
                ref,
                { ...DEFAULT_PROGRESS, updatedAt: serverTimestamp() },
                { merge: true },
              )
            } catch (e) {
              console.warn('Failed to init progress doc:', e)
            }
          }
          progress.value = { ...DEFAULT_PROGRESS }
          loading.value = false
          return
        }

        const data = snap.data() || {}
        progress.value = { ...DEFAULT_PROGRESS, ...data }
        loading.value = false
      },
      (err) => {
        console.error('useUserProgress snapshot error:', err)
        error.value = err?.message ?? 'Error loading progress'
        loading.value = false
      },
    )
  })

  onUnmounted(() => {
    if (unsub) unsub()
  })

  return { progress, loading, error }
}
