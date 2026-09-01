'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Trophy, Users, Zap } from 'lucide-react'
import styles from './styles/Home.module.css'

const features = [
  { title: 'Daily Streaks', text: 'Keep learning every day', icon: Zap, tone: 'chip--pink' },
  { title: '1v1 Duels', text: 'Challenge friends', icon: Users, tone: 'chip--blue' },
  { title: 'Smart Quizzes', text: 'Adaptive learning', icon: Target, tone: 'chip--teal' },
  { title: 'Leaderboards', text: 'Compete globally', icon: Trophy, tone: 'chip--green' },
] as const

export function HomeView() {
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)

  function handleGetStarted() {
    setIsAnimating(true)
    window.setTimeout(() => setIsAnimating(false), 650)
    router.push('/onboarding')
  }

  return (
    <main className={styles.screen}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.logo} aria-hidden="true">
            <Trophy className={styles.logoIcon} />
          </div>
          <h1 className={styles.title}>ICC Clash</h1>
          <p className={styles.subtitle}>
            Master Computer Science through fun,
            <br />
            gamified learning
          </p>
        </header>

        <section className={styles.grid} aria-label="Features">
          {features.map(({ title, text, icon: Icon, tone }) => (
            <article key={title} className={styles.card}>
              <div className={`${styles.chip} ${styles[tone]}`} aria-hidden="true">
                <Icon className={styles.chipIcon} />
              </div>
              <h2 className={styles.cardTitle}>{title}</h2>
              <p className={styles.cardText}>{text}</p>
            </article>
          ))}
        </section>

        <section className={styles.cta}>
          <button
            className={`${styles.ctaBtn} ${isAnimating ? styles.pulse : ''}`}
            type="button"
            onClick={handleGetStarted}
          >
            Start Your Journey
          </button>
          <p className={styles.foot}>Join thousands of students mastering CS concepts</p>
        </section>
      </section>
    </main>
  )
}
