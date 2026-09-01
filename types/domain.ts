import type { Timestamp } from 'firebase/firestore'

export type UserProfile = {
  username?: string
  selectedAvatar?: string
  learningGoal?: string
  xp?: number
  totalPoints?: number
  streak?: number
  rank?: number
  completedToday?: number
  online?: boolean
  lastSeen?: Timestamp
  createdAt?: Timestamp
  updatedAt?: Timestamp
  [key: string]: unknown
}

export type UserProgress = {
  totalXp: number
  quizzesCompleted: number
  programmingProgress: number
  algorithmsProgress: number
  databasesProgress: number
  networkingProgress: number
  aiProgress: number
  securityProgress: number
  [key: string]: unknown
}

export type QuizMeta = {
  id?: string
  title: string
  subject: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | string
  timePerQuestion?: number
  questionCount?: number
  maxPoints?: number
  [key: string]: unknown
}

export type QuizQuestion = {
  id: string
  order?: number
  subject: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | string
  points: number
  [key: string]: unknown
}

export type DuelMatch = {
  id: string
  status: 'waiting' | 'active' | 'finished' | 'cancelled' | 'abandoned'
  hostUid: string
  opponentUid?: string | null
  currentIndex: number
  perQuestionMs: number
  questionIds: string[]
  lastAdvanceAt?: Timestamp | null
  scores: Record<string, number>
  answers?: Record<string, Record<string, { choice: number; at: Timestamp }>>
  winnerUid?: string | null
}
