<template>
  <main class="duel">
    <!-- INVITE OVERLAY -->
    <section v-if="pendingInvites.length > 0" class="inviteOverlay">
      <div class="wrap">
        <div class="card padLg">
          <div class="stackSm">
            <h3 class="h2">Duel Invite</h3>
            <p class="muted">{{ pendingInvites[0]?.fromUid }} challenged you to a 1v1. Accept?</p>

            <div class="row" style="gap: 10px; margin-top: 8px">
              <button
                class="outlineBtn"
                type="button"
                @click="pendingInvites[0] && handleDeclineInvite(pendingInvites[0])"
              >
                Decline
              </button>
              <button
                class="ctaBtn"
                type="button"
                @click="pendingInvites[0] && handleAcceptInvite(pendingInvites[0])"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="pad">
      <div class="wrap">
        <!-- LOBBY -->
        <template v-if="stage === 'lobby'">
          <header class="topBar">
            <button
              class="ghostIcon"
              type="button"
              @click="router.push('/dashboard')"
              aria-label="Back"
            >
              ←
            </button>

            <div class="onlinePill">
              <span class="dot"></span>
              <span>Online</span>
            </div>
          </header>

          <div class="center stackMd" style="margin-top: 14px">
            <div class="badgeBig">
              <span class="bigEmoji">⚔️</span>
            </div>

            <div class="center stackSm">
              <h1 class="h1">1v1 Duel Arena</h1>
              <p class="muted">Challenge other players in real time</p>
            </div>
          </div>

          <div style="height: 14px" />

          <div class="card padLg">
            <div class="stackSm">
              <div class="h2">How it works:</div>
              <div v-for="(t, i) in howItWorks" :key="i" class="howRow">
                <div class="howNum">{{ i + 1 }}</div>
                <div class="muted">{{ t }}</div>
              </div>
            </div>
          </div>

          <div style="height: 14px" />

          <div class="h2" style="margin-bottom: 8px">Online players</div>

          <div class="stackSm">
            <div v-if="onlineUsers.length === 0" class="card padLg">
              <p class="muted">
                No one’s online right now. Try Quick Match or invite a friend later.
              </p>
            </div>

            <div v-else v-for="u in onlineUsers" :key="u.uid" class="card padMd">
              <div class="row" style="justify-content: space-between; gap: 12px">
                <div class="row" style="gap: 12px">
                  <div class="avatarBox">
                    <span class="avatarEmoji">{{ u.selectedAvatar ?? '🤖' }}</span>
                  </div>
                  <div class="stackXs">
                    <div class="strong">{{ u.username ?? u.uid }}</div>
                    <div class="muted small">{{ u.online ? 'online' : 'offline' }}</div>
                  </div>
                </div>

                <button
                  class="ctaBtn"
                  type="button"
                  style="width: 124px; height: 44px; border-radius: 14px"
                  :disabled="invitingUid === u.uid || !uid"
                  @click="inviteUser(u.uid)"
                >
                  {{ invitingUid === u.uid ? 'Inviting...' : 'Invite' }}
                </button>
              </div>
            </div>
          </div>

          <div style="height: 14px" />

          <button class="ctaBtn" type="button" :disabled="finding || !uid" @click="onQuickMatch">
            {{ finding ? 'Matching...' : 'Quick Match' }}
          </button>
        </template>

        <!-- WAITING -->
        <template v-else-if="stage === 'waiting'">
          <div class="card padLg center stackMd">
            <div class="h2">Finding Opponent...</div>
            <p class="muted">No other players yet. You can wait, invite a friend, or cancel.</p>

            <div class="row" style="gap: 10px; margin-top: 6px; width: 100%">
              <button class="outlineBtn" type="button" @click="cancelWaiting" style="flex: 1">
                Cancel
              </button>
              <button class="outlineBtn" type="button" @click="backToLobby" style="flex: 1">
                Back
              </button>
            </div>
          </div>
        </template>

        <!-- ACTIVE -->
        <template v-else-if="stage === 'active' && match">
          <header class="activeHead">
            <div class="row" style="gap: 10px">
              <span class="muted small">⏱</span>
              <span class="strong" :class="{ danger: (remainingMs ?? 0) <= 5000 }">
                {{ Math.max(0, Math.ceil((remainingMs ?? 0) / 1000)) }}s
              </span>
            </div>

            <div class="muted small">
              Question {{ match.currentIndex + 1 }}/{{
                match.questionIds?.length ?? DUEL_QUESTIONS.length
              }}
            </div>
          </header>

          <div class="row" style="gap: 12px; margin-top: 12px">
            <div class="scoreCard pink">
              <div class="row" style="gap: 10px">
                <div class="tinyAvatar">🥷</div>
                <div class="stackXs">
                  <div class="muted small">You</div>
                  <div class="strong">{{ yourScore }}</div>
                </div>
              </div>
            </div>

            <div class="scoreCard purple">
              <div class="row" style="gap: 10px">
                <div class="tinyAvatar">🎮</div>
                <div class="stackXs">
                  <div class="muted small">Opponent</div>
                  <div class="strong">{{ oppScore }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="progressTrack" role="progressbar" :aria-valuenow="progressPct">
            <div class="progressFill" :style="{ width: progressPct + '%' }"></div>
          </div>

          <div style="height: 12px" />

          <div class="card padLg center stackSm">
            <span class="pill">{{ currentQ.subject }}</span>
            <h2 class="h2">{{ currentQ.question }}</h2>
          </div>

          <div class="stackSm" style="margin-top: 12px">
            <button
              v-for="(opt, idx) in currentQ.options"
              :key="idx"
              class="optionBtn"
              type="button"
              :disabled="selectedAnswer !== null"
              :class="{ active: selectedAnswer === idx }"
              @click="pickAnswer(idx)"
            >
              <span class="optLetter">{{ String.fromCharCode(65 + idx) }}</span>
              <span class="optText">{{ opt }}</span>
            </button>
          </div>

          <div class="row" style="gap: 10px; margin-top: 14px">
            <button class="outlineBtn" type="button" @click="backToLobby" style="flex: 1">
              Leave
            </button>
          </div>
        </template>

        <!-- FINISHED -->
        <template v-else-if="stage === 'finished' && match">
          <div class="card padLg center stackLg">
            <div class="badgeBig" :class="resultBadgeClass">
              <span class="bigEmoji">{{ resultEmoji }}</span>
            </div>

            <div class="center stackSm">
              <h1 class="h1" :class="resultTextClass">{{ resultTitle }}</h1>
              <p class="muted">{{ resultSubtitle }}</p>
            </div>

            <div class="stats">
              <div class="statBlock" :class="{ win: youWon }">
                <div class="statBig">{{ yourScore }}</div>
                <div class="muted small">You</div>
              </div>
              <div class="statBlock" :class="{ win: oppWon }">
                <div class="statBig">{{ oppScore }}</div>
                <div class="muted small">Opponent</div>
              </div>
            </div>

            <div class="card padMd" style="width: 100%">
              <div class="row" style="justify-content: space-between">
                <span class="muted">XP Earned:</span>
                <span class="strong" style="color: rgba(228, 34, 221, 0.95)"
                  >+{{ duelXpEarned }} XP</span
                >
              </div>
            </div>

            <div class="stackSm" style="width: 100%">
              <button class="ctaBtn" type="button" @click="playAgain">Play Again</button>
              <button class="outlineBtn" type="button" @click="router.push('/dashboard')">
                Back to Dashboard
              </button>
            </div>
          </div>
        </template>

        <!-- FALLBACK -->
        <template v-else>
          <div class="card padLg center stackSm">
            <div class="h2">Loading…</div>
            <p class="muted">If this persists, go back to lobby.</p>
            <button class="outlineBtn" type="button" @click="backToLobby">Back</button>
          </div>
        </template>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuth } from '@/composables/useAuth'
