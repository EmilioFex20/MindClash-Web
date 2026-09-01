// src/composables/useUserProfile.js
import { ref as vueRef, watchEffect, onUnmounted } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from '@/composables/useAuth' // ajusta si tu ruta cambia

export function useUserProfile() {
  const { user } = useAuth() // tu composable ya expone user (firebaseUser)
  const profile = vueRef(null)
  const loading = vueRef(true)
  const error = vueRef(null)

  let unsub = null

  watchEffect(() => {
    // cleanup si cambia uid o desmonta
    if (unsub) {
      unsub()
      unsub = null
    }

    const uid = user.value?.uid
    if (!uid) {
      profile.value = null
      loading.value = false
      return
    }

    loading.value = true
    error.value = null

    const ref = doc(db, 'users', uid)
    unsub = onSnapshot(
      ref,
      (snap) => {
        profile.value = snap.exists() ? snap.data() : null
        loading.value = false
      },
      (err) => {
        console.error('useUserProfile snapshot error:', err)
        error.value = err?.message ?? 'Error loading profile'
        loading.value = false
      },
    )
  })

  onUnmounted(() => {
    if (unsub) unsub()
  })

  return { profile, loading, error }
}
