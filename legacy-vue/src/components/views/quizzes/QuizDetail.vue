<template>
  <main class="quiz">
    <!-- LOADING -->
    <section v-if="loading" class="centerPad">
      <div class="wrap center">
        <div class="spinner" />
        <p class="muted" style="margin-top: 10px">Loading quiz…</p>
      </div>
    </section>

    <!-- EMPTY / NOT FOUND -->
    <section v-else-if="!quiz || questions.length === 0" class="centerPad">
      <div class="wrap">
        <div class="card padLg center stackMd">
          <h2 class="h2">This quiz is empty.</h2>
          <p class="muted">Maybe it was removed, or there are no questions yet.</p>
          <button class="outlineBtn" type="button" @click="router.back()">Go Back</button>
        </div>
      </div>
    </section>

    <!-- START -->
    <section v-else-if="state === 'start'" class="centerPad">
      <div class="wrap">
        <button class="ghostBack" type="button" @click="router.back()">← Back</button>

        <div class="card padLg center stackLg">
          <div class="badgeBig pop">
            <Target class="bigIcon" />
          </div>

          <div class="stackSm">
            <h1 class="h1">{{ quiz.title }}</h1>
            <p class="muted">{{ quiz.subject }} • {{ quiz.difficulty }}</p>
          </div>

          <div class="facts">
            <div class="factRow">
              <span class="muted">Questions:</span
              ><span class="strong">{{ questions.length }}</span>
            </div>
            <div class="factRow">
              <span class="muted">Time per question:</span>
              <span class="strong">{{ timePer }} seconds</span>
            </div>
            <div class="factRow">
              <span class="muted">Max points:</span><span class="strong">{{ maxPoints }} XP</span>
            </div>
          </div>

          <button class="ctaBtn" type="button" @click="startQuiz">
            Start Quiz <Zap class="mini" />
          </button>
        </div>
      </div>
    </section>

    <!-- PLAYING -->
    <section v-else-if="state === 'playing'" class="pad">
      <div class="wrap">
        <header class="playingHead">
          <button
            class="ghostIcon"
            type="button"
            @click="state = 'start'"
            aria-label="Back to start"
          >
            <ArrowLeft class="mini" />
          </button>

          <div class="timer">
            <Clock class="mini dim" />
            <span class="time" :class="{ danger: timeLeft <= 10 }">{{ timeLeft }}s</span>
          </div>
        </header>

        <div class="meta">
          <div class="metaRow">
            <span class="muted">Question {{ qIndex + 1 }} of {{ questions.length }}</span>
            <span class="badge" :class="diffBadgeClass(q.difficulty)">{{ q.difficulty }}</span>
          </div>

          <div class="progressTrack small" role="progressbar" :aria-valuenow="progress">
            <div class="progressFill" :style="{ width: progress + '%' }"></div>
          </div>
        </div>

        <div class="card padLg stackMd">
          <div class="center stackSm">
            <span class="outlineBadge">{{ q.subject }}</span>
            <h2 class="h2">{{ q.question }}</h2>
          </div>
        </div>

        <div class="stackSm" style="margin-top: 14px">
          <button
            v-for="(opt, idx) in q.options"
            :key="idx"
            class="optionBtn"
            type="button"
            :disabled="selected !== null"
            @click="handleAnswer(idx)"
          >
            <span class="optLetter">{{ String.fromCharCode(65 + idx) }}</span>
            <span class="optText">{{ opt }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- FEEDBACK -->
    <section v-else-if="state === 'feedback'" class="centerPad">
      <div class="wrap">
        <div class="card padLg stackMd" :class="isCorrect ? 'okCard' : 'badCard'">
          <div class="resultIcon" :class="isCorrect ? 'okIcon' : 'badIcon'">
            <Clock v-if="isTimeUp" class="midIcon bad" />
            <CheckCircle v-else-if="isCorrect" class="midIcon ok" />
            <XCircle v-else class="midIcon bad" />
          </div>

          <div class="center stackSm">
            <h2 class="h2" :class="isCorrect ? 'okText' : 'badText'">
              {{ isTimeUp ? "Time's Up!" : isCorrect ? 'Correct!' : 'Incorrect!' }}
            </h2>
            <p v-if="isCorrect" class="okText strong">+{{ q.points }} XP</p>
          </div>

          <div class="box">
            <div class="boxTitle">Correct Answer:</div>
            <div class="boxText muted">
              {{ String.fromCharCode(65 + q.correctAnswer) }}. {{ q.options[q.correctAnswer] }}
            </div>
          </div>

          <div class="box">
            <div class="boxTitle">Explanation:</div>
            <div class="boxText muted">{{ q.explanation }}</div>
          </div>
        </div>

        <button class="ctaBtn" type="button" @click="nextQuestion">
          {{ qIndex < questions.length - 1 ? 'Next Question' : 'View Results' }}
          <ChevronRight class="mini" />
        </button>
      </div>
    </section>

    <!-- COMPLETE -->
    <section v-else class="centerPad">
      <div class="wrap">
        <div class="card padLg center stackLg">
          <div class="badgeBig pop success">
            <Trophy class="bigIcon" />
          </div>

          <div class="stackSm">
            <h1 class="h1">Quiz Complete!</h1>
            <p class="rating" :class="ratingClass">{{ ratingEmoji }} {{ ratingText }}</p>
          </div>

          <div class="stats">
            <div class="statBlock">
              <div class="statBig">{{ score }}</div>
              <div class="muted">Total XP</div>
            </div>
            <div class="statBlock">
              <div class="statBig">{{ pct }}%</div>
              <div class="muted">Accuracy</div>
            </div>
          </div>

          <div class="center">
            <div class="statBig">{{ correctCount }}/{{ questions.length }}</div>
            <div class="muted">Correct Answers</div>
          </div>

          <div class="stackSm" style="width: 100%">
            <button class="ctaBtn" type="button" @click="restart">Try Again</button>
            <button class="outlineBtn" type="button" @click="router.push('/dashboard')">
              Back to Dashboard
            </button>
          </div>

          <!-- opcional: si quieres mostrar si fue perfect -->
          <p v-if="isPerfect" class="muted" style="text-align: center">
            Perfect run! 🎯 (awards can trigger here)
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  ChevronRight,
  Target,
  Zap,
} from 'lucide-vue-next'

