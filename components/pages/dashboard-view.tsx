'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, limit, onSnapshot, query } from 'firebase/firestore'
import {
  Bell,
  BookOpen,
  Brain,
  ChevronRight,
  Clock,
  Code,
  Database,
  Flame,
  Gift,
  Network,
  Play,
  Settings,
  Shield,
  Star,
  Swords,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { BottomNavbar } from '@/components/navigation/bottom-navbar'
import { useUserClaims } from '@/hooks/use-user-claims'
import { useUserProfile } from '@/hooks/use-user-profile'
import { useUserProgress } from '@/hooks/use-user-progress'
import { AVATAR_OPTIONS, computeLevel, normalizeProgress, XP_PER_LEVEL } from '@/lib/constants'
import { db } from '@/lib/firebase/client'
import type { QuizMeta } from '@/types/domain'
import styles from './styles/Dashboard.module.css'

function useDailyChallenges(count = 3) {
  const [quizzes, setQuizzes] = useState<QuizMeta[]>([])

  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'quizzes'), limit(count)),
      (snapshot) => {
        setQuizzes(
          snapshot.docs.map((quizSnapshot) => ({ id: quizSnapshot.id, ...quizSnapshot.data() }) as QuizMeta),
        )
      },
      () => setQuizzes([]),
    )
  }, [count])

  return quizzes
}

const subjectDefinitions: Array<{ id: string; name: string; icon: LucideIcon; field: string }> = [
  { id: 'programming', name: 'Programming', icon: Code, field: 'programmingProgress' },
  { id: 'algorithms', name: 'Algorithms', icon: Target, field: 'algorithmsProgress' },
  { id: 'databases', name: 'Databases', icon: Database, field: 'databasesProgress' },
  { id: 'networking', name: 'Networking', icon: Network, field: 'networkingProgress' },
  { id: 'ai', name: 'AI/ML', icon: Brain, field: 'aiProgress' },
  { id: 'security', name: 'Security', icon: Shield, field: 'securityProgress' },
]

const subjectColors: Record<string, string> = {
  programming: '#000080',
  algorithms: '#008080',
  databases: '#008000',
  networking: '#808000',
  ai: '#800080',
  security: '#800000',
}

function difficultyClass(difficulty: string) {
  if (difficulty === 'Easy') return styles.bEasy
  if (difficulty === 'Medium') return styles.bMed
  return styles.bHard
}