import { useMatch } from '@/composables/useMatch'
import { usePresence } from '@/composables/usePresence'

import { onlineUsersQuery } from '@/lib/presence'
import {
  findOrCreateOpenMatch,
  joinOpenMatch,
  submitAnswer,
  tryAdvance,
  awardDuelOnce,
  abandonIfStillWaiting,
} from '@/lib/duel'

import { sendInvite, listenIncomingInvites, acceptInvite, declineInvite } from '@/lib/invites'
import { onSnapshot } from 'firebase/firestore'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()
const uid = computed(() => (user.value as any)?.uid ?? null)
const hasNavbar = true

// --- Sample question bank (igual que RN). Luego lo puedes reemplazar por Firestore.
const DUEL_QUESTIONS = [
  {
    id: 1,
    question: 'What is the time complexity of quicksort in the average case?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    correctAnswer: 1,
    subject: 'Algorithms',
  },
  {
    id: 2,
    question: 'Which HTTP method is used to update existing data?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    correctAnswer: 2,
    subject: 'Networking',
  },
  {
    id: 3,
    question: 'What does SQL stand for?',
    options: [
      'Structured Query Language',
      'Simple Query Language',
      'Standard Query Language',
      'System Query Language',
    ],
    correctAnswer: 0,
    subject: 'Databases',
  },
] as const

