'use client'

import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import {
  ArrowLeft,
  Award,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Code,
  Database,
  Edit2,
  Flame,
  Mail,
  Network,
  Save,
  Shield,
  Star,
  Swords,
  Target,
  Trophy,
} from 'lucide-react'
import { BottomNavbar } from '@/components/navigation/bottom-navbar'
import { useUserClaims } from '@/hooks/use-user-claims'
import { useUserProfile } from '@/hooks/use-user-profile'
import { useUserProgress } from '@/hooks/use-user-progress'
import { AVATAR_OPTIONS, computeLevel, masteryLabel, normalizeProgress } from '@/lib/constants'
import styles from '@/components/pages/styles/Profile.module.css'

type Tab = 'overview' | 'stats' | 'activity' | 'settings'

const subjectDefinitions: Array<{
  id: string
  name: string
  icon: ComponentType<{ className?: string }>
  field: string
  color: string
}> = [
  { id: 'programming', name: 'Programming', icon: Code, field: 'programmingProgress', color: '#000080' },
  { id: 'algorithms', name: 'Algorithms', icon: Target, field: 'algorithmsProgress', color: '#008080' },
  { id: 'databases', name: 'Databases', icon: Database, field: 'databasesProgress', color: '#008000' },
  { id: 'networking', name: 'Networking', icon: Network, field: 'networkingProgress', color: '#808000' },
  { id: 'ai', name: 'AI/ML', icon: Brain, field: 'aiProgress', color: '#800080' },
  { id: 'security', name: 'Security', icon: Shield, field: 'securityProgress', color: '#800000' },
]

function cx(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(' ')
}

function formatJoinDate(date: Date | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date)
}

