import Link from 'next/link'
import { ArrowLeft, Sparkles, Swords, Trophy, Zap } from 'lucide-react'
import type { ReactNode } from 'react'
import { BrandMark } from '@/components/brand/brand-mark'
import styles from './auth-layout.module.css'

type AuthLayoutProps = {
  children: ReactNode
  mode: 'login' | 'register'
}

const messages = {
  login: {
    kicker: 'Welcome back',
    title: 'Your next win is waiting.',
    text: 'Pick up where you left off and keep building the skills that make hard concepts feel easy.',
  },
  register: {
    kicker: 'Start your journey',
    title: 'One account. A world of challenges.',
    text: 'Build a learning streak, test your knowledge, and make every study session count.',
  },
} as const

export function AuthLayout({ children, mode }: AuthLayoutProps) {
  const message = messages[mode]

  return (
    <div className={`${styles.page} bg-stars`}>
      <div className={styles.window}>
        <div className={styles.titleBar}>
          <BrandMark compact onTitleBar />
          <span className={styles.titleBarText}>
            ICC Clash - {mode === 'login' ? 'Log in' : 'Create account'}
          </span>
        </div>

        <header className={styles.header}>
          <Link className={styles.backLink} href="/">
            <ArrowLeft aria-hidden="true" />
            Back to home
          </Link>
        </header>

        <main className={styles.main}>
          <aside className={styles.story}>
            <p className={styles.kicker}>
              <Sparkles aria-hidden="true" /> {message.kicker}
            </p>
            <h1>{message.title}</h1>
            <p className={styles.storyText}>{message.text}</p>
            <div className={styles.benefits} aria-label="ICC Clash benefits">
              <div>
                <span className={styles.iconBox} aria-hidden="true">
                  <Swords />
                </span>
                <p>
                  <strong>Short, focused practice</strong>
                  Learn at your pace with challenges that fit your day.
                </p>
              </div>
              <div>
                <span className={styles.iconBox} aria-hidden="true">
                  <Trophy />
                </span>
                <p>
                  <strong>Progress you can feel</strong>
                  Turn consistent practice into streaks, XP, and mastery.
                </p>
              </div>
            </div>
            <div className={styles.quote}>
              <Zap aria-hidden="true" />
              <p>
                A little progress every day adds up.
                <span>Keep your momentum alive.</span>
              </p>
            </div>
          </aside>

          <section className={styles.formArea} aria-label={`${mode} form`}>
            {children}
          </section>
        </main>

        <footer className={styles.footer}>
          <span className={styles.statusField}>Learn. Challenge. Grow.</span>
        </footer>
      </div>
    </div>
  )
}