const howItWorks = [
  'Answer questions faster than your opponent',
  'Each correct answer gives you 100 points',
  'Highest score wins the duel!',
]

// --- Presence (heartbeat)
watch(
  uid,
  (v) => {
    if (v) usePresence(v)
  },
  { immediate: true },
)

// --- Online users list
const onlineUsers = ref<any[]>([])
let unsubOnline: null | (() => void) = null

watch(
  uid,
  (myUid) => {
    unsubOnline?.()
    unsubOnline = null
    if (!myUid) {
      onlineUsers.value = []
      return
    }

    // onlineUsersQuery() debe regresar un Firestore Query (web modular)
    const q = onlineUsersQuery()
    unsubOnline = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs
          .map((d) => ({ uid: d.id, ...(d.data() as any) }))
          .filter((u) => u.uid && u.uid !== myUid)
        onlineUsers.value = rows
      },
      () => {
        onlineUsers.value = []
      },
    )
  },
  { immediate: true },
)

onBeforeUnmount(() => unsubOnline?.())

// --- Match
const matchId = ref<string | null>(null)

// deep link / route param (?matchId=xxxx o /duel/:matchId)
onMounted(() => {
  const fromParam = String((route.params as any)?.matchId ?? '')
  const fromQuery = String((route.query as any)?.matchId ?? '')
  const seed = (fromParam || fromQuery || '').trim()
  if (seed) matchId.value = seed
})

const { match, remainingMs } = useMatch(computed(() => matchId.value ?? undefined)) as any

const stage = computed<'lobby' | 'waiting' | 'active' | 'finished'>(() => {
  if (!matchId.value) return 'lobby'
  const st = match.value?.status
  if (!st || st === 'waiting') return 'waiting'
  if (st === 'active') return 'active'
  if (st === 'finished') return 'finished'
  return 'waiting'
})

// --- Lobby actions
const finding = ref(false)
const invitingUid = ref<string | null>(null)

function qIds() {
  // ids simples para el match doc; tú luego puedes meter ids reales
  return DUEL_QUESTIONS.map((_, i) => `q${i + 1}`)
}

async function onQuickMatch() {
  if (!uid.value || finding.value) return
  try {
    finding.value = true
    const id = await findOrCreateOpenMatch(uid.value, qIds(), 15000)
    matchId.value = String(id)
  } finally {
    finding.value = false
  }
}

async function inviteUser(targetUid: string) {
  if (!uid.value || invitingUid.value) return
  invitingUid.value = targetUid
  try {
    const res = await sendInvite({
      fromUid: uid.value,
      toUid: String(targetUid),
      questionIds: qIds(),
      perQuestionMs: 15000,
    })
    // normaliza (por si tu sendInvite retorna string o {matchId})
    const mId = typeof res === 'string' ? res : (res as any)?.matchId
    if (mId) matchId.value = String(mId)
  } finally {
    invitingUid.value = null
  }
}

