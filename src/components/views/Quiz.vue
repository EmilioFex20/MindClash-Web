<template>
  <main class="quiz">
    <!-- START -->
    <section v-if="quizState === 'start'" class="centerPad">
      <div class="wrap">
        <button class="ghostBack" type="button" @click="router.back()">
          <ArrowLeft class="mini" />
          Back
        </button>

        <div class="card padLg center stackLg">
          <div class="badgeBig pop">
            <Target class="bigIcon" />
          </div>

          <div class="stackSm">
            <h1 class="h1">Daily Quiz Challenge</h1>
            <p class="muted">Test your CS knowledge across multiple subjects</p>
          </div>

          <div class="facts">
            <div class="factRow">
              <span class="muted">Questions:</span
              ><span class="strong">{{ QUIZ_QUESTIONS.length }}</span>
            </div>
            <div class="factRow">
              <span class="muted">Time per question:</span><span class="strong">30 seconds</span>
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

      <BottomNavbar currentPage="quiz" />
    </section>

    <!-- PLAYING -->
    <section v-else-if="quizState === 'playing'" class="pad">
      <div class="wrap">
        <!-- Header -->
        <header class="playingHead">
          <button
            class="ghostIcon"
            type="button"
            @click="quizState = 'start'"
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
            <span class="muted"
              >Question {{ currentQuestion + 1 }} of {{ QUIZ_QUESTIONS.length }}</span
            >
            <span class="badge" :class="diffBadgeClass(question.difficulty)">{{
              question.difficulty
            }}</span>
          </div>

          <div
            class="progressTrack small"
            role="progressbar"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="progressFill" :style="{ width: progress + '%' }"></div>
          </div>
        </div>

        <!-- Question -->
        <div class="card padLg stackMd">
          <div class="center stackSm">
            <span class="outlineBadge">{{ question.subject }}</span>
            <h2 class="h2">{{ question.question }}</h2>
          </div>
        </div>

        <!-- Options -->
        <div class="stackSm" style="margin-top: 14px">
          <button
            v-for="(opt, idx) in question.options"
            :key="idx"
            class="optionBtn"
            type="button"
            :disabled="selectedAnswer !== null"
            @click="handleAnswerSelect(idx)"
          >
            <span class="optLetter">{{ String.fromCharCode(65 + idx) }}</span>
            <span class="optText">{{ opt }}</span>
          </button>
        </div>
      </div>

      <!-- Confetti -->
      <div v-if="showConfetti" class="confetti" aria-hidden="true">
        <span
          v-for="c in confettiPieces"
          :key="c.id"
          class="confettiPiece"
          :style="{ left: c.left, animationDelay: c.delay }"
        />
      </div>

      <BottomNavbar currentPage="quiz" />
    </section>

    <!-- FEEDBACK -->
    <section v-else-if="quizState === 'feedback'" class="centerPad">
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
            <p v-if="isCorrect" class="okText strong">+{{ question.points }} XP</p>
          </div>

          <div class="box">
            <div class="boxTitle">Correct Answer:</div>
            <div class="boxText muted">
              {{ String.fromCharCode(65 + question.correctAnswer) }}.
              {{ question.options[question.correctAnswer] }}
            </div>
          </div>

          <div class="box">
            <div class="boxTitle">Explanation:</div>
            <div class="boxText muted">{{ question.explanation }}</div>
          </div>
        </div>

        <button class="ctaBtn" type="button" @click="nextQuestion">
          {{ currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'View Results' }}
          <ChevronRight class="mini" />
        </button>
      </div>

      <BottomNavbar currentPage="quiz" />
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
              <div class="statBig">{{ percentage }}%</div>
              <div class="muted">Accuracy</div>
            </div>
          </div>

          <div class="center">
            <div class="statBig">{{ correctAnswers }}/{{ QUIZ_QUESTIONS.length }}</div>
            <div class="muted">Correct Answers</div>
          </div>

          <div class="stackSm" style="width: 100%">
            <button class="ctaBtn" type="button" @click="restartQuiz">Try Again</button>

            <button class="outlineBtn" type="button" @click="router.push('/dashboard')">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <BottomNavbar currentPage="quiz" />
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavbar from '@/components/BottomNavbar.vue'
import {
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  ArrowLeft,
  Zap,
  Target,
  ChevronRight,
} from 'lucide-vue-next'

const router = useRouter()