function formatRelativeTime(date: Date | null) {
  if (!date) return ''
  const diffMin = Math.round((Date.now() - date.getTime()) / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

export function ProfileView() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { profile } = useUserProfile()
  const { progress } = useUserProgress()
  const { claims } = useUserClaims(50)
  const [selectedTab, setSelectedTab] = useState<Tab>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [avatarId, setAvatarId] = useState('')

  useEffect(() => {
    setUsername(profile?.username ?? '')
    setAvatarId(profile?.selectedAvatar ?? '')
  }, [profile])

  useEffect(() => {
    setEmail(user?.email ?? '')
  }, [user])

  const totalXp = Math.max(Number(progress.totalXp ?? 0), Number(profile?.xp ?? 0))
  const levelInfo = computeLevel(totalXp)
  const totalPoints = Number(profile?.totalPoints ?? totalXp)
  const streak = Number(profile?.streak ?? 0)
  const quizzesCompleted = Number(progress.quizzesCompleted ?? 0)
  const joinDate = formatJoinDate(profile?.createdAt?.toDate?.() ?? null)

  const duelClaims = useMemo(() => claims.filter((claim) => claim.type === 'duel_award'), [claims])
  const duelsPlayed = duelClaims.length
  const duelsWon = duelClaims.filter((claim) => claim.won).length
  const winRateLabel = duelsPlayed ? `${Math.round((duelsWon / duelsPlayed) * 100)}%` : '—'

  const subjects = useMemo(
    () =>
      subjectDefinitions.map((subject) => {
        const fraction = normalizeProgress(progress[subject.field])
        return { ...subject, progress: fraction, mastery: masteryLabel(fraction) }
      }),
    [progress],
  )

  const selectedAvatar = useMemo(
    () => AVATAR_OPTIONS.find((avatar) => avatar.id === avatarId),
    [avatarId],
  )

  function toggleEdit() {
    setIsEditing((value) => {
      if (value) setIsEditingEmail(false)
      return !value
    })
  }

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await logout()
      window.location.replace('/login')
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <main className={styles.pf}>
      <section className={styles.pad}>
        <div className={styles.wrap}>
          <header className={styles.head}>
            <button className={styles.ghostBack} type="button" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className={styles.mini} /> Back
            </button>
            <h1 className={styles.h1}>Profile</h1>
            <button className={styles.iconBtn} type="button" onClick={toggleEdit} aria-label={isEditing ? 'Save profile' : 'Edit profile'}>
              {isEditing ? <CheckCircle className={styles.mini} /> : <Edit2 className={styles.mini} />}
            </button>
          </header>

          <section className={cx(styles.card, styles.padLg, styles.hero)}>
            <div className={styles.rowTop}>
              <div className={styles.avatarBlob}>
                <span className={styles.avatarEmoji}>{selectedAvatar?.emoji ?? '🙂'}</span>
              </div>
              <div className={styles.grow}>
                <div className={styles.nameBlock}>
                  {isEditing ? (
                    <input className={cx(styles.input, styles.inputTitle)} value={username} placeholder="Your username" onChange={(event) => setUsername(event.target.value)} />
                  ) : <h2 className={styles.h2}>{username || 'Player'}</h2>}
                  <div className={styles.metaRow}>
                    <span className={styles.pill}>Level {levelInfo.level}</span>
                    <span className={styles.dot}>•</span>
                    <span className={cx(styles.muted, styles.small)}>Rank #{String(profile?.rank ?? '—')}</span>
                    <span className={styles.dot}>•</span>
                    <span className={cx(styles.muted, styles.small, styles.metaIcon)}><Calendar className={styles.micro} /> Joined {joinDate}</span>
                  </div>
                  {isEditing ? (
                    <input className={cx(styles.input, styles.inputBio)} value={bio} placeholder="Tell us about yourself..." onChange={(event) => setBio(event.target.value)} />
                  ) : <p className={cx(styles.muted, styles.small, styles.bio)}>{bio || 'No bio yet.'}</p>}
                </div>
              </div>
            </div>
            <div className={styles.xpWrap}>
              <div className={styles.rowBetween}>
                <span className={cx(styles.small, styles.strong)}>Progress to Level {levelInfo.level + 1}</span>
                <span className={cx(styles.small, styles.strong, styles.primaryText)}>{levelInfo.xpWithinLevel}/{levelInfo.xpWithinLevel + levelInfo.xpToNext} XP</span>
              </div>
              <div className={styles.progressTrack} aria-label="XP progress"><div className={styles.progressFill} style={{ width: `${Math.round(levelInfo.progressPct)}%` }} /></div>
            </div>
          </section>

          <section className={styles.statsGrid}>
            <Stat icon={<Flame className={cx(styles.mini, styles.streak)} />} iconClass={styles.bgStreak} value={streak} label="Streak" />
            <Stat icon={<Star className={cx(styles.mini, styles.success)} />} iconClass={styles.bgSuccess} value="—" label="Badges" />
            <Stat icon={<Trophy className={cx(styles.mini, styles.primary)} />} iconClass={styles.bgPrimary} value={totalPoints} label="Points" />
            <Stat icon={<Clock className={cx(styles.mini, styles.secondary)} />} iconClass={styles.bgSecondary} value="—" label="Hours" />
          </section>

          <nav className={styles.tabs} role="tablist" aria-label="Profile tabs">
            {(['overview', 'stats', 'activity', 'settings'] as Tab[]).map((tab) => (
              <button key={tab} className={cx(styles.tab, selectedTab === tab && styles.active)} type="button" role="tab" aria-selected={selectedTab === tab} onClick={() => setSelectedTab(tab)}>
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          {selectedTab === 'overview' && (
            <section className={styles.stackMd}>
              <div className={styles.stackSm}>
                <h3 className={styles.sectionH}>Performance Overview</h3>
                <div className={styles.grid2}>
                  <article className={cx(styles.card, styles.padMd)}>
                    <div className={styles.row}><div className={cx(styles.square, styles.bgPrimary)}><Target className={cx(styles.mini, styles.primary)} /></div><div className={styles.grow}><div className={cx(styles.muted, styles.small)}>Quizzes</div><div className={styles.big}>{quizzesCompleted}</div></div></div>
                    <div className={cx(styles.muted, styles.tiny)}>Completed</div>
                  </article>
                  <article className={cx(styles.card, styles.padMd)}>
                    <div className={styles.row}><div className={cx(styles.square, styles.bgSecondary)}><Swords className={cx(styles.mini, styles.secondary)} /></div><div className={styles.grow}><div className={cx(styles.muted, styles.small)}>Win Rate</div><div className={styles.big}>{winRateLabel}</div></div></div>
                    <div className={cx(styles.muted, styles.tiny)}>{duelsWon}/{duelsPlayed} Duels</div>
                  </article>
                </div>
              </div>
              <div className={styles.stackSm}>
                <h3 className={styles.sectionH}>Subject Mastery</h3>
                <div className={styles.stackSm}>
                  {subjects.map((subject) => {
                    const Icon = subject.icon
                    const pct = Math.round(subject.progress * 100)
                    return <article key={subject.id} className={cx(styles.card, styles.padMd)}><div className={styles.rowBetween}><div className={styles.row}><div className={styles.subjectIcon} style={{ background: subject.color }}><Icon className={cx(styles.mini, styles.white)} /></div><div><div className={styles.strong}>{subject.name}</div><div className={cx(styles.muted, styles.tiny)}>{subject.mastery}</div></div></div><div className={cx(styles.strong, styles.small)}>{pct}%</div></div><div className={cx(styles.progressTrack, styles.sm)} aria-label={`${subject.name} progress`}><div className={styles.progressFill} style={{ width: `${pct}%` }} /></div></article>
                  })}
                </div>
              </div>
              <div className={styles.stackSm}>
                <h3 className={styles.sectionH}>Top Badges</h3>
                <div className={cx(styles.card, styles.padMd)}>
                  <p className={cx(styles.muted, styles.tiny)}>Achievements are coming soon — keep playing to be ready.</p>
                </div>
              </div>
            </section>
          )}

          {selectedTab === 'stats' && (
            <section className={styles.stackMd}>
              <div className={styles.stackSm}>
                <h3 className={styles.sectionH}>Weekly Progress</h3>
                <div className={cx(styles.card, styles.padMd)}>
                  <p className={cx(styles.muted, styles.tiny)}>Week-over-week tracking is coming soon.</p>
                </div>
              </div>
              <div className={styles.stackSm}><h3 className={styles.sectionH}>Detailed Statistics</h3><div className={styles.grid2}>
                <DetailStat icon={<BookOpen className={cx(styles.micro, styles.primary)} />} iconClass={styles.bgPrimary} label="Total Quizzes" value={quizzesCompleted} />
                <DetailStat icon={<Swords className={cx(styles.micro, styles.secondary)} />} iconClass={styles.bgSecondary} label="Total Duels" value={duelsPlayed} />
                <DetailStat icon={<Award className={cx(styles.micro, styles.success)} />} iconClass={styles.bgSuccess} label="Achievements" value="—" />
                <DetailStat icon={<Trophy className={cx(styles.micro, styles.primary)} />} iconClass={styles.bgPrimary} label="Total XP" value={totalPoints} />
              </div></div>
            </section>
          )}

          {selectedTab === 'activity' && (
            <section className={styles.stackMd}>
              <h3 className={styles.sectionH}>Recent Activity</h3>
              {claims.length === 0 ? (
                <div className={cx(styles.card, styles.padMd)}>
                  <p className={cx(styles.muted, styles.tiny)}>No activity yet — play a quiz or duel to see it here.</p>
                </div>
              ) : (
                <div className={styles.stackSm}>
                  {claims.map((claim) => {
                    const isDuel = claim.type === 'duel_award'
                    const title = isDuel ? (claim.won ? 'Won a duel' : 'Lost a duel') : 'Completed a quiz'
                    const icon = isDuel ? '⚔️' : '🎯'
                    const time = formatRelativeTime(claim.createdAt?.toDate?.() ?? null)
                    return (
                      <article key={claim.id} className={cx(styles.card, styles.padMd)}>
                        <div className={styles.row}>
                          <div className={styles.actIcon}>{icon}</div>
                          <div className={cx(styles.grow, styles.min0)}>
                            <div className={cx(styles.strong, styles.small, styles.truncate)}>{title}</div>
                            <div className={cx(styles.muted, styles.tiny)}>+{claim.points} XP • {time}</div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {selectedTab === 'settings' && (
            <section className={styles.stackMd}>
              {isEditing && <section className={styles.stackSm}><h3 className={styles.sectionH}>Choose Avatar</h3><div className={styles.grid3}>{AVATAR_OPTIONS.map((avatar) => <button key={avatar.id} type="button" className={cx(styles.card, styles.avatarPick, avatarId === avatar.id && styles.picked)} onClick={() => setAvatarId(avatar.id)}><div className={styles.pickEmoji}>{avatar.emoji}</div><div className={styles.pickName}>{avatar.name}</div></button>)}</div></section>}
              <section className={styles.stackSm}><h3 className={styles.sectionH}>Account Settings</h3><article className={cx(styles.card, styles.padMd)}>
                <div className={styles.rowBetween}><div className={styles.grow}><div className={styles.rowSm}><Mail className={styles.micro} /><div className={cx(styles.strong, styles.small)}>Email Address</div></div>{isEditingEmail ? <input className={styles.input} type="email" value={email} placeholder="your.email@example.com" onChange={(event) => setEmail(event.target.value)} /> : <div className={cx(styles.muted, styles.small)} style={{ marginTop: 6 }}>{email || '—'}</div>}</div><button className={cx(styles.outlineBtn, styles.sm)} type="button" onClick={() => setIsEditingEmail((value) => !value)}>{isEditingEmail ? <Save className={styles.micro} /> : <Edit2 className={styles.micro} />}<span>{isEditingEmail ? 'Save' : 'Edit'}</span></button></div>
                <SettingRow title="Notifications" description="Receive daily reminders" action="Enable" />
                <SettingRow title="Privacy" description="Control who sees your profile" action="Public" />
                <SettingRow title="Theme" description="Windows 95 theme" action="Change" />
                <SettingRow title="Session" description="Sign out on this device" action={signingOut ? 'Signing out…' : 'Sign Out'} disabled={signingOut} onClick={() => void handleSignOut()} />
              </article></section>
              <section className={styles.stackSm}><h3 className={styles.dangerTitle}>Danger Zone</h3><article className={cx(styles.card, styles.padMd, styles.dangerCard)}><button className={styles.dangerOutline} type="button">Reset Progress</button><button className={styles.dangerSolid} type="button">Delete Account</button></article></section>
            </section>
          )}
        </div>
      </section>
      <BottomNavbar />
    </main>
  )
}

function Stat({ icon, iconClass, value, label }: { icon: React.ReactNode; iconClass: string; value: number | string; label: string }) {
  return <article className={cx(styles.card, styles.stat)}><div className={cx(styles.statIcon, iconClass)}>{icon}</div><div className={styles.statNum}>{value}</div><div className={styles.statLbl}>{label}</div></article>
}

function DetailStat({ icon, iconClass, label, value }: { icon: React.ReactNode; iconClass: string; label: string; value: number | string }) {
  return <article className={cx(styles.card, styles.padMd)}><div className={styles.row}><div className={cx(styles.miniSq, iconClass)}>{icon}</div><div className={cx(styles.muted, styles.small)}>{label}</div></div><div className={styles.big}>{value}</div></article>
}

function SettingRow({ title, description, action, disabled, onClick }: { title: string; description: string; action: string; disabled?: boolean; onClick?: () => void }) {
  return <><div className={styles.divider} /><div className={styles.rowBetween}><div><div className={cx(styles.strong, styles.small)}>{title}</div><div className={cx(styles.muted, styles.tiny)}>{description}</div></div><button className={cx(styles.outlineBtn, styles.sm)} type="button" disabled={disabled} onClick={onClick}>{action}</button></div></>
}