// --- Invites overlay
const pendingInvites = ref<Array<{ id: string; fromUid: string; matchId: string }>>([])
const seenInviteIds = new Set<string>()
let unsubInvites: null | (() => void) = null

watch(
  uid,
  (myUid) => {
    unsubInvites?.()
    unsubInvites = null
    pendingInvites.value = []
    seenInviteIds.clear()

    if (!myUid) return
    unsubInvites = listenIncomingInvites(myUid, (invites) => {
      const fresh = invites.filter((i) => !seenInviteIds.has(i.id))
      fresh.forEach((i) => seenInviteIds.add(i.id))
      if (fresh.length) pendingInvites.value = [...fresh, ...pendingInvites.value]
    })
  },
  { immediate: true },
)

onBeforeUnmount(() => unsubInvites?.())

async function handleAcceptInvite(inv: { id: string; matchId: string }) {
  if (!uid.value) return
  try {
    const acceptedMatchId = await acceptInvite({ toUid: uid.value, inviteId: inv.id })
    matchId.value = String(acceptedMatchId)
  } finally {
    pendingInvites.value = pendingInvites.value.filter((x) => x.id !== inv.id)
  }
}

async function handleDeclineInvite(inv: { id: string }) {
  if (!uid.value) return
  try {
    await declineInvite({ toUid: uid.value, inviteId: inv.id })
  } finally {
    pendingInvites.value = pendingInvites.value.filter((x) => x.id !== inv.id)
  }
}

// --- Join waiting match if you are guest and it's still open
watch(
  () =>
    [
      uid.value,
      match.value?.status,
      match.value?.hostUid,
      match.value?.opponentUid,
      matchId.value,
    ] as const,
  async ([myUid, st, hostUid, opponentUid, mId]) => {
    if (!myUid || !mId || !match.value) return
    const youAreHost = hostUid === myUid
    if (st === 'waiting' && !youAreHost && !opponentUid) {
      try {
        await joinOpenMatch(String(mId), String(myUid))
      } catch {
        // ignore
      }
    }
  },
)

// --- Active gameplay
const selectedAnswer = ref<number | null>(null)

watch(
  () => match.value?.currentIndex,
  () => {
    selectedAnswer.value = null
  },
)

const currentQ = computed(() => {
  const idx = match.value?.currentIndex ?? 0
  return DUEL_QUESTIONS[idx] ?? DUEL_QUESTIONS[0]
})

const progressPct = computed(() => {
  const total = match.value?.questionIds?.length ?? DUEL_QUESTIONS.length
  const idx = match.value?.currentIndex ?? 0
  return Math.max(0, Math.min(100, ((idx + 1) / Math.max(1, total)) * 100))
})

const yourScore = computed(() => {
  const myUid = uid.value
  if (!myUid || !match.value) return 0
  return Number(match.value.scores?.[myUid] ?? 0)
})

const oppUid = computed(() => {
  if (!uid.value || !match.value) return null
  return match.value.hostUid === uid.value ? (match.value.opponentUid ?? null) : match.value.hostUid
})

const oppScore = computed(() => {
  if (!match.value || !oppUid.value) return 0
  return Number(match.value.scores?.[oppUid.value] ?? 0)
})

async function pickAnswer(idx: number) {
  if (!uid.value || !match.value || match.value.status !== 'active') return
  if (selectedAnswer.value !== null) return

  selectedAnswer.value = idx

  await submitAnswer({
    matchId: match.value.id,
    uid: uid.value,
    index: match.value.currentIndex,
    choice: idx,
    correctChoice: currentQ.value.correctAnswer,
    points: 100,
  })

  // nudge
  await tryAdvance(match.value.id)
}

// auto-advance when timer runs out
watch(
  () => [match.value?.status, remainingMs.value] as const,
  async ([st, ms]) => {
    if (!match.value || st !== 'active') return
    if ((ms ?? 0) <= 0) {
      await tryAdvance(match.value.id)
    }
  },
)