const QUIZ_QUESTIONS = [
  {
    id: 1,
    subject: 'Programming',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1,
    explanation:
      'Binary search divides the search space in half with each comparison, resulting in O(log n) time complexity.',
    difficulty: 'Medium',
    points: 75,
  },
  {
    id: 2,
    subject: 'Databases',
    question: 'Which SQL command is used to retrieve data from a database?',
    options: ['INSERT', 'SELECT', 'UPDATE', 'DELETE'],
    correctAnswer: 1,
    explanation: 'SELECT is used to query and retrieve data from database tables.',
    difficulty: 'Easy',
    points: 50,
  },
  {
    id: 3,
    subject: 'Networking',
    question: 'What does HTTP stand for?',
    options: [
      'Hypertext Transfer Protocol',
      'High Transfer Text Protocol',
      'Hyperlink Text Transfer Protocol',
      'Home Tool Transfer Protocol',
    ],
    correctAnswer: 0,
    explanation:
      'HTTP stands for Hypertext Transfer Protocol, the foundation of data communication on the web.',
    difficulty: 'Easy',
    points: 50,
  },
  {
    id: 4,
    subject: 'Algorithms',
    question: 'Which sorting algorithm has the best average-case time complexity?',
    options: ['Bubble Sort', 'Quick Sort', 'Insertion Sort', 'Selection Sort'],
    correctAnswer: 1,
    explanation:
      'Quick Sort has an average-case time complexity of O(n log n), making it one of the most efficient sorting algorithms.',
    difficulty: 'Hard',
    points: 100,
  },
  {
    id: 5,
    subject: 'AI/ML',
    question: 'What is supervised learning?',
    options: [
      'Learning without labeled data',
      'Learning with labeled training data',
      'Learning through trial and error',
      'Learning by clustering data',
    ],
    correctAnswer: 1,
    explanation:
      'Supervised learning uses labeled training data to learn a mapping from inputs to outputs.',
    difficulty: 'Medium',
    points: 75,
  },
]

const quizState = ref('start') // "start" | "playing" | "feedback" | "complete"
const currentQuestion = ref(0)
const selectedAnswer = ref(null) // number | -1 for timeup
const score = ref(0)
const correctAnswers = ref(0)
const timeLeft = ref(30)
const showConfetti = ref(false)
const answers = ref([])

const question = computed(() => QUIZ_QUESTIONS[currentQuestion.value])
const progress = computed(() =>
  Math.round(((currentQuestion.value + 1) / QUIZ_QUESTIONS.length) * 100),
)
const maxPoints = computed(() => QUIZ_QUESTIONS.reduce((sum, q) => sum + q.points, 0))

const isTimeUp = computed(() => selectedAnswer.value === -1)
const isCorrect = computed(() => selectedAnswer.value === question.value.correctAnswer)

const percentage = computed(() => Math.round((correctAnswers.value / QUIZ_QUESTIONS.length) * 100))

/* ----- Timer (100% Vue, sin setInterval zombie) ----- */
let t = null

const clearTimer = () => {
  if (t) {
    clearTimeout(t)
    t = null
  }
}

const tick = () => {
  clearTimer()
  if (quizState.value !== 'playing') return
  if (timeLeft.value <= 0) return

  t = setTimeout(() => {
    timeLeft.value -= 1
    if (timeLeft.value <= 0 && quizState.value === 'playing') handleTimeUp()
    else tick()
  }, 1000)
}

watch([quizState, timeLeft], () => {
  if (quizState.value === 'playing') tick()
  else clearTimer()
})

onBeforeUnmount(() => clearTimer())

