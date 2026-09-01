'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { onSnapshot } from 'firebase/firestore'
import { useAuth } from '@/components/auth/auth-provider'
import { useMatch } from '@/hooks/use-match'
import { usePresence } from '@/hooks/use-presence'
import styles from '@/components/pages/styles/Duel.module.css'
import {
  abandonIfStillWaiting,
  awardDuelOnce,
  fetchQuestionsByRefs,
  findOrCreateOpenMatch,
  joinOpenMatch,
  pickDuelQuestionRefs,
  submitAnswer,
  tryAdvance,
} from '@/lib/duel'
import {
  acceptInvite,
  declineInvite,
  listenIncomingInvites,
  sendInvite,
  type IncomingInvite,
} from '@/lib/invites'
import { onlineUsersQuery } from '@/lib/presence'
import type { QuizQuestion } from '@/types/domain'

const howItWorks = [
  'Answer questions faster than your opponent',
  'Each correct answer gives you 100 points',
  'Highest score wins the duel!',
]

type OnlineUser = {
  uid: string
  selectedAvatar?: string
  username?: string
  online?: boolean
}

function cx(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(' ')
}

export function DuelView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [matchId, setMatchId] = useState<string | null>(
    () => searchParams.get('matchId')?.trim() || null,
  )
  const [finding, setFinding] = useState(false)
  const [invitingUid, setInvitingUid] = useState<string | null>(null)
  const [pendingInvites, setPendingInvites] = useState<IncomingInvite[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const seenInviteIds = useRef(new Set<string>())
  const awardRan = useRef(false)
  const advancingQuestion = useRef<string | null>(null)
  const { match, remainingMs } = useMatch(matchId)

  usePresence(uid)

  useEffect(() => {
    if (!uid) {
      setOnlineUsers([])
      return
    }
    return onSnapshot(
      onlineUsersQuery(),
      (snapshot) => {
        setOnlineUsers(
          snapshot.docs
            .map(
              (document) =>
                ({
                  uid: document.id,
                  ...document.data(),
                }) as OnlineUser,
            )
            .filter((candidate) => candidate.uid !== uid),
        )
      },
      () => setOnlineUsers([]),
    )
  }, [uid])

  useEffect(() => {
    setPendingInvites([])
    seenInviteIds.current.clear()
    if (!uid) return
    return listenIncomingInvites(uid, (invites) => {
      const fresh = invites.filter((invite) => !seenInviteIds.current.has(invite.id))
      fresh.forEach((invite) => seenInviteIds.current.add(invite.id))
      if (fresh.length) setPendingInvites((current) => [...fresh, ...current])
    })
  }, [uid])

  useEffect(() => {
    if (!uid || !matchId || !match) return
    if (match.status === 'waiting' && match.hostUid !== uid && !match.opponentUid) {
      void joinOpenMatch(matchId, uid).catch(() => undefined)
    }
  }, [match, matchId, uid])

  useEffect(() => {
    setSelectedAnswer(null)
    advancingQuestion.current = null
  }, [match?.currentIndex])

  useEffect(() => {
    const refs = match?.questionIds
    if (!refs?.length) {
      setQuestions([])
      return
    }
    let cancelled = false
    void fetchQuestionsByRefs(refs).then((loaded) => {
      if (!cancelled) setQuestions(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [match?.questionIds])

  useEffect(() => {
    if (!match || match.status !== 'active' || (remainingMs ?? 1) > 0) return
    const key = `${match.id}:${match.currentIndex}`
    if (advancingQuestion.current === key) return
    advancingQuestion.current = key
    void tryAdvance(match.id).catch(() => {
      advancingQuestion.current = null
    })
  }, [match, remainingMs])

  const opponentUid = useMemo(() => {
    if (!uid || !match) return null
    return match.hostUid === uid ? (match.opponentUid ?? null) : match.hostUid
  }, [match, uid])
  const yourScore = uid && match ? Number(match.scores?.[uid] ?? 0) : 0
  const opponentScore = match && opponentUid ? Number(match.scores?.[opponentUid] ?? 0) : 0
  const youWon = Boolean(
    uid && match && (match.winnerUid == null ? yourScore > opponentScore : match.winnerUid === uid),
  )
  const opponentWon = Boolean(
    uid &&
      match &&
      (match.winnerUid == null ? opponentScore > yourScore : match.winnerUid === opponentUid),
  )
  const isDraw = yourScore === opponentScore

  useEffect(() => {
    if (match?.status !== 'finished') {
      awardRan.current = false
      return
    }
    if (!uid || awardRan.current) return
    awardRan.current = true
    void awardDuelOnce({
      uid,
      matchId: match.id,
      points: youWon ? 300 : 100,
      won: youWon,
      mirrorToProfile: true,
    }).catch(() => {
      awardRan.current = false
    })
  }, [match, uid, youWon])

  const stage = !matchId
    ? 'lobby'
    : !match || match.status === 'waiting'
      ? 'waiting'
      : match.status === 'active'
        ? 'active'
        : match.status === 'finished'
          ? 'finished'
          : 'waiting'
  const currentQuestion = questions[match?.currentIndex ?? 0]
  const totalQuestions = match?.questionIds?.length ?? questions.length
  const progress = Math.max(
    0,
    Math.min(100, (((match?.currentIndex ?? 0) + 1) / Math.max(1, totalQuestions)) * 100),
  )

  async function quickMatch() {
    if (!uid || finding) return
    setFinding(true)
    try {
      const refs = await pickDuelQuestionRefs(3)
      setMatchId(String(await findOrCreateOpenMatch(uid, refs, 15_000)))
    } finally {
      setFinding(false)
    }
  }

  async function inviteUser(targetUid: string) {
    if (!uid || invitingUid) return
    setInvitingUid(targetUid)
    try {
      const refs = await pickDuelQuestionRefs(3)
      const result = await sendInvite({
        fromUid: uid,
        toUid: targetUid,
        questionIds: refs,
        perQuestionMs: 15_000,
      })
      if (result.matchId) setMatchId(result.matchId)
    } finally {
      setInvitingUid(null)
    }
  }

  async function handleAcceptInvite(invite: IncomingInvite) {
    if (!uid) return
    try {
      setMatchId(String(await acceptInvite({ toUid: uid, inviteId: invite.id })))
    } finally {
      setPendingInvites((current) => current.filter((item) => item.id !== invite.id))
    }
  }

  async function handleDeclineInvite(invite: IncomingInvite) {
    if (!uid) return
    try {
      await declineInvite({ toUid: uid, inviteId: invite.id })
    } finally {
      setPendingInvites((current) => current.filter((item) => item.id !== invite.id))
    }
  }

  async function pickAnswer(index: number) {
    if (!uid || !match || !currentQuestion || match.status !== 'active' || selectedAnswer !== null)
      return
    setSelectedAnswer(index)
    await submitAnswer({
      matchId: match.id,
      uid,
      index: match.currentIndex,
      choice: index,
      correctChoice: currentQuestion.correctAnswer,
      points: Number(currentQuestion.points ?? 100),
    })
    await tryAdvance(match.id)
  }

  async function cancelWaiting() {
    if (uid && matchId) {
      try {
        await abandonIfStillWaiting(matchId, uid)
      } finally {
        setMatchId(null)
      }
    } else setMatchId(null)
  }

  const invite = pendingInvites[0]
  const result = youWon
    ? {
        title: 'Victory!',
        subtitle: 'Great job! You outplayed your opponent.',
        emoji: '👑',
        textClass: styles.okText,
        badgeClass: styles.success,
      }
    : isDraw
      ? {
          title: 'Draw!',
          subtitle: 'Evenly matched! Try again for a decisive win.',
          emoji: '⭐',
          textClass: styles.midText,
          badgeClass: styles.warn,
        }
      : {
          title: 'Defeat!',
          subtitle: 'Better luck next time! Keep practicing.',
          emoji: '🏆',
          textClass: styles.badText,
          badgeClass: styles.danger,
        }

  return (
    <main className={styles.duel}>
      {invite && (
        <section className={styles.inviteOverlay}>
          <div className={styles.wrap}>
            <div className={cx(styles.card, styles.padLg)}>
              <div className={styles.stackSm}>
                <h3 className={styles.h2}>Duel Invite</h3>
                <p className={styles.muted}>{invite.fromUid} challenged you to a 1v1. Accept?</p>
                <div className={styles.row} style={{ gap: 10, marginTop: 8 }}>
                  <button
                    className={styles.outlineBtn}
                    type="button"
                    onClick={() => void handleDeclineInvite(invite)}
                  >
                    Decline
                  </button>
                  <button
                    className={styles.ctaBtn}
                    type="button"
                    onClick={() => void handleAcceptInvite(invite)}
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      <section className={styles.pad}>
        <div className={styles.wrap}>
          {stage === 'lobby' && (
            <>
              <header className={styles.topBar}>
                <button
                  className={styles.ghostIcon}
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  aria-label="Back"
                >
                  ←
                </button>
                <div className={styles.onlinePill}>
                  <span className={styles.dot} />
                  <span>Online</span>
                </div>
              </header>
              <div className={cx(styles.center, styles.stackMd)} style={{ marginTop: 14 }}>
                <div className={styles.badgeBig}>
                  <span className={styles.bigEmoji}>⚔️</span>
                </div>
                <div className={cx(styles.center, styles.stackSm)}>
                  <h1 className={styles.h1}>1v1 Duel Arena</h1>
                  <p className={styles.muted}>Challenge other players in real time</p>
                </div>
              </div>
              <div style={{ height: 14 }} />
              <div className={cx(styles.card, styles.padLg)}>
                <div className={styles.stackSm}>
                  <div className={styles.h2}>How it works:</div>
                  {howItWorks.map((text, index) => (
                    <div key={text} className={styles.howRow}>
                      <div className={styles.howNum}>{index + 1}</div>
                      <div className={styles.muted}>{text}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ height: 14 }} />
              <div className={styles.h2} style={{ marginBottom: 8 }}>
                Online players
              </div>
              <div className={styles.stackSm}>
                {onlineUsers.length === 0 ? (
                  <div className={cx(styles.card, styles.padLg)}>
                    <p className={styles.muted}>
                      No one’s online right now. Try Quick Match or invite a friend later.
                    </p>
                  </div>
                ) : (
                  onlineUsers.map((onlineUser) => (
                    <div key={onlineUser.uid} className={cx(styles.card, styles.padMd)}>
                      <div
                        className={styles.row}
                        style={{ justifyContent: 'space-between', gap: 12 }}
                      >
                        <div className={styles.row} style={{ gap: 12 }}>
                          <div className={styles.avatarBox}>
                            <span className={styles.avatarEmoji}>
                              {onlineUser.selectedAvatar ?? '🤖'}
                            </span>
                          </div>
                          <div className={styles.stackXs}>
                            <div className={styles.strong}>
                              {onlineUser.username ?? onlineUser.uid}
                            </div>
                            <div className={cx(styles.muted, styles.small)}>
                              {onlineUser.online ? 'online' : 'offline'}
                            </div>
                          </div>
                        </div>
                        <button
                          className={styles.ctaBtn}
                          type="button"
                          style={{ width: 100, minHeight: 30 }}
                          disabled={invitingUid === onlineUser.uid || !uid}
                          onClick={() => void inviteUser(onlineUser.uid)}
                        >
                          {invitingUid === onlineUser.uid ? 'Inviting...' : 'Invite'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ height: 14 }} />
              <button
                className={styles.ctaBtn}
                type="button"
                disabled={finding || !uid}
                onClick={() => void quickMatch()}
              >
                {finding ? 'Matching...' : 'Quick Match'}
              </button>
            </>
          )}

          {stage === 'waiting' && (
            <div className={cx(styles.card, styles.padLg, styles.center, styles.stackMd)}>
              <div className={styles.h2}>Finding Opponent...</div>
              <p className={styles.muted}>
                No other players yet. You can wait, invite a friend, or cancel.
              </p>
              <div className={styles.row} style={{ gap: 10, marginTop: 6, width: '100%' }}>
                <button
                  className={styles.outlineBtn}
                  type="button"
                  onClick={() => void cancelWaiting()}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className={styles.outlineBtn}
                  type="button"
                  onClick={() => setMatchId(null)}
                  style={{ flex: 1 }}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {stage === 'active' && match && !currentQuestion && (
            <div className={cx(styles.card, styles.padLg, styles.center, styles.stackSm)}>
              <div className={styles.h2}>Loading question…</div>
            </div>
          )}

          {stage === 'active' && match && currentQuestion && (
            <>
              <header className={styles.activeHead}>
                <div className={styles.row} style={{ gap: 10 }}>
                  <span className={cx(styles.muted, styles.small)}>⏱</span>
                  <span className={cx(styles.strong, (remainingMs ?? 0) <= 5000 && styles.danger)}>
                    {Math.max(0, Math.ceil((remainingMs ?? 0) / 1000))}s
                  </span>
                </div>
                <div className={cx(styles.muted, styles.small)}>
                  Question {match.currentIndex + 1}/{totalQuestions}
                </div>
              </header>
              <div className={styles.row} style={{ gap: 12, marginTop: 12 }}>
                <div className={cx(styles.scoreCard, styles.pink)}>
                  <div className={styles.row} style={{ gap: 10 }}>
                    <div className={styles.tinyAvatar}>🥷</div>
                    <div className={styles.stackXs}>
                      <div className={cx(styles.muted, styles.small)}>You</div>
                      <div className={styles.strong}>{yourScore}</div>
                    </div>
                  </div>
                </div>
                <div className={cx(styles.scoreCard, styles.purple)}>
                  <div className={styles.row} style={{ gap: 10 }}>
                    <div className={styles.tinyAvatar}>🎮</div>
                    <div className={styles.stackXs}>
                      <div className={cx(styles.muted, styles.small)}>Opponent</div>
                      <div className={styles.strong}>{opponentScore}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.progressTrack} role="progressbar" aria-valuenow={progress}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <div style={{ height: 12 }} />
              <div className={cx(styles.card, styles.padLg, styles.center, styles.stackSm)}>
                <span className={styles.pill}>{currentQuestion.subject}</span>
                <h2 className={styles.h2}>{currentQuestion.question}</h2>
              </div>
              <div className={styles.stackSm} style={{ marginTop: 12 }}>
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={`${index}-${option}`}
                    className={cx(styles.optionBtn, selectedAnswer === index && styles.active)}
                    type="button"
                    disabled={selectedAnswer !== null}
                    onClick={() => void pickAnswer(index)}
                  >
                    <span className={styles.optLetter}>{String.fromCharCode(65 + index)}</span>
                    <span className={styles.optText}>{option}</span>
                  </button>
                ))}
              </div>
              <div className={styles.row} style={{ gap: 10, marginTop: 14 }}>
                <button
                  className={styles.outlineBtn}
                  type="button"
                  onClick={() => setMatchId(null)}
                  style={{ flex: 1 }}
                >
                  Leave
                </button>
              </div>
            </>
          )}

          {stage === 'finished' && match && (
            <div className={cx(styles.card, styles.padLg, styles.center, styles.stackLg)}>
              <div className={cx(styles.badgeBig, result.badgeClass)}>
                <span className={styles.bigEmoji}>{result.emoji}</span>
              </div>
              <div className={cx(styles.center, styles.stackSm)}>
                <h1 className={cx(styles.h1, result.textClass)}>{result.title}</h1>
                <p className={styles.muted}>{result.subtitle}</p>
              </div>
              <div className={styles.stats}>
                <div className={cx(styles.statBlock, youWon && styles.win)}>
                  <div className={styles.statBig}>{yourScore}</div>
                  <div className={cx(styles.muted, styles.small)}>You</div>
                </div>
                <div className={cx(styles.statBlock, opponentWon && styles.win)}>
                  <div className={styles.statBig}>{opponentScore}</div>
                  <div className={cx(styles.muted, styles.small)}>Opponent</div>
                </div>
              </div>
              <div className={cx(styles.card, styles.padMd)} style={{ width: '100%' }}>
                <div className={styles.row} style={{ justifyContent: 'space-between' }}>
                  <span className={styles.muted}>XP Earned:</span>
                  <span className={cx(styles.strong, styles.xpValue)}>
                    +{youWon ? 300 : 100} XP
                  </span>
                </div>
              </div>
              <div className={styles.stackSm} style={{ width: '100%' }}>
                <button className={styles.ctaBtn} type="button" onClick={() => setMatchId(null)}>
                  Play Again
                </button>
                <button
                  className={styles.outlineBtn}
                  type="button"
                  onClick={() => router.push('/dashboard')}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