// cancel waiting
async function cancelWaiting() {
  if (!uid.value || !matchId.value) {
    matchId.value = null
    return
  }
  try {
    await abandonIfStillWaiting(String(matchId.value), String(uid.value))
  } finally {
    matchId.value = null
  }
}

function backToLobby() {
  matchId.value = null
}

// --- Award on finish (once)
const awardRan = ref(false)

watch(
  () => match.value?.status,
  async (st) => {
    if (st !== 'finished') {
      awardRan.value = false
      return
    }
    if (!uid.value || !match.value || awardRan.value) return
    awardRan.value = true

    const youWonLocal = match.value.winnerUid
      ? match.value.winnerUid === uid.value
      : yourScore.value > oppScore.value
    const xp = youWonLocal ? 300 : 100

    try {
      await awardDuelOnce({
        uid: uid.value,
        matchId: match.value.id,
        points: xp,
        mirrorToProfile: true,
      })
    } catch (e) {
      // si falla (offline), puedes permitir retry luego
      awardRan.value = false
      console.warn('awardDuelOnce failed', e)
    }
  },
)

// --- Results computed
const youWon = computed(() => {
  if (!uid.value || !match.value) return false
  if (match.value.winnerUid == null) return yourScore.value > oppScore.value
  return match.value.winnerUid === uid.value
})
const oppWon = computed(() => {
  if (!uid.value || !match.value) return false
  if (match.value.winnerUid == null) return oppScore.value > yourScore.value
  return match.value.winnerUid === oppUid.value
})
const isDraw = computed(() => yourScore.value === oppScore.value)

const resultTitle = computed(() => (youWon.value ? 'Victory!' : isDraw.value ? 'Draw!' : 'Defeat!'))
const resultSubtitle = computed(() =>
  youWon.value
    ? 'Great job! You outplayed your opponent.'
    : isDraw.value
      ? 'Evenly matched! Try again for a decisive win.'
      : 'Better luck next time! Keep practicing.',
)
const resultEmoji = computed(() => (youWon.value ? '👑' : isDraw.value ? '⭐' : '🏆'))
const resultTextClass = computed(() =>
  youWon.value ? 'okText' : isDraw.value ? 'midText' : 'badText',
)
const resultBadgeClass = computed(() =>
  youWon.value ? 'success' : isDraw.value ? 'warn' : 'danger',
)

const duelXpEarned = computed(() => {
  // aquí lo dejo simple: si quieres, usa score o xp fijo
  return youWon.value ? 300 : 100
})

function playAgain() {
  matchId.value = null
}
</script>

<style scoped>
.duel {
  min-height: 100vh;
  width: 100%;
  color: rgba(255, 255, 255, 0.93);
  background:
    radial-gradient(900px 520px at 20% 10%, rgba(216, 70, 239, 0.18), transparent 55%),
    radial-gradient(900px 520px at 78% 18%, rgba(59, 130, 246, 0.18), transparent 55%),
    linear-gradient(180deg, #0b0b10 0%, #070a13 70%, #06151a 100%);
}

.wrap {
  width: min(560px, 92vw);
  margin: 0 auto;
}
.pad {
  padding: 18px 0 28px;
}

.stackLg {
  display: grid;
  gap: 18px;
}
.stackMd {
  display: grid;
  gap: 14px;
}
.stackSm {
  display: grid;
  gap: 10px;
}
.stackXs {
  display: grid;
  gap: 4px;
}

.center {
  text-align: center;
  justify-items: center;
}
.row {
  display: flex;
  align-items: center;
}

.h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 950;
}
.h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.35;
}
.muted {
  margin: 0;
  color: rgba(210, 225, 255, 0.66);
  line-height: 1.55;
}
.small {
  font-size: 12px;
}
.strong {
  font-weight: 950;
}