import { db } from '@/firebase/config'
import {
  doc,
  collection,
  onSnapshot,
  query,
  orderBy,
  // runTransaction,
  // serverTimestamp,
  // increment,
} from 'firebase/firestore'

// If you also use Firebase Auth in web:
import { useAuth } from '@/composables/useAuth'
import { awardQuizOnceAndUpdateProgress } from '@/lib/quizAwards'

const router = useRouter()
const route = useRoute()
const quizId = computed(() => String(route.params.quizId || ''))
const { user } = useAuth()

// evita que se dispare varias veces en renders rápidos
const awardRan = ref(false)

/** ---- Types (informal en JS) ----
quiz: { title, subject, difficulty, timePerQuestion? }
question: { subject, question, options, correctAnswer, explanation, difficulty, points }
----------------------------------*/

const quiz = ref(null)
const questions = ref([])
const loading = ref(true)
const error = ref(null)

// game state
const state = ref('start') // start | playing | feedback | complete
const qIndex = ref(0)
const selected = ref(null) // number | -1 for timeup
const score = ref(0)
const correctCount = ref(0)
const timeLeft = ref(30)
const perfectSoFar = ref(true)

const q = computed(() => questions.value[qIndex.value])
const timePer = computed(() => Number(quiz.value?.timePerQuestion ?? 30))

const progress = computed(() =>
  Math.round(((qIndex.value + 1) / Math.max(1, questions.value.length)) * 100),
)
const maxPoints = computed(() => questions.value.reduce((sum, q) => sum + Number(q.points ?? 0), 0))
const pct = computed(() =>
  Math.round((correctCount.value / Math.max(1, questions.value.length)) * 100),
)

const isTimeUp = computed(() => selected.value === -1)
const isCorrect = computed(() => selected.value === q.value?.correctAnswer)
const isPerfect = computed(
  () => perfectSoFar.value && correctCount.value === questions.value.length,
)

// --- listeners cleanup
let unsubQuiz = null
let unsubQs = null

