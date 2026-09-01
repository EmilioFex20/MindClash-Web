// src/composables/useMatch.js
import { computed, onUnmounted, ref, watch } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { listenMatch } from '@/lib/duel' // tu función que hace onSnapshot y setMatch

export function useMatch(matchIdRefOrValue) {
  const match = ref(null) // { ...data, id } o null
  const now = ref(Timestamp.now())

  let unsub = null
  let intervalId = null

  const stop = () => {
    if (unsub) {
      unsub()
      unsub = null
    }
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // escucha matchId (puede ser ref/computed o string normal)
  watch(
    () =>
      typeof matchIdRefOrValue === 'object' && matchIdRefOrValue?.value !== undefined
        ? matchIdRefOrValue.value
        : matchIdRefOrValue,
    (matchId) => {
      // reset
      if (unsub) {
        unsub()
        unsub = null
      }
      match.value = null

      if (!matchId) return

      // listenMatch(matchId, callback) => devuelve unsubscribe
      unsub = listenMatch(matchId, (m) => {
        match.value = m
      })
    },
    { immediate: true },
  )

  // tick para timers (cada 500ms)
  intervalId = setInterval(() => {
    now.value = Timestamp.now()
  }, 500)

  onUnmounted(() => stop())

  const remainingMs = computed(() => {
    const m = match.value
    if (!m || m.status !== 'active' || !m.lastAdvanceAt) return null

    // lastAdvanceAt debe ser Timestamp (Firestore)
    const last = m.lastAdvanceAt
    const elapsed = now.value.toMillis() - last.toMillis()
    const per = m.perQuestionMs ?? 15000
    return Math.max(0, per - elapsed)
  })

  return { match, remainingMs }
}