.card {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(120, 140, 190, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.padLg {
  padding: 18px;
}
.padMd {
  padding: 12px;
}

.topBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.ghostIcon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid rgba(160, 190, 255, 0.16);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.86);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.onlinePill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(160, 190, 255, 0.16);
  background: rgba(255, 255, 255, 0.03);
  font-weight: 900;
  color: rgba(55, 214, 122, 0.95);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(55, 214, 122, 0.95);
}

.badgeBig {
  width: 84px;
  height: 84px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #d946ef 0%, #3b82f6 100%);
}
.badgeBig.success {
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
}
.badgeBig.warn {
  background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%);
}
.badgeBig.danger {
  background: linear-gradient(135deg, #ef4444 0%, #fb7185 100%);
}
.bigEmoji {
  font-size: 34px;
  line-height: 1;
}

.howRow {
  display: flex;
  align-items: center;
  gap: 10px;
}
.howNum {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(228, 34, 221, 0.15);
  color: rgba(228, 34, 221, 0.95);
  font-weight: 950;
  font-size: 12px;
}

.ctaBtn {
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 950;
  color: rgba(255, 255, 255, 0.95);
  background: linear-gradient(90deg, #d946ef 0%, #3b82f6 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
}
.ctaBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.ctaBtn:hover {
  filter: brightness(1.03);
  transform: translateY(-1px);
}
.ctaBtn:active {
  transform: translateY(0px) scale(0.99);
}

.outlineBtn {
  width: 100%;
  height: 52px;
  border-radius: 16px;
  border: 1px solid rgba(160, 190, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 950;
  cursor: pointer;
}
.outlineBtn:hover {
  background: rgba(255, 255, 255, 0.045);
}
.outlineBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.avatarBox {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: rgba(142, 136, 255, 0.25);
  display: grid;
  place-items: center;
  border: 1px solid rgba(160, 190, 255, 0.16);
}
.avatarEmoji {
  font-size: 22px;
  line-height: 1;
}

.inviteOverlay {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 14px;
  z-index: 9999;
  pointer-events: none;
}
.inviteOverlay .card {
  pointer-events: auto;
}

.activeHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.danger {
  color: #ef4444;
}

.scoreCard {
  flex: 1;
  border-radius: 16px;
  padding: 12px;
  border: 1px solid rgba(160, 190, 255, 0.16);
  background: rgba(255, 255, 255, 0.03);
}
.scoreCard.pink {
  background: rgba(228, 34, 221, 0.08);
  border-color: rgba(228, 34, 221, 0.25);
}
.scoreCard.purple {
  background: rgba(142, 136, 255, 0.08);
  border-color: rgba(142, 136, 255, 0.25);
}
.tinyAvatar {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(160, 190, 255, 0.14);
}

.progressTrack {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(160, 190, 255, 0.14);
  overflow: hidden;
  margin-top: 12px;
}
.progressFill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #d946ef 0%, #3b82f6 100%);
  transition: width 260ms ease;
}

.pill {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(160, 190, 255, 0.18);
  background: rgba(255, 255, 255, 0.03);
  font-weight: 900;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.optionBtn {
  width: 100%;
  border-radius: 16px;
  padding: 14px;
  border: 1px solid rgba(160, 190, 255, 0.16);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-align: left;
}
.optionBtn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.045);
  border-color: rgba(217, 70, 239, 0.28);
}
.optionBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}
.optionBtn.active {
  border-color: rgba(228, 34, 221, 0.95);
  background: rgba(228, 34, 221, 0.12);
}

.optLetter {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(160, 190, 255, 0.14);
  display: grid;
  place-items: center;
  font-weight: 950;
}
.optText {
  font-size: 13px;
  line-height: 1.35;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
}
.statBlock {
  border-radius: 16px;
  padding: 12px;
  border: 1px solid rgba(160, 190, 255, 0.14);
  background: rgba(255, 255, 255, 0.03);
  text-align: center;
}
.statBlock.win {
  border-color: rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.08);
}
.statBig {
  font-size: 22px;
  font-weight: 950;
}

.okText {
  color: #10b981;
}
.midText {
  color: #f59e0b;
}
.badText {
  color: #ef4444;
}
</style>