export function DashboardView() {
  const router = useRouter()
  const { profile } = useUserProfile()
  const { progress } = useUserProgress()
  const { claims } = useUserClaims()
  const dailyQuizzes = useDailyChallenges(3)
  const totalXp = Math.max(Number(progress.totalXp ?? 0), Number(profile?.xp ?? 0))
  const levelInfo = computeLevel(totalXp)
  const xpPercent = Math.round(levelInfo.progressPct)
  const avatarEmoji =
    AVATAR_OPTIONS.find((avatar) => avatar.id === profile?.selectedAvatar)?.emoji ?? '👤'
  const subjects = useMemo(
    () =>
      subjectDefinitions.map((subject) => ({
        ...subject,
        progress: normalizeProgress(progress[subject.field]),
      })),
    [progress],
  )
  const userData = {
    streak: Number(profile?.streak ?? 0),
    totalPoints: Number(profile?.totalPoints ?? totalXp),
    rank: profile?.rank ?? '—',
    completedToday: Number(profile?.completedToday ?? 0),
  }
  const dailyChallenges = useMemo(
    () =>
      dailyQuizzes.map((quiz) => ({
        id: quiz.id ?? '',
        title: quiz.title,
        subject: quiz.subject,
        xp: Number(quiz.maxPoints ?? 0),
        difficulty: quiz.difficulty,
        completed: claims.some((claim) => claim.type === 'quiz_award' && claim.quizId === quiz.id),
      })),
    [dailyQuizzes, claims],
  )

  const go = (path: string) => router.push(path)

  return (
    <main className={styles.dash}>
      <header className={`${styles.wrap} ${styles.top}`}>
        <div className={styles.row}>
          <div className={styles.user}>
            <div className={styles.avatarBox} aria-hidden="true">
              <span className={styles.avatarEmoji}>{avatarEmoji}</span>
            </div>
            <div>
              <div className={styles.hello}>Hi, {profile?.username ?? 'sin nombre'}!</div>
              <div className={styles.sub}>
                Level {levelInfo.level} • Rank #{String(userData.rank)}
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.iconBtn} type="button" onClick={() => go('/profile')} aria-label="Profile">
              <Gift className={styles.i} />
            </button>
            <button className={styles.iconBtn} type="button" aria-label="Notifications">
              <Bell className={styles.i} />
            </button>
            <button className={styles.iconBtn} type="button" onClick={() => go('/profile')} aria-label="Settings">
              <Settings className={styles.i} />
            </button>
          </div>
        </div>

        <section className={`${styles.card} ${styles.xpCard}`}>
          <div className={styles.xpRow}>
            <span className={styles.xpLabel}>Progress to Level {levelInfo.level + 1}</span>
            <span className={styles.xpValue}>
              {levelInfo.xpWithinLevel}/ {XP_PER_LEVEL} XP
            </span>
          </div>
          <div className={styles.progressTrack} role="progressbar" aria-valuenow={xpPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className={styles.progressFill} style={{ width: `${xpPercent}%` }} />
          </div>
          <div className={styles.xpHint}>
            <span>Keep going! You&apos;re doing great</span>
            <span className={styles.xpToGo}>{levelInfo.xpToNext} XP to go</span>
          </div>
        </section>
      </header>

      <section className={styles.wrap}>
        <div className={styles.grid4}>
          <button className={`${styles.card} ${styles.stat}`} type="button" onClick={() => go('/profile')}>
            <div className={`${styles.statIcon} ${styles.bgPink}`}><Flame className={styles.i} /></div>
            <div className={styles.statNum}>{userData.streak}</div>
            <div className={styles.statLbl}>Streak</div>
          </button>
          <button className={`${styles.card} ${styles.stat}`} type="button" onClick={() => go('/profile')}>
            <div className={`${styles.statIcon} ${styles.bgGreen}`}><Star className={styles.i} /></div>
            <div className={styles.statNum}>—</div>
            <div className={styles.statLbl}>Badges</div>
          </button>
          <div className={`${styles.card} ${styles.stat}`}>
            <div className={`${styles.statIcon} ${styles.bgIndigo}`}><Trophy className={styles.i} /></div>
            <div className={styles.statNum}>{userData.totalPoints}</div>
            <div className={styles.statLbl}>Points</div>
          </div>
          <div className={`${styles.card} ${styles.stat}`}>
            <div className={`${styles.statIcon} ${styles.bgPurple}`}><Clock className={styles.i} /></div>
            <div className={styles.statNum}>{userData.completedToday}</div>
            <div className={styles.statLbl}>Today</div>
          </div>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.section}`}>
        <div className={styles.sectionHead}>
          <h2 className={styles.h2}>Daily Challenges</h2>
          <button className={styles.linkBtn} type="button" onClick={() => go('/quizzes')}>
            View All <ChevronRight className={styles.mini} />
          </button>
        </div>
        <div className={styles.stack}>
          {dailyChallenges.length === 0 ? (
            <div className={`${styles.card} ${styles.padMd}`}>
              <p className={styles.chSub}>No quizzes published yet.</p>
            </div>
          ) : (
            dailyChallenges.map((challenge) => (
              <article
                key={challenge.id}
                className={`${styles.card} ${styles.challenge} ${challenge.completed ? styles.done : ''}`}
                onClick={() => !challenge.completed && go(`/quizzes/${challenge.id}`)}
                onKeyDown={(event) => {
                  if (!challenge.completed && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault()
                    go(`/quizzes/${challenge.id}`)
                  }
                }}
                role="button"
                tabIndex={challenge.completed ? -1 : 0}
                aria-disabled={challenge.completed}
              >
                <div className={`${styles.chIcon} ${challenge.completed ? styles.chDone : styles.chTodo}`}>
                  {challenge.completed ? <Star className={`${styles.chI} ${styles.doneI}`} /> : <BookOpen className={`${styles.chI} ${styles.todoI}`} />}
                </div>
                <div className={styles.chBody}>
                  <div className={styles.chTop}>
                    <div className={styles.chTitle}>{challenge.title}</div>
                    <span className={`${styles.badge} ${difficultyClass(challenge.difficulty)}`}>{challenge.difficulty}</span>
                  </div>
                  <div className={styles.chSub}>{challenge.subject} • +{challenge.xp} XP</div>
                </div>
                {!challenge.completed && (
                  <button className={styles.playBtn} type="button" onClick={(event) => { event.stopPropagation(); go(`/quizzes/${challenge.id}`) }} aria-label="Start">
                    <Play className={styles.mini} />
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.section}`}>
        <h2 className={styles.h2}>Your Progress</h2>
        <div className={styles.grid2}>
          {subjects.map((subject) => {
            const Icon = subject.icon
            const openSubject = () => go(`/quizzes?subject=${encodeURIComponent(subject.name)}`)
            return (
              <article key={subject.id} className={`${styles.card} ${styles.subject}`} onClick={openSubject} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openSubject() }} role="button" tabIndex={0}>
                <div className={styles.subRow}>
                  <div className={styles.subIcon} style={{ background: subjectColors[subject.id] }}>
                    <Icon className={styles.miniW} />
                  </div>
                  <div className={styles.subMeta}>
                    <div className={styles.subName}>{subject.name}</div>
                    <div className={styles.subPct}>{Math.round(subject.progress * 100)}%</div>
                  </div>
                </div>
                <div className={`${styles.progressTrack} ${styles.small}`}>
                  <div className={styles.progressFill} style={{ width: `${subject.progress * 100}%` }} />
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.section}`}>
        <h2 className={styles.h2}>Quick Actions</h2>
        <div className={styles.grid2}>
          <button className={`${styles.card} ${styles.quick}`} type="button" onClick={() => go('/duel')}>
            <div className={`${styles.quickIcon} ${styles.bgIndigo}`}><Swords className={styles.miniW} /></div>
            <div><div className={styles.quickTitle}>1v1 Duel</div><div className={styles.quickSub}>Challenge friends</div></div>
          </button>
          <button className={`${styles.card} ${styles.quick}`} type="button" onClick={() => go('/leaderboard')}>
            <div className={`${styles.quickIcon} ${styles.bgPurple}`}><Trophy className={styles.miniW} /></div>
            <div><div className={styles.quickTitle}>Leaderboard</div><div className={styles.quickSub}>See rankings</div></div>
          </button>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.section} ${styles.last}`}>
        <h2 className={styles.h2}>Recent Achievements</h2>
        <div className={`${styles.card} ${styles.padMd}`}>
          <p className={styles.chSub}>Achievements are coming soon — keep playing to be ready.</p>
        </div>
      </section>
      <BottomNavbar />
    </main>
  )
}
