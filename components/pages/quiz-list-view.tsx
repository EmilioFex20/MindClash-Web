'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { BottomNavbar } from '@/components/navigation/bottom-navbar'
import styles from '@/components/pages/styles/QuizList.module.css'
import { db } from '@/lib/firebase/client'
import type { QuizMeta } from '@/types/domain'

type QuizItem = { id: string; data: QuizMeta }

export function QuizListView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subjectFilter = searchParams.get('subject')?.trim() ?? ''
  const [items, setItems] = useState<QuizItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const base = collection(db, 'quizzes')
    const quizQuery = subjectFilter
      ? query(base, where('subject', '==', subjectFilter))
      : query(base, orderBy('title', 'asc'))
    return onSnapshot(
      quizQuery,
      (snapshot) => {
        setItems(snapshot.docs.map((document) => ({
          id: document.id,
          data: document.data() as QuizMeta,
        })).sort((left, right) => (left.data.title || '').localeCompare(right.data.title || '')))
        setLoading(false)
      },
      (snapshotError) => {
        setError(snapshotError.code === 'failed-precondition'
          ? 'Falta un índice en Firestore para este filtro. Abre la consola y crea el index sugerido.'
          : 'Error cargando quizzes.')
        setLoading(false)
      },
    )
  }, [subjectFilter])

  return (
    <main className={styles.page}>
      <section className={styles.wrap}>
        <div className={styles.top}>
          <button className={styles.ghostBack} type="button" onClick={() => router.back()}>← Back</button>
          <h1 className={styles.title}>Quizzes</h1>
          {subjectFilter && <p className={styles.subtitle}>Filtrando por: <span className={styles.pill}>{subjectFilter}</span><button className={styles.clear} type="button" onClick={() => router.push('/quizzes')}>Quitar</button></p>}
        </div>
        {loading ? <div className={styles.center}><div className={`${styles.spinner} spin`} aria-label="Loading" /></div>
          : error ? <p className={styles.error}>{error}</p>
            : items.length === 0 ? <p className={styles.empty}>No hay quizzes{subjectFilter ? ` para "${subjectFilter}"` : ''}.</p>
              : <div className={styles.list}>{items.map((item) => <button key={item.id} type="button" className={styles.card} onClick={() => router.push(`/quizzes/${item.id}`)}><div className={styles.cardLeft}><div className={styles.cardTitle}>{item.data.title}</div><div className={styles.cardMeta}>{item.data.subject} • {item.data.difficulty} • {item.data.questionCount} questions</div></div><div className={styles.xp}>{item.data.maxPoints} XP</div></button>)}</div>}
      </section>
      <BottomNavbar />
    </main>
  )
}
