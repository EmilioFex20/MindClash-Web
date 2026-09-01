'use client'

import { useState } from 'react'
import { BookOpen, CheckCircle2, Flame, XCircle } from 'lucide-react'
import styles from './daily-challenge-demo.module.css'

const DEMO_QUESTIONS = [
  {
    subject: 'Data Structures',
    question: 'Which structure follows LIFO order?',
    options: ['Queue', 'Stack', 'Graph'],
    correctIndex: 1,
    xp: 20,
  },
  {
    subject: 'Algorithms',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)'],
    correctIndex: 1,
    xp: 25,
  },
  {
    subject: 'Databases',
    question: 'Which SQL clause filters grouped rows?',
    options: ['WHERE', 'HAVING', 'ORDER BY'],
    correctIndex: 1,
    xp: 25,
  },
] as const

export function DailyChallengeDemo() {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)

  const current = DEMO_QUESTIONS[index]
  const isCorrect = selected === current.correctIndex

  function pick(optionIndex: number) {
    if (selected !== null) return
    setSelected(optionIndex)
    if (optionIndex === current.correctIndex) {
      setXp((value) => value + current.xp)
      setStreak((value) => value + 1)
    } else {
      setStreak(0)
    }
  }

  function next() {
    setSelected(null)
    setIndex((value) => (value + 1) % DEMO_QUESTIONS.length)
  }

  return (
    <div className={styles.previewWindow}>
      <div className={styles.previewTitleBar}>
        <span>DailyChallenge.exe</span>
      </div>
      <div className={styles.previewBody}>
        <div className={styles.previewTopbar}>
          <span className={styles.topicBadge}>
            <BookOpen aria-hidden="true" /> {current.subject}
          </span>
          <span className={styles.streak}>
            <Flame aria-hidden="true" /> {streak}
          </span>
        </div>
        <div className={styles.progressLabel}>
          <span>Try it yourself</span>
          <span>
            {index + 1} of {DEMO_QUESTIONS.length}
          </span>
        </div>
        <div className={styles.progressTrack} aria-hidden="true">
          <span style={{ width: `${((index + 1) / DEMO_QUESTIONS.length) * 100}%` }} />
        </div>
        <p className={styles.questionKicker}>Choose the best answer</p>
        <h2>{current.question}</h2>
        <div className={styles.answers}>
          {current.options.map((option, optionIndex) => {
            const showCorrect = selected !== null && optionIndex === current.correctIndex
            const showWrong = selected === optionIndex && optionIndex !== current.correctIndex
            return (
              <button
                key={option}
                type="button"
                className={`${styles.answerBtn} ${showCorrect ? styles.correctAnswer : ''} ${showWrong ? styles.wrongAnswer : ''}`}
                onClick={() => pick(optionIndex)}
                disabled={selected !== null}
              >
                <span>{option}</span>
                {showCorrect && <CheckCircle2 aria-hidden="true" />}
                {showWrong && <XCircle aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        <div className={styles.previewFooter}>
          <span>+{xp} XP</span>
          {selected === null ? (
            <span className={styles.hint}>Pick an answer</span>
          ) : (
            <button type="button" className={styles.nextBtn} onClick={next}>
              {isCorrect ? 'Nice, next →' : 'Next →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