onMounted(() => {
  if (!quizId.value) return
  loading.value = true
  error.value = null

  unsubQuiz = onSnapshot(
    doc(db, 'quizzes', quizId.value),
    (snap) => {
      if (!snap.exists()) {
        quiz.value = null
        loading.value = false
        router.back()
        return
      }
      quiz.value = snap.data()
    },
    (e) => {
      console.error(e)
      error.value = 'Error loading quiz.'
      loading.value = false
    },
  )

  unsubQs = onSnapshot(
    query(collection(db, 'quizzes', quizId.value, 'questions'), orderBy('order', 'asc')),
    (snap) => {
      questions.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (e) => {
      console.error(e)
      error.value = 'Error loading questions.'
      loading.value = false
    },
  )
})

onBeforeUnmount(() => {
  if (unsubQuiz) unsubQuiz()
  if (unsubQs) unsubQs()
})

// ---- Timer (sin interval zombie) ----
let t = null
const clearTimer = () => {
  if (t) {
    clearTimeout(t)
    t = null
  }
}
const tick = () => {
  clearTimer()
  if (state.value !== 'playing') return
  if (timeLeft.value <= 0) return

  t = setTimeout(() => {
    timeLeft.value -= 1
    if (timeLeft.value <= 0 && state.value === 'playing') handleTimeUp()
    else tick()
  }, 1000)
}
watch([state, timeLeft], () => {
  if (state.value === 'playing') tick()
  else clearTimer()
})
onBeforeUnmount(clearTimer)

// ---- actions ----
const startQuiz = () => {
  if (!questions.value.length) return
  state.value = 'playing'
  qIndex.value = 0
  selected.value = null
  score.value = 0
  correctCount.value = 0
  perfectSoFar.value = true
  timeLeft.value = timePer.value
  tick()
}

const handleAnswer = (idx) => {
  if (selected.value !== null || state.value !== 'playing') return
  selected.value = idx

  const ok = idx === q.value.correctAnswer
  if (!ok) perfectSoFar.value = false

  if (ok) {
    score.value += Number(q.value.points ?? 0)
    correctCount.value += 1
  }

  state.value = 'feedback'
}

const handleTimeUp = () => {
  if (state.value !== 'playing') return
  selected.value = -1
  perfectSoFar.value = false
  state.value = 'feedback'
}

const nextQuestion = () => {
  if (qIndex.value < questions.value.length - 1) {
    qIndex.value += 1
    selected.value = null
    timeLeft.value = timePer.value
    state.value = 'playing'
    tick()
  } else {
    state.value = 'complete'
  }
}

const restart = () => {
  state.value = 'start'
  qIndex.value = 0
  selected.value = null
  score.value = 0
  correctCount.value = 0
  perfectSoFar.value = true
  timeLeft.value = timePer.value
}

// rating helpers
const diffBadgeClass = (d) => {
  if (d === 'Easy') return 'bEasy'
  if (d === 'Medium') return 'bMed'
  return 'bHard'
}

watch(state, async (s) => {
  if (s !== 'complete') {
    awardRan.value = false
    return
  }
  if (!isPerfect.value) return
  if (awardRan.value) return

  const uid = user.value?.uid
  if (!uid) {
    console.warn('No uid (did you call initAuth() in main.js?)')
    return
  }
  if (!quizId.value) return

  awardRan.value = true
  const totalQuizPoints = maxPoints.value

  try {
    const awarded = await awardQuizOnceAndUpdateProgress({
      db,
      uid: user.value.uid,
      quizId: quizId.value,
      points: totalQuizPoints,
      subject: quiz.value.subject,
      mirrorToProfile: true,
    })
    console.log('Award result:', awarded)
  } catch (e) {
    console.error('Award failed:', e?.code, e?.message, e)
    awardRan.value = false
  }
})

const getScoreRating = () => {
  const p = pct.value
  if (p >= 90) return { text: 'Excellent!', emoji: '🏆', cls: 'rGold' }
  if (p >= 70) return { text: 'Great Job!', emoji: '⭐', cls: 'rBlue' }
  if (p >= 50) return { text: 'Good Work!', emoji: '👍', cls: 'rGreen' }
  return { text: 'Keep Practicing!', emoji: '💪', cls: 'rOrange' }
}
const ratingText = computed(() => getScoreRating().text)
const ratingEmoji = computed(() => getScoreRating().emoji)
const ratingClass = computed(() => getScoreRating().cls)

/**
 * OPTIONAL: Award perfect run ONCE
 * - Necesitas tener auth web listo (getAuth()) y reglas/claims.
 * - Si lo quieres, te lo implemento igualito con runTransaction + "claims/quiz_{id}".
 */
// watch(state, async (s) => {
//   if (s !== "complete") return
//   if (!isPerfect.value) return
//   const uid = getAuth().currentUser?.uid
//   if (!uid) return
//   const points = maxPoints.value
//   await awardQuizOnceAndUpdateProgressWeb({ uid, quizId: quizId.value, points, subject: quiz.value?.subject })
// })
</script>

<style scoped>
/* Reusa tu estética (copié lo básico; puedes pegar tus estilos existentes si ya los tienes) */
.quiz {
  min-height: 100vh;
  width: 100vw;
  color: rgba(255, 255, 255, 0.92);
  padding-bottom: 24px;
  background:
    radial-gradient(900px 520px at 20% 10%, rgba(216, 70, 239, 0.18), transparent 55%),
    radial-gradient(900px 520px at 78% 18%, rgba(59, 130, 246, 0.18), transparent 55%),
    linear-gradient(180deg, #0b0b10 0%, #070a13 70%, #06151a 100%);
  overflow-x: hidden;
}
.wrap {
  width: min(520px, 92vw);
  margin: 0 auto;
}
.pad {
  padding: 18px 0 28px;
}
.centerPad {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 0;
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
.center {
  text-align: center;
  justify-items: center;
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
.strong {
  font-weight: 900;
}

.ghostBack {
  border: 0;
  background: transparent;
  color: rgba(210, 225, 255, 0.8);
  font-weight: 900;
  padding: 8px 10px;
  border-radius: 12px;
  cursor: pointer;
}
.ghostBack:hover {
  background: rgba(255, 255, 255, 0.04);
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
.bigIcon {
  width: 38px;
  height: 38px;
  color: rgba(255, 255, 255, 0.93);
}
.pop {
  animation: pop 650ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
}

.facts {
  width: 100%;
  border-radius: 16px;
  padding: 12px;
  border: 1px solid rgba(160, 190, 255, 0.16);
  background: rgba(255, 255, 255, 0.03);
  text-align: left;
}
.factRow {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 0;
}

.ctaBtn {
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 950;
  color: rgba(255, 255, 255, 0.95);
  background: linear-gradient(90deg, #d946ef 0%, #3b82f6 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
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

.playingHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
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

.timer {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dim {
  color: rgba(210, 225, 255, 0.55);
}
.time {
  font-weight: 950;
}
.time.danger {
  color: #ef4444;
  animation: pulse 900ms ease-in-out infinite;
}

.meta {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
}
.metaRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}
.badge {
  font-size: 10px;
  font-weight: 950;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(160, 190, 255, 0.16);
}
.bEasy {
  background: rgba(16, 185, 129, 0.14);
  color: rgba(16, 185, 129, 0.95);
}
.bMed {
  background: rgba(59, 130, 246, 0.14);
  color: rgba(59, 130, 246, 0.95);
}
.bHard {
  background: rgba(239, 68, 68, 0.14);
  color: rgba(239, 68, 68, 0.95);
}

.progressTrack {
  width: 100%;
  height: 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(160, 190, 255, 0.14);
  overflow: hidden;
}
.progressFill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #d946ef 0%, #3b82f6 100%);
  transition: width 260ms ease;
}

.outlineBadge {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(160, 190, 255, 0.18);
  background: rgba(255, 255, 255, 0.03);
  font-weight: 900;
  font-size: 12px;
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

.resultIcon {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  margin: 0 auto;
  border: 1px solid rgba(160, 190, 255, 0.16);
}
.okIcon {
  background: rgba(16, 185, 129, 0.14);
}
.badIcon {
  background: rgba(239, 68, 68, 0.14);
}
.midIcon {
  width: 30px;
  height: 30px;
}
.ok {
  color: #10b981;
}
.bad {
  color: #ef4444;
}
.okText {
  color: #10b981;
}
.badText {
  color: #ef4444;
}
.okCard {
  border-color: rgba(16, 185, 129, 0.2);
  background: rgba(16, 185, 129, 0.06);
}
.badCard {
  border-color: rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.06);
}

.box {
  border-radius: 16px;
  padding: 12px;
  border: 1px solid rgba(160, 190, 255, 0.14);
  background: rgba(255, 255, 255, 0.03);
  text-align: left;
}
.boxTitle {
  font-size: 13px;
  font-weight: 950;
  margin-bottom: 6px;
}
.boxText {
  font-size: 13px;
}

.rating {
  margin: 0;
  font-weight: 950;
  font-size: 16px;
}
.rGold {
  color: #f59e0b;
}
.rBlue {
  color: #60a5fa;
}
.rGreen {
  color: #34d399;
}
.rOrange {
  color: #fb923c;
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
}
.statBig {
  font-size: 22px;
  font-weight: 950;
}

.mini {
  width: 18px;
  height: 18px;
}

.spinner {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 3px solid rgba(255, 255, 255, 0.14);
  border-top-color: rgba(59, 130, 246, 0.95);
  animation: spin 0.85s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pop {
  0% {
    transform: scale(0.86);
    opacity: 0;
  }
  60% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
