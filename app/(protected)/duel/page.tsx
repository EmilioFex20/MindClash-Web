import { Suspense } from 'react'
import { DuelView } from '@/components/pages/duel-view'

export default function DuelPage() {
  return <Suspense fallback={null}><DuelView /></Suspense>
}
