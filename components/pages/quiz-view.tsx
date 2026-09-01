'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Clock,
  Target,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react'
import { BottomNavbar } from '@/components/navigation/bottom-navbar'
import styles from '@/components/pages/styles/Quiz.module.css'
import { db } from '@/lib/firebase/client'
import type { QuizMeta, QuizQuestion } from '@/types/domain'

type QuizState = 'start' | 'playing' | 'feedback' | 'complete'

function cx(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(' ')
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Error cargando el daily quiz.'
}

export function QuizView() {
  const router = useRouter()
  const [loadingDaily, setLoadingDaily] = useState(true)
  const [dailyError, setDailyError] = useState<string | null>(null)
  const [quizMeta, setQuizMeta] = useState<QuizMeta | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [quizState, setQuizState] = useState<QuizState>('start')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadDailyQuiz() {
      setLoadingDaily(true)
      setDailyError(null)
      try {
        const quizQuery = query(collection(db, 'quizzes'), orderBy('title', 'desc'), limit(1))
        const snapshot = await getDocs(quizQuery)
        if (cancelled) return
        if (snapshot.empty) {
          setDailyError('No hay quizzes publicados.')
          return
        }

        const quizDocument = snapshot.docs[0]
        const meta = { id: quizDocument.id, ...quizDocument.data() } as QuizMeta
        const questionQuery = query(
          collection(db, 'quizzes', quizDocument.id, 'questions'),
          orderBy('order', 'asc'),
        )
        const questionSnapshot = await getDocs(questionQuery)
        if (cancelled) return
        const loadedQuestions = questionSnapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        })) as QuizQuestion[]
        setQuizMeta(meta)
        setQuestions(loadedQuestions)
        if (!loadedQuestions.length) setDailyError('Este quiz está vacío (no tiene preguntas).')
      } catch (error) {
        if (!cancelled) setDailyError(errorMessage(error))
      } finally {
        if (!cancelled) setLoadingDaily(false)
      }
    }
    void loadDailyQuiz()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (quizState !== 'playing') return
    if (timeLeft <= 0) {
      setSelectedAnswer(-1)
      setQuizState('feedback')
      return
    }
    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [quizState, timeLeft])

  const timePer = Number(quizMeta?.timePerQuestion ?? 30)
  const question = questions[currentQuestion]
  const progress = Math.round(((currentQuestion + 1) / Math.max(1, questions.length)) * 100)
  const maxPoints = questions.reduce((sum, item) => sum + Number(item.points ?? 0), 0)
  const percentage = Math.round((correctAnswers / Math.max(1, questions.length)) * 100)
  const isTimeUp = selectedAnswer === -1
  const isCorrect = selectedAnswer === question?.correctAnswer
  const rating = scoreRating(percentage)
  const confettiPieces = useMemo(() => Array.from({ length: 22 }, (_, index) => ({
    id: index,
    left: `${(index * 37) % 100}%`,
    delay: `${((index * 13) % 14) / 10}s`,
  })), [])

  function startQuiz() {
    if (loadingDaily || !questions.length) return
    setQuizState('playing')
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setCorrectAnswers(0)
    setTimeLeft(timePer)
  }

  function handleAnswerSelect(index: number) {
    if (selectedAnswer !== null || !question) return
    const correct = index === question.correctAnswer
    setSelectedAnswer(index)
    if (correct) {
      setScore((value) => value + Number(question.points ?? 0))
      setCorrectAnswers((value) => value + 1)
      setShowConfetti(true)
      window.setTimeout(() => setShowConfetti(false), 1400)
    }
    setQuizState('feedback')
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((value) => value + 1)
      setSelectedAnswer(null)
      setTimeLeft(timePer)
      setQuizState('playing')
    } else {
      setQuizState('complete')
    }
  }

  function restartQuiz() {
    setQuizState('start')
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setCorrectAnswers(0)
    setTimeLeft(timePer)
  }

  return (
    <main className={styles.quiz}>
      {quizState === 'start' && <section className={styles.centerPad}><div className={styles.wrap}>
        <button className={styles.ghostBack} type="button" onClick={() => router.back()}><ArrowLeft className={styles.mini} /> Back</button>
        <div className={cx(styles.card, styles.padLg, styles.center, styles.stackLg)}>
          <div className={cx(styles.badgeBig, styles.pop)}><Target className={styles.bigIcon} /></div>
          <div className={styles.stackSm}><h1 className={styles.h1}>{quizMeta?.title ?? 'Daily Quiz Challenge'}</h1><p className={styles.muted}>Test your CS knowledge across multiple subjects</p></div>
          <div className={styles.facts}>
            <div className={styles.factRow}><span className={styles.muted}>Questions:</span><span className={styles.strong}>{questions.length}</span></div>
            <div className={styles.factRow}><span className={styles.muted}>Time per question:</span><span className={styles.strong}>{timePer} seconds</span></div>
            <div className={styles.factRow}><span className={styles.muted}>Max points:</span><span className={styles.strong}>{maxPoints} XP</span></div>
          </div>
          <button className={styles.ctaBtn} type="button" onClick={startQuiz} disabled={loadingDaily || !questions.length}><span>{loadingDaily ? 'Loading…' : 'Start Quiz'}</span><Zap className={styles.mini} /></button>
          {dailyError && <p className={styles.muted} style={{ textAlign: 'center' }}>{dailyError}</p>}
        </div>
      </div><BottomNavbar /></section>}

      {quizState === 'playing' && question && <section className={styles.pad}><div className={styles.wrap}>
        <header className={styles.playingHead}><button className={styles.ghostIcon} type="button" onClick={() => setQuizState('start')} aria-label="Back to start"><ArrowLeft className={styles.mini} /></button><div className={styles.timer}><Clock className={cx(styles.mini, styles.dim)} /><span className={cx(styles.time, timeLeft <= 10 && styles.danger)}>{timeLeft}s</span></div></header>
        <div className={styles.meta}><div className={styles.metaRow}><span className={styles.muted}>Question {currentQuestion + 1} of {questions.length}</span><span className={cx(styles.badge, difficultyClass(question.difficulty))}>{question.difficulty}</span></div><div className={cx(styles.progressTrack, styles.small)} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div></div>
        <div className={cx(styles.card, styles.padLg, styles.stackMd)}><div className={cx(styles.center, styles.stackSm)}><span className={styles.outlineBadge}>{question.subject}</span><h2 className={styles.h2}>{question.question}</h2></div></div>
        <div className={styles.stackSm} style={{ marginTop: 14 }}>{question.options.map((option, index) => <button key={`${index}-${option}`} className={styles.optionBtn} type="button" disabled={selectedAnswer !== null} onClick={() => handleAnswerSelect(index)}><span className={styles.optLetter}>{String.fromCharCode(65 + index)}</span><span className={styles.optText}>{option}</span></button>)}</div>
      </div>{showConfetti && <div className={styles.confetti} aria-hidden="true">{confettiPieces.map((piece) => <span key={piece.id} className={styles.confettiPiece} style={{ left: piece.left, animationDelay: piece.delay }} />)}</div>}<BottomNavbar /></section>}

      {quizState === 'feedback' && question && <section className={styles.centerPad}><div className={styles.wrap}>
        <div className={cx(styles.card, styles.padLg, styles.stackMd, isCorrect ? styles.okCard : styles.badCard)}>
          <div className={cx(styles.resultIcon, isCorrect ? styles.okIcon : styles.badIcon)}>{isTimeUp ? <Clock className={cx(styles.midIcon, styles.bad)} /> : isCorrect ? <CheckCircle className={cx(styles.midIcon, styles.ok)} /> : <XCircle className={cx(styles.midIcon, styles.bad)} />}</div>
          <div className={cx(styles.center, styles.stackSm)}><h2 className={cx(styles.h2, isCorrect ? styles.okText : styles.badText)}>{isTimeUp ? "Time's Up!" : isCorrect ? 'Correct!' : 'Incorrect!'}</h2>{isCorrect && <p className={cx(styles.okText, styles.strong)}>+{question.points} XP</p>}</div>
          <div className={styles.box}><div className={styles.boxTitle}>Correct Answer:</div><div className={cx(styles.boxText, styles.muted)}>{String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}</div></div>
          <div className={styles.box}><div className={styles.boxTitle}>Explanation:</div><div className={cx(styles.boxText, styles.muted)}>{question.explanation}</div></div>
        </div>
        <button className={styles.ctaBtn} type="button" onClick={nextQuestion}>{currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'}<ChevronRight className={styles.mini} /></button>
      </div><BottomNavbar /></section>}

      {quizState === 'complete' && <section className={styles.centerPad}><div className={styles.wrap}><div className={cx(styles.card, styles.padLg, styles.center, styles.stackLg)}>
        <div className={cx(styles.badgeBig, styles.pop, styles.success)}><Trophy className={styles.bigIcon} /></div><div className={styles.stackSm}><h1 className={styles.h1}>Quiz Complete!</h1><p className={cx(styles.rating, rating.className)}>{rating.emoji} {rating.text}</p></div>
        <div className={styles.stats}><div className={styles.statBlock}><div className={styles.statBig}>{score}</div><div className={styles.muted}>Total XP</div></div><div className={styles.statBlock}><div className={styles.statBig}>{percentage}%</div><div className={styles.muted}>Accuracy</div></div></div>
        <div className={styles.center}><div className={styles.statBig}>{correctAnswers}/{questions.length}</div><div className={styles.muted}>Correct Answers</div></div>
        <div className={styles.stackSm} style={{ width: '100%' }}><button className={styles.ctaBtn} type="button" onClick={restartQuiz}>Try Again</button><button className={styles.outlineBtn} type="button" onClick={() => router.push('/dashboard')}>Back to Dashboard</button></div>
      </div></div><BottomNavbar /></section>}
    </main>
  )
}

function difficultyClass(difficulty: string) {
  if (difficulty === 'Easy') return styles.bEasy
  if (difficulty === 'Medium') return styles.bMed
  return styles.bHard
}

function scoreRating(percentage: number) {
  if (percentage >= 90) return { text: 'Excellent!', emoji: '🏆', className: styles.rGold }
  if (percentage >= 70) return { text: 'Great Job!', emoji: '⭐', className: styles.rBlue }
  if (percentage >= 50) return { text: 'Good Work!', emoji: '👍', className: styles.rGreen }
  return { text: 'Keep Practicing!', emoji: '💪', className: styles.rOrange }
}
