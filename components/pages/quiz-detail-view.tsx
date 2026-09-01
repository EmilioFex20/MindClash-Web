'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { ArrowLeft, CheckCircle, ChevronRight, Clock, Target, Trophy, XCircle, Zap } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import styles from '@/components/pages/styles/QuizDetail.module.css'
import { db } from '@/lib/firebase/client'
import { awardQuizOnceAndUpdateProgress } from '@/lib/quiz-awards'
import type { QuizMeta, QuizQuestion } from '@/types/domain'

type State = 'start' | 'playing' | 'feedback' | 'complete'

function cx(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(' ')
}

export function QuizDetailView() {
  const router = useRouter()
  const params = useParams<{ quizId: string }>()
  const quizId = String(params.quizId ?? '')
  const { user } = useAuth()
  const [quiz, setQuiz] = useState<QuizMeta | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<State>('start')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [perfectSoFar, setPerfectSoFar] = useState(true)
  const awardRan = useRef(false)

  useEffect(() => {
    if (!quizId) return
    setLoading(true)
    setError(null)
    const unsubscribeQuiz = onSnapshot(doc(db, 'quizzes', quizId), (snapshot) => {
      if (!snapshot.exists()) {
        setQuiz(null)
        setLoading(false)
        return
      }
      setQuiz({ id: snapshot.id, ...snapshot.data() } as QuizMeta)
    }, () => {
      setError('Error loading quiz.')
      setLoading(false)
    })
    const unsubscribeQuestions = onSnapshot(
      query(collection(db, 'quizzes', quizId, 'questions'), orderBy('order', 'asc')),
      (snapshot) => {
        setQuestions(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })) as QuizQuestion[])
        setLoading(false)
      },
      () => {
        setError('Error loading questions.')
        setLoading(false)
      },
    )
    return () => {
      unsubscribeQuiz()
      unsubscribeQuestions()
    }
  }, [quizId])

  useEffect(() => {
    if (state !== 'playing') return
    if (timeLeft <= 0) {
      setSelected(-1)
      setPerfectSoFar(false)
      setState('feedback')
      return
    }
    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [state, timeLeft])

  const question = questions[questionIndex]
  const timePer = Number(quiz?.timePerQuestion ?? 30)
  const progress = Math.round(((questionIndex + 1) / Math.max(1, questions.length)) * 100)
  const maxPoints = questions.reduce((sum, item) => sum + Number(item.points ?? 0), 0)
  const percentage = Math.round((correctCount / Math.max(1, questions.length)) * 100)
  const isTimeUp = selected === -1
  const isCorrect = selected === question?.correctAnswer
  const isPerfect = perfectSoFar && correctCount === questions.length
  const rating = scoreRating(percentage)

  useEffect(() => {
    if (state !== 'complete') {
      awardRan.current = false
      return
    }
    if (!isPerfect || awardRan.current || !user?.uid || !quizId) return
    awardRan.current = true
    void awardQuizOnceAndUpdateProgress({
      uid: user.uid,
      quizId,
      points: maxPoints,
      subject: quiz?.subject,
      mirrorToProfile: true,
    }).catch(() => { awardRan.current = false })
  }, [isPerfect, maxPoints, quiz?.subject, quizId, state, user?.uid])

  function startQuiz() {
    if (!questions.length) return
    setState('playing')
    setQuestionIndex(0)
    setSelected(null)
    setScore(0)
    setCorrectCount(0)
    setPerfectSoFar(true)
    setTimeLeft(timePer)
  }

  function handleAnswer(index: number) {
    if (selected !== null || state !== 'playing' || !question) return
    const correct = index === question.correctAnswer
    setSelected(index)
    if (!correct) setPerfectSoFar(false)
    if (correct) {
      setScore((value) => value + Number(question.points ?? 0))
      setCorrectCount((value) => value + 1)
    }
    setState('feedback')
  }

  function nextQuestion() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((value) => value + 1)
      setSelected(null)
      setTimeLeft(timePer)
      setState('playing')
    } else {
      setState('complete')
    }
  }

  function restart() {
    setState('start')
    setQuestionIndex(0)
    setSelected(null)
    setScore(0)
    setCorrectCount(0)
    setPerfectSoFar(true)
    setTimeLeft(timePer)
  }

  return <main className={styles.quiz}>
    {loading && <section className={styles.centerPad}><div className={cx(styles.wrap, styles.center)}><div className={`${styles.spinner} spin`} /><p className={styles.muted} style={{ marginTop: 10 }}>Loading quiz…</p></div></section>}

    {!loading && (!quiz || questions.length === 0) && <section className={styles.centerPad}><div className={styles.wrap}><div className={cx(styles.card, styles.padLg, styles.center, styles.stackMd)}><h2 className={styles.h2}>This quiz is empty.</h2><p className={styles.muted}>{error ?? 'Maybe it was removed, or there are no questions yet.'}</p><button className={styles.outlineBtn} type="button" onClick={() => router.back()}>Go Back</button></div></div></section>}

    {!loading && quiz && questions.length > 0 && state === 'start' && <section className={styles.centerPad}><div className={styles.wrap}>
      <button className={styles.ghostBack} type="button" onClick={() => router.back()}>← Back</button>
      <div className={cx(styles.card, styles.padLg, styles.center, styles.stackLg)}><div className={cx(styles.badgeBig, styles.pop)}><Target className={styles.bigIcon} /></div><div className={styles.stackSm}><h1 className={styles.h1}>{quiz.title}</h1><p className={styles.muted}>{quiz.subject} • {quiz.difficulty}</p></div><div className={styles.facts}><div className={styles.factRow}><span className={styles.muted}>Questions:</span><span className={styles.strong}>{questions.length}</span></div><div className={styles.factRow}><span className={styles.muted}>Time per question:</span><span className={styles.strong}>{timePer} seconds</span></div><div className={styles.factRow}><span className={styles.muted}>Max points:</span><span className={styles.strong}>{maxPoints} XP</span></div></div><button className={styles.ctaBtn} type="button" onClick={startQuiz}>Start Quiz <Zap className={styles.mini} /></button></div>
    </div></section>}

    {!loading && state === 'playing' && question && <section className={styles.pad}><div className={styles.wrap}>
      <header className={styles.playingHead}><button className={styles.ghostIcon} type="button" onClick={() => setState('start')} aria-label="Back to start"><ArrowLeft className={styles.mini} /></button><div className={styles.timer}><Clock className={cx(styles.mini, styles.dim)} /><span className={cx(styles.time, timeLeft <= 10 && styles.danger)}>{timeLeft}s</span></div></header>
      <div className={styles.meta}><div className={styles.metaRow}><span className={styles.muted}>Question {questionIndex + 1} of {questions.length}</span><span className={cx(styles.badge, difficultyClass(question.difficulty))}>{question.difficulty}</span></div><div className={cx(styles.progressTrack, styles.small)} role="progressbar" aria-valuenow={progress}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div></div>
      <div className={cx(styles.card, styles.padLg, styles.stackMd)}><div className={cx(styles.center, styles.stackSm)}><span className={styles.outlineBadge}>{question.subject}</span><h2 className={styles.h2}>{question.question}</h2></div></div>
      <div className={styles.stackSm} style={{ marginTop: 14 }}>{question.options.map((option, index) => <button key={`${index}-${option}`} className={styles.optionBtn} type="button" disabled={selected !== null} onClick={() => handleAnswer(index)}><span className={styles.optLetter}>{String.fromCharCode(65 + index)}</span><span className={styles.optText}>{option}</span></button>)}</div>
    </div></section>}

    {!loading && state === 'feedback' && question && <section className={styles.centerPad}><div className={styles.wrap}>
      <div className={cx(styles.card, styles.padLg, styles.stackMd, isCorrect ? styles.okCard : styles.badCard)}><div className={cx(styles.resultIcon, isCorrect ? styles.okIcon : styles.badIcon)}>{isTimeUp ? <Clock className={cx(styles.midIcon, styles.bad)} /> : isCorrect ? <CheckCircle className={cx(styles.midIcon, styles.ok)} /> : <XCircle className={cx(styles.midIcon, styles.bad)} />}</div><div className={cx(styles.center, styles.stackSm)}><h2 className={cx(styles.h2, isCorrect ? styles.okText : styles.badText)}>{isTimeUp ? "Time's Up!" : isCorrect ? 'Correct!' : 'Incorrect!'}</h2>{isCorrect && <p className={cx(styles.okText, styles.strong)}>+{question.points} XP</p>}</div><div className={styles.box}><div className={styles.boxTitle}>Correct Answer:</div><div className={cx(styles.boxText, styles.muted)}>{String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}</div></div><div className={styles.box}><div className={styles.boxTitle}>Explanation:</div><div className={cx(styles.boxText, styles.muted)}>{question.explanation}</div></div></div>
      <button className={styles.ctaBtn} type="button" onClick={nextQuestion}>{questionIndex < questions.length - 1 ? 'Next Question' : 'View Results'} <ChevronRight className={styles.mini} /></button>
    </div></section>}

    {!loading && state === 'complete' && <section className={styles.centerPad}><div className={styles.wrap}><div className={cx(styles.card, styles.padLg, styles.center, styles.stackLg)}><div className={cx(styles.badgeBig, styles.pop, styles.success)}><Trophy className={styles.bigIcon} /></div><div className={styles.stackSm}><h1 className={styles.h1}>Quiz Complete!</h1><p className={cx(styles.rating, rating.className)}>{rating.emoji} {rating.text}</p></div><div className={styles.stats}><div className={styles.statBlock}><div className={styles.statBig}>{score}</div><div className={styles.muted}>Total XP</div></div><div className={styles.statBlock}><div className={styles.statBig}>{percentage}%</div><div className={styles.muted}>Accuracy</div></div></div><div className={styles.center}><div className={styles.statBig}>{correctCount}/{questions.length}</div><div className={styles.muted}>Correct Answers</div></div><div className={styles.stackSm} style={{ width: '100%' }}><button className={styles.ctaBtn} type="button" onClick={restart}>Try Again</button><button className={styles.outlineBtn} type="button" onClick={() => router.push('/dashboard')}>Back to Dashboard</button></div>{isPerfect && <p className={styles.muted} style={{ textAlign: 'center' }}>Perfect run! 🎯 (awards can trigger here)</p>}</div></div></section>}
  </main>
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
