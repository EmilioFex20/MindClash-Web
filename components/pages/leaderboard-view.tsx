'use client'

import { useMemo, useState, type ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Crown, Flame, Globe, Medal, Star, Users } from 'lucide-react'
import { BottomNavbar } from '@/components/navigation/bottom-navbar'
import { useAuth } from '@/components/auth/auth-provider'
import { useGlobalLeaderboard } from '@/hooks/use-leaderboard'
import { AVATAR_OPTIONS, computeLevel } from '@/lib/constants'
import styles from './styles/Leaderboard.module.css'

type Leader = {
  rank: number
  username: string
  avatar: string
  level: number
  xp: number
  streak: number
  isCurrentUser: boolean
}

function rankBackground(rank: number) {
  if (rank === 1) return styles.bgGold
  if (rank === 2) return styles.bgSilver
  if (rank === 3) return styles.bgBronze
  return styles.bgDefault
}

function RankIcon({ rank }: { rank: number }) {
  const Icon: ComponentType<{ className?: string }> = rank === 1 ? Crown : rank <= 3 ? Medal : Star
  return <Icon className={styles.rankIcon} />
}

function BaseLeaderRow({ user, children }: { user: Leader; children: React.ReactNode }) {
  return (
    <article className={`${styles.card} ${styles.padMd} ${styles.item} ${user.isCurrentUser ? styles.isMe : ''}`}>
      <div className={styles.row}>
        <div className={`${styles.rankBadge} ${rankBackground(user.rank)}`}><span className={styles.emoji}>{user.avatar}</span></div>
        <div className={styles.grow}>
          <div className={styles.rowSm}>
            <div className={styles.name}>{user.username}</div>
            {user.isCurrentUser && <span className={styles.youPill}>You</span>}
          </div>
          {children}
        </div>
        <div className={styles.right}><RankIcon rank={user.rank} /></div>
      </div>
    </article>
  )
}

function ComingSoon({ message }: { message: string }) {
  return (
    <div className={`${styles.card} ${styles.padMd}`}>
      <p className={`${styles.muted} ${styles.small}`}>{message}</p>
    </div>
  )
}

export function LeaderboardView() {
  const router = useRouter()
  const { user } = useAuth()
  const { entries, loading } = useGlobalLeaderboard(25)
  const [selectedTab, setSelectedTab] = useState<'global' | 'friends' | 'weekly' | 'subjects'>('global')
  const tabs = [
    ['global', 'Global'], ['friends', 'Friends'], ['weekly', 'Weekly'], ['subjects', 'Subjects'],
  ] as const

  const leaders = useMemo<Leader[]>(
    () =>
      entries.map((entry, index) => ({
        rank: index + 1,
        username: entry.username ?? 'Player',
        avatar: AVATAR_OPTIONS.find((avatar) => avatar.id === entry.selectedAvatar)?.emoji ?? '👤',
        level: computeLevel(Number(entry.totalPoints ?? 0)).level,
        xp: Number(entry.totalPoints ?? 0),
        streak: Number(entry.streak ?? 0),
        isCurrentUser: entry.uid === user?.uid,
      })),
    [entries, user],
  )
  const currentUser = leaders.find((leader) => leader.isCurrentUser)

  return (
    <main className={styles.lb}>
      <section className={styles.pad}>
        <div className={styles.wrap}>
          <header className={styles.head}>
            <button className={styles.ghostBack} type="button" onClick={() => router.back()}><ArrowLeft className={styles.mini} />Back</button>
            <h1 className={styles.h1}>Leaderboard</h1><div className={styles.spacer} />
          </header>

          {currentUser && (
            <div className={`${styles.card} ${styles.padMd} ${styles.meCard}`}>
              <div className={styles.row}>
                <div className={`${styles.rankBadge} ${rankBackground(currentUser.rank)}`}><span className={styles.emoji}>{currentUser.avatar}</span></div>
                <div className={styles.grow}>
                  <div className={styles.rowSm}><div className={styles.name}>{currentUser.username}</div><span className={styles.youPill}>You</span></div>
                  <div className={`${styles.muted} ${styles.small}`}>Rank #{currentUser.rank} • Level {currentUser.level} • {currentUser.xp} XP</div>
                </div>
                <div className={styles.right}><RankIcon rank={currentUser.rank} /></div>
              </div>
            </div>
          )}

          <div className={styles.tabs}>
            {tabs.map(([key, label]) => (
              <button key={key} className={`${styles.tab} ${selectedTab === key ? styles.active : ''}`} type="button" onClick={() => setSelectedTab(key)}>{label}</button>
            ))}
          </div>

          {selectedTab === 'global' && (
            <section className={styles.stackMd}>
              <div className={styles.sectionTitle}><Globe className={`${styles.mini} ${styles.primary}`} /><h2 className={styles.h2}>Global Rankings</h2></div>
              {!loading && leaders.length === 0 ? (
                <ComingSoon message="No rankings yet — complete a quiz or duel to be the first on the board." />
              ) : (
                <div className={styles.stackSm}>
                  {leaders.map((leader) => (
                    <BaseLeaderRow key={leader.rank} user={leader}>
                      <div className={styles.meta}><span>Level {leader.level}</span><span>{leader.xp} XP</span><span className={styles.metaIcon}><Flame className={`${styles.micro} ${styles.streak}`} />{leader.streak}</span></div>
                    </BaseLeaderRow>
                  ))}
                </div>
              )}
            </section>
          )}

          {selectedTab === 'friends' && (
            <section className={styles.stackMd}>
              <div className={styles.sectionTitle}><Users className={`${styles.mini} ${styles.secondary}`} /><h2 className={styles.h2}>Friends Rankings</h2></div>
              <ComingSoon message="Friends aren't a thing yet in ICC Clash — this tab is reserved for when they are." />
            </section>
          )}

          {selectedTab === 'weekly' && (
            <section className={styles.stackMd}>
              <div className={styles.sectionTitle}><Star className={`${styles.mini} ${styles.accent}`} /><h2 className={styles.h2}>This Week&apos;s Top Performers</h2></div>
              <ComingSoon message="Weekly rankings need XP tracked week-over-week — coming soon." />
            </section>
          )}

          {selectedTab === 'subjects' && (
            <section className={styles.stackMd}>
              <div className={styles.sectionTitle}><Star className={`${styles.mini} ${styles.primary}`} /><h2 className={styles.h2}>Subject Rankings</h2></div>
              <ComingSoon message="Per-subject rankings are coming soon." />
            </section>
          )}
        </div>
        <BottomNavbar />
      </section>
    </main>
  )
}
