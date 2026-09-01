'use client'

import { useEffect } from 'react'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

async function setPresence(uid: string, online: boolean) {
  await setDoc(
    doc(db, 'users', uid),
    { online, lastSeen: serverTimestamp() },
    { merge: true },
  )
}

export function usePresence(uid: string | null, intervalMs = 15_000) {
  useEffect(() => {
    if (!uid) return

    const markOnline = () => setPresence(uid, true).catch(() => undefined)
    const markOffline = () => setPresence(uid, false).catch(() => undefined)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') markOffline()
      else markOnline()
    }

    void markOnline()
    const interval = window.setInterval(markOnline, intervalMs)
    window.addEventListener('pagehide', markOffline)
    window.addEventListener('beforeunload', markOffline)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('pagehide', markOffline)
      window.removeEventListener('beforeunload', markOffline)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void markOffline()
    }
  }, [intervalMs, uid])
}