/* ----- Confetti pieces (simple) ----- */
const confettiPieces = computed(() =>
  Array.from({ length: 22 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.4}s`,
  })),
)

const startQuiz = () => {
  quizState.value = 'playing'
  currentQuestion.value = 0
  selectedAnswer.value = null
  score.value = 0
  correctAnswers.value = 0
  timeLeft.value = 30
  answers.value = []
  tick()
}

const handleAnswerSelect = (idx) => {
  if (selectedAnswer.value !== null) return

  selectedAnswer.value = idx
  const ok = idx === question.value.correctAnswer

  if (ok) {
    score.value += question.value.points
    correctAnswers.value += 1
    showConfetti.value = true
    setTimeout(() => (showConfetti.value = false), 1400)
  }

  answers.value = [...answers.value, ok]
  quizState.value = 'feedback'
}

const handleTimeUp = () => {
  if (quizState.value !== 'playing') return
  selectedAnswer.value = -1
  answers.value = [...answers.value, false]
  quizState.value = 'feedback'
}

const nextQuestion = () => {
  if (currentQuestion.value < QUIZ_QUESTIONS.length - 1) {
    currentQuestion.value += 1
    selectedAnswer.value = null
    timeLeft.value = 30
    quizState.value = 'playing'
    tick()
  } else {
    quizState.value = 'complete'
  }
}

const restartQuiz = () => {
  quizState.value = 'start'
  currentQuestion.value = 0
  selectedAnswer.value = null
  score.value = 0
  correctAnswers.value = 0
  timeLeft.value = 30
  answers.value = []
}

const diffBadgeClass = (d) => {
  if (d === 'Easy') return 'bEasy'
  if (d === 'Medium') return 'bMed'
  return 'bHard'
}

const getScoreRating = () => {
  const pct = percentage.value
  if (pct >= 90) return { text: 'Excellent!', emoji: '🏆', cls: 'rGold' }
  if (pct >= 70) return { text: 'Great Job!', emoji: '⭐', cls: 'rBlue' }
  if (pct >= 50) return { text: 'Good Work!', emoji: '👍', cls: 'rGreen' }
  return { text: 'Keep Practicing!', emoji: '💪', cls: 'rOrange' }
}

const ratingText = computed(() => getScoreRating().text)
const ratingEmoji = computed(() => getScoreRating().emoji)
const ratingClass = computed(() => getScoreRating().cls)
</script>

<style scoped>
/* Background family */
.quiz {
  min-height: 100vh;
  width: 100vw;
  color: rgba(255, 255, 255, 0.92);
  padding-bottom: 88px;

  background:
    radial-gradient(900px 520px at 20% 10%, rgba(216, 70, 239, 0.18), transparent 55%),
    radial-gradient(900px 520px at 78% 18%, rgba(59, 130, 246, 0.18), transparent 55%),
    radial-gradient(900px 520px at 50% 96%, rgba(16, 185, 129, 0.08), transparent 60%),
    linear-gradient(180deg, #0b0a14 0%, #070a13 55%, #06151a 100%);
  overflow-x: hidden;
}

.wrap {
  width: min(520px, 92vw);
  margin: 0 auto;
}
.pad {
  padding: 18px 0 0;
}
.centerPad {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 0 0;
}

/* base card */
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
  letter-spacing: -0.01em;
}
.h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: -0.01em;
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

/* Start back */
.ghostBack {
  border: 0;
  background: transparent;
  color: rgba(210, 225, 255, 0.8);
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
  box-shadow:
    0 14px 34px rgba(59, 130, 246, 0.18),
    0 14px 34px rgba(217, 70, 239, 0.12);
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
  box-shadow:
    0 14px 34px rgba(59, 130, 246, 0.18),
    0 14px 34px rgba(217, 70, 239, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition:
    transform 160ms ease,
    filter 160ms ease,
    opacity 160ms ease;
}
.ctaBtn:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
}
.ctaBtn:active {
  transform: translateY(0px) scale(0.99);
}

/* Playing head */
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
.ghostIcon:hover {
  background: rgba(255, 255, 255, 0.045);
  border-color: rgba(160, 190, 255, 0.28);
  transform: translateY(-1px);
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
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(160, 190, 255, 0.14);
  overflow: hidden;
}
.progressTrack.small {
  height: 9px;
}
.progressFill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #d946ef 0%, #3b82f6 100%);
  transition: width 260ms ease;
}

/* Subject outline */
.outlineBadge {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(160, 190, 255, 0.18);
  background: rgba(255, 255, 255, 0.03);
  font-weight: 900;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.86);
}

/* options */
.optionBtn {
  width: 100%;
  border-radius: 16px;
  padding: 14px 14px;
  border: 1px solid rgba(160, 190, 255, 0.16);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    opacity 160ms ease;
  text-align: left;
}
.optionBtn:hover {
  transform: translateY(-1px);
  border-color: rgba(217, 70, 239, 0.28);
  background: rgba(255, 255, 255, 0.045);
}
.optionBtn:active {
  transform: scale(0.99);
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

/* feedback */
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

/* complete */
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

.outlineBtn {
  width: 100%;
  height: 52px;
  border-radius: 16px;
  border: 1px solid rgba(160, 190, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 950;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}
.outlineBtn:hover {
  transform: translateY(-1px);
  border-color: rgba(160, 190, 255, 0.3);
  background: rgba(255, 255, 255, 0.045);
}
.outlineBtn:active {
  transform: scale(0.99);
}

.mini {
  width: 18px;
  height: 18px;
}

/* confetti */
.confetti {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.confettiPiece {
  position: absolute;
  top: -10px;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: #fbbf24;
  animation: confetti 1.4s ease-in forwards;
}
@keyframes confetti {
  from {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  to {
    transform: translateY(110vh) rotate(360deg);
    opacity: 0;
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
