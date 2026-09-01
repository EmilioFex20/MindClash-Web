import { computed } from 'vue'
import { db } from '@/firebase/config'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { useAuth } from '@/composables/useAuth'

export function useUsers() {
  const { user } = useAuth()

  const uid = computed(() => user.value?.uid ?? null)

  const saveOnboarding = async (payload) => {
    if (!uid.value) throw new Error('Missing user id (not logged in)')

    const ref = doc(db, 'users', uid.value)

    await setDoc(
      ref,
      {
        username: payload.username ?? '',
        selectedAvatar: payload.selectedAvatar ?? '',
        learningGoal: payload.learningGoal ?? '',

        // timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }, // no borras otros campos
    )
  }

  // opcional: leer perfil
  const getProfile = async () => {
    if (!uid.value) return null
    const snap = await getDoc(doc(db, 'users', uid.value))
    return snap.exists() ? snap.data() : null
  }

  return { uid, saveOnboarding, getProfile }
}
