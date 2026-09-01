'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Sparkles, Target, User } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { FullPageLoader } from '@/components/auth/full-page-loader'
import { AVATAR_OPTIONS } from '@/lib/constants'
import { getProfile, saveOnboarding } from '@/lib/users'
import styles from './styles/Onboarding.module.css'

const STEPS = [
  { id: 'welcome', title: 'Welcome to ICC Clash!', progress: 25 },
  { id: 'profile', title: 'Create Your Profile', progress: 50 },
  { id: 'goals', title: 'Set Your Goals', progress: 75 },
  { id: 'ready', title: 'Ready to Start!', progress: 100 },
] as const

const LEARNING_GOALS = [
  { id: 'beginner', title: 'Just Starting', subtitle: '5-10 min/day', icon: '🌱' },
  { id: 'casual', title: 'Casual Learner', subtitle: '10-15 min/day', icon: '📚' },
  { id: 'serious', title: 'Serious Student', subtitle: '15-30 min/day', icon: '🎯' },
  { id: 'intense', title: 'Code Warrior', subtitle: '30+ min/day', icon: '⚡' },
] as const

type OnboardingData = {
  username: string
  selectedAvatar: string
  learningGoal: string
}

export function OnboardingView() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<OnboardingData>({
    username: '',
    selectedAvatar: '',
    learningGoal: '',
  })

  useEffect(() => {
    if (!user) return
    let active = true
    void getProfile(user.uid)
      .then((profile) => {
        if (!active) return
        const complete =
          Boolean(profile?.username?.trim()) &&
          Boolean(profile?.selectedAvatar) &&
          Boolean(profile?.learningGoal)
        if (complete) {
          router.replace('/dashboard')
          return
        }
        if (profile) {
          setUserData({
            username: String(profile.username ?? ''),
            selectedAvatar: String(profile.selectedAvatar ?? ''),
            learningGoal: String(profile.learningGoal ?? ''),
          })
        }
      })
      .catch((profileError) => {
        if (active) setError(profileError instanceof Error ? profileError.message : 'Profile error')
      })
      .finally(() => {
        if (active) setCheckingProfile(false)
      })
    return () => {
      active = false
    }
  }, [router, user])

  const currentStepData = STEPS[currentStep]
  const selectedAvatar = AVATAR_OPTIONS.find((avatar) => avatar.id === userData.selectedAvatar)
  const selectedGoal = LEARNING_GOALS.find((goal) => goal.id === userData.learningGoal)
  const canProceed = useMemo(() => {
    if (currentStep === 1) return userData.username.trim().length >= 3 && !!userData.selectedAvatar
    if (currentStep === 2) return !!userData.learningGoal
    return true
  }, [currentStep, userData])

  async function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((step) => step + 1)
      return
    }
    if (!user) return
    setSaving(true)
    setError(null)
    try {
      await saveOnboarding(user.uid, {
        username: userData.username.trim(),
        selectedAvatar: userData.selectedAvatar,
        learningGoal: userData.learningGoal,
      })
      router.replace('/dashboard')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Error saving onboarding')
      setSaving(false)
    }
  }

  if (checkingProfile) return <FullPageLoader label="Checking your profile" />

  return (
    <main className={styles.ob}>
      <header className={styles.top}>
        <div className={styles.topRow}>
          <button
            className={styles.iconBtn}
            type="button"
            onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
            disabled={currentStep === 0}
            aria-label="Back"
          >
            <ChevronLeft className={styles.icon} />
          </button>
          <div className={styles.stepCount}>
            {currentStep + 1} of {STEPS.length}
          </div>
          <div style={{ width: 44 }} />
        </div>
        <div className={styles.topInfo}>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuenow={currentStepData.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className={styles.progressFill} style={{ width: `${currentStepData.progress}%` }} />
          </div>
          <h1 className={styles.topTitle}>{currentStepData.title}</h1>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.card}>
          {currentStep === 0 && (
            <div className={`${styles.center} ${styles['stack-lg']}`}>
              <div className={`${styles.bigBadge} ${styles.pop}`}>
                <Sparkles className={styles.bigIcon} />
              </div>
              <div className={styles['stack-sm']}>
                <h2 className={styles.h2}>Welcome to ICC Clash!</h2>
                <p className={styles.muted}>
                  Let&apos;s set up your learning adventure. This will only take a minute!
                </p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className={styles['stack-lg']}>
              <div className={`${styles.center} ${styles['stack-sm']}`}>
                <div className={styles.midBadge}>
                  <User className={`${styles.midIcon} ${styles.primary}`} />
                </div>
                <h2 className={styles.h3}>Create Your Profile</h2>
                <p className={`${styles.muted} ${styles.small}`}>Choose a username and avatar</p>
              </div>
              <div className={styles['stack-md']}>
                <div>
                  <label className={styles.label} htmlFor="username">
                    Username
                  </label>
                  <input
                    id="username"
                    className={styles.input}
                    placeholder="Enter your username"
                    value={userData.username}
                    maxLength={24}
                    onChange={(event) =>
                      setUserData((data) => ({ ...data, username: event.target.value }))
                    }
                  />
                  <div
                    className={`${styles.hint} ${userData.username.trim().length >= 3 ? styles.ok : ''}`}
                  >
                    {userData.username.length}/24 • min 3 chars
                  </div>
                </div>
                <div>
                  <div className={styles.label}>Choose Your Avatar</div>
                  <div className={styles.avatarGrid}>
                    {AVATAR_OPTIONS.map((avatar) => (
                      <button
                        key={avatar.id}
                        type="button"
                        className={`${styles.avatarCard} ${userData.selectedAvatar === avatar.id ? styles.selected : ''}`}
                        onClick={() =>
                          setUserData((data) => ({ ...data, selectedAvatar: avatar.id }))
                        }
                      >
                        <div className={styles.emoji}>{avatar.emoji}</div>
                        <div className={styles.avatarName}>{avatar.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className={styles['stack-lg']}>
              <div className={`${styles.center} ${styles['stack-sm']}`}>
                <div className={`${styles.midBadge} ${styles.secondaryBg}`}>
                  <Target className={`${styles.midIcon} ${styles.secondary}`} />
                </div>
                <h2 className={styles.h3}>Set Your Goals</h2>
                <p className={`${styles.muted} ${styles.small}`}>
                  How much time can you dedicate daily?
                </p>
              </div>
              <div className={styles['stack-sm']}>
                {LEARNING_GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    className={`${styles.goalRow} ${userData.learningGoal === goal.id ? styles.selected2 : ''}`}
                    onClick={() => setUserData((data) => ({ ...data, learningGoal: goal.id }))}
                  >
                    <div className={styles.goalIcon}>{goal.icon}</div>
                    <div className={styles.goalBody}>
                      <div className={styles.goalTitle}>{goal.title}</div>
                      <div className={styles.goalSub}>{goal.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className={`${styles.center} ${styles['stack-lg']}`}>
              <div className={`${styles.bigBadge} ${styles.pop} ${styles.success}`}>
                <div className={styles.emojiBig}>{selectedAvatar?.emoji ?? '🎉'}</div>
              </div>
              <div className={styles['stack-sm']}>
                <h2 className={styles.h2}>You&apos;re All Set, {userData.username || 'friend'}!</h2>
                <p className={styles.muted}>
                  Ready to start your coding adventure? Let&apos;s begin with your first lesson!
                </p>
              </div>
              <div className={styles.summary}>
                <div className={styles.summaryTitle}>Your Profile:</div>
                <div className={styles.summaryText}>
                  {selectedAvatar?.name ?? 'New Adventurer'} • {selectedGoal?.title ?? '—'}
                </div>
              </div>
            </div>
          )}
          {error && <p style={{ color: '#ff0000', fontWeight: 700, marginTop: 16 }}>{error}</p>}
        </div>
      </section>

      <footer className={styles.footer}>
        <button
          className={`${styles.ctaBtn} ${saving ? styles.pulse : ''}`}
          type="button"
          onClick={handleNext}
          disabled={!canProceed || saving}
        >
          {currentStep === STEPS.length - 1 ? (saving ? 'Saving...' : 'Start Learning!') : 'Continue'}
          <ChevronRight className={styles.ctaIcon} />
        </button>
      </footer>
    </main>
  )
}
