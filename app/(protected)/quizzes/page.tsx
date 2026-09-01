import { Suspense } from 'react'
import { QuizListView } from '@/components/pages/quiz-list-view'

export default function QuizzesPage() {
  return <Suspense fallback={null}><QuizListView /></Suspense>
}
