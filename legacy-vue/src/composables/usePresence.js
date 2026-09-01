// src/composables/usePresence.js
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { db } from '@/firebase/config'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Presence heartbeat:
 * - online=true + lastSeen=serverTimestamp()
 * - every 15s updates lastSeen
 * - best-effort mark offline on unmount / tab close
 *
 * Usage:
 *   const { user } = useAuth()
 *   usePresence(user) // or usePresence(computed(() => user.value?.uid))
 */
export function usePresence(uidOrRef, opts = {}) {
  const intervalMs = opts.intervalMs ?? 15000

  let intervalId = null
  let stopFns = []
  let currentUid = null
  let started = false

  const resolveUid = () => {
    // accepts: string | Ref/ComputedRef | function
    if (typeof uidOrRef === 'function') return uidOrRef()
    if (uidOrRef && typeof uidOrRef === 'object' && 'value' in uidOrRef) return uidOrRef.value
    return uidOrRef
  }

  const bump = async (uid) => {
    if (!uid) return
    const ref = doc(db, 'users', String(uid))
    await setDoc(ref, { online: true, lastSeen: serverTimestamp() }, { merge: true })
  }

  const markOffline = async (uid) => {
    if (!uid) return
    const ref = doc(db, 'users', String(uid))
    // best-effort
    try {
      await setDoc(ref, { online: false, lastSeen: serverTimestamp() }, { merge: true })
    } catch {}
  }

  const start = async (uid) => {
    if (!uid) return
    currentUid = String(uid)
    started = true

    // immediate bump
    await bump(currentUid)

    // heartbeat
    intervalId = window.setInterval(() => {
      // don't await inside interval; best-effort
      bump(currentUid).catch(() => {})
    }, intervalMs)

    // extra best-effort: tab close / background
    const onHide = () => markOffline(currentUid)
    const onVis = () => {
      if (document.visibilityState === 'hidden') markOffline(currentUid)
      else bump(currentUid).catch(() => {})
    }

    window.addEventListener('pagehide', onHide)
    window.addEventListener('beforeunload', onHide)
    document.addEventListener('visibilitychange', onVis)

    stopFns = [
      () => window.removeEventListener('pagehide', onHide),
      () => window.removeEventListener('beforeunload', onHide),
      () => document.removeEventListener('visibilitychange', onVis),
    ]
  }

  const stop = async () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    stopFns.forEach((fn) => fn())
    stopFns = []

    if (started && currentUid) {
      await markOffline(currentUid)
    }
    currentUid = null
    started = false
  }

  onMounted(() => {
    // react to uid changes
    watch(
      () => resolveUid(),
      async (uid, prev) => {
        const next = uid ? String(uid) : null
        const prevUid = prev ? String(prev) : null
        if (next === prevUid) return

        // stop previous presence
        if (prevUid) await stop()

        // start new presence
        if (next) await start(next)
      },
      { immediate: true },
    )
  })

  onBeforeUnmount(() => {
    // best-effort; don't block navigation
    stop().catch(() => {})
  })

  return { stop, bumpNow: () => bump(currentUid) }
}
