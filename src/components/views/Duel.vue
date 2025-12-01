<template>
  <main class="duel">
    <!-- LOBBY -->
    <section v-if="duelState === 'lobby'" class="pad">
      <div class="wrap stackLg">
        <header class="topBar">
          <button class="ghostBack" type="button" @click="router.back()">
            <ArrowLeft class="mini" />
            Back
          </button>

          <span class="onlineBadge">
            <span class="dot"></span>
            Online
          </span>
        </header>

        <div class="center stackSm">
          <div class="badgeBig pop">
            <Swords class="bigIcon" />
          </div>
          <div>
            <h1 class="h1">1v1 Duel Arena</h1>
            <p class="muted">Challenge other players in real-time</p>
          </div>
        </div>

        <div class="card padLg stackSm">
          <h2 class="h2">How it works:</h2>
          <div class="how">
            <div class="howRow">
              <span class="step">1</span>
              <span class="muted">Answer questions faster than your opponent</span>
            </div>
            <div class="howRow">
              <span class="step">2</span>
              <span class="muted">Each correct answer gives you 100 points</span>
            </div>
            <div class="howRow">
              <span class="step">3</span>
              <span class="muted">Highest score wins the duel!</span>
            </div>
          </div>
        </div>

        <div class="stackSm">
          <h2 class="h2">Available Opponents</h2>

          <div class="stackSm">
            <button
              v-for="o in MOCK_OPPONENTS"
              :key="o.id"
              class="card opp"
              type="button"
              @click="selectOpponentAndMatch(o)"
            >
              <div class="oppAvatar">
                <span class="emoji">{{ o.avatar }}</span>
              </div>

              <div class="oppMeta">
                <div class="oppTop">
                  <span class="oppName">{{ o.name }}</span>
                  <span class="lvlBadge">Level {{ o.level }}</span>
                </div>
                <div class="muted small">{{ o.winRate }}% win rate</div>
              </div>

              <div class="oppStatus">
                <span class="dot good"></span>
                <span class="goodText">Online</span>
              </div>
            </button>
          </div>
        </div>

        <button class="ctaBtn" type="button" @click="startMatchmaking">
          Quick Match <Zap class="mini" />
        </button>
      </div>

      <BottomNavbar currentPage="duel" />
    </section>

    <!-- MATCHMAKING -->
    <section v-else-if="duelState === 'matchmaking'" class="centerPad">
      <div class="wrap">
        <div class="card padXL center stackLg">
          <div class="mmIcon pulse">
            <Users class="midIcon" />
          </div>

          <div class="stackSm">
            <h2 class="h2Big">Finding Opponent...</h2>
            <p class="muted">Matching you with a player of similar skill</p>
          </div>

          <div class="dots" aria-hidden="true">
            <span class="bDot" style="animation-delay: 0s"></span>
            <span class="bDot" style="animation-delay: 0.2s"></span>
            <span class="bDot" style="animation-delay: 0.4s"></span>
          </div>
        </div>
      </div>

      <BottomNavbar currentPage="duel" />
    </section>

    <!-- VERSUS -->
    <section v-else-if="duelState === 'versus'" class="centerPad">
      <div class="wrap stackLg">
        <div class="center">
          <h1 class="h1">Duel Starting!</h1>
          <p class="muted">Get ready to battle</p>
        </div>

        <div class="card padLg">
          <div class="vsRow">
            <div class="pCol">
              <div class="pAvatar pMe"><span class="emoji">🥷</span></div>
              <div class="pName">You</div>
              <div class="muted tiny">Level 5</div>
            </div>

            <div class="vsCol">
              <div class="vsIcon"><Swords class="mini badText" /></div>
              <div class="vsText">VS</div>
            </div>

            <div class="pCol">
              <div class="pAvatar pOpp">
                <span class="emoji">{{ selectedOpponent?.avatar }}</span>
              </div>
              <div class="pName">{{ selectedOpponent?.name }}</div>
              <div class="muted tiny">Level {{ selectedOpponent?.level }}</div>
            </div>
          </div>
        </div>

        <button class="ctaBtn danger" type="button" @click="startDuel">
          Start Battle! <Play class="mini" />
        </button>
      </div>

      <BottomNavbar currentPage="duel" />
    </section>

    <!-- PLAYING -->
    <section v-else-if="duelState === 'playing'" class="pad">
      <div class="wrap stackMd">
        <!-- Header -->
        <header class="playHead">
          <div class="timer">
            <Clock class="mini dim" />
            <span class="time" :class="{ dangerText: timeLeft <= 5 }">{{ timeLeft }}s</span>
          </div>

          <div class="muted small">
            Question {{ currentQuestion + 1 }}/{{ DUEL_QUESTIONS.length }}
          </div>
        </header>

        <!-- Scores -->
        <div class="scoreGrid">
          <div class="card score meScore">
            <div class="scoreRow">
              <div class="chip chipMe"><span class="emoji">🥷</span></div>
              <div>
                <div class="muted tiny">You</div>
                <div class="scoreNum">{{ playerScore }}</div>
              </div>
            </div>
          </div>

          <div class="card score oppScore">
            <div class="scoreRow">
              <div class="chip chipOpp">
                <span class="emoji">{{ selectedOpponent?.avatar }}</span>
              </div>
              <div>
                <div class="muted tiny">{{ selectedOpponent?.name }}</div>
                <div class="scoreNum">{{ opponentScore }}</div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="progressTrack"
          role="progressbar"
          :aria-valuenow="progress"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="progressFill" :style="{ width: progress + '%' }"></div>
        </div>

        <!-- Question -->
        <div class="card padLg center stackSm">
          <span class="outlineBadge">{{ currentQuestionData.subject }}</span>
          <h2 class="h2">{{ currentQuestionData.question }}</h2>
        </div>

        <!-- Options -->
        <div class="stackSm">
          <button
            v-for="(opt, idx) in currentQuestionData.options"
            :key="idx"
            class="optionBtn"
            :class="{ selected: selectedAnswer === idx }"
            type="button"
            :disabled="selectedAnswer !== null"
            @click="handleAnswerSelect(idx)"
          >
            <span class="optLetter">{{ String.fromCharCode(65 + idx) }}</span>
            <span class="optText">{{ opt }}</span>
          </button>
        </div>

        <!-- Results overlay -->
        <div v-if="showResults" class="card padSm overlay">
          <div class="ovRow">
            <div class="ovSide">
              <span class="muted small">Your answer:</span>
              <CheckCircle v-if="playerAnswers[currentQuestion]" class="mini okText" />
              <XCircle v-else class="mini badText" />
            </div>

            <div class="ovSide">
              <span class="muted small">Opponent:</span>
              <CheckCircle v-if="opponentAnswers[currentQuestion]" class="mini okText" />
              <XCircle v-else class="mini badText" />
            </div>
          </div>
        </div>
      </div>

      <BottomNavbar currentPage="duel" />
    </section>

    <!-- RESULTS -->
    <section v-else class="centerPad">
      <div class="wrap">
        <div class="card padLg center stackLg">
          <div class="badgeBig pop" :class="resultBadgeClass">
            <Crown v-if="playerWon" class="bigIcon" />
            <Star v-else-if="isDraw" class="bigIcon" />
            <Trophy v-else class="bigIcon" />
          </div>

          <div class="stackSm">
            <h1 class="h1" :class="resultTitleClass">{{ resultTitle }}</h1>
            <p class="muted">{{ resultSubtitle }}</p>
          </div>

          <div class="finalGrid">
            <div class="finalBox" :class="{ winBox: playerWon }">
              <div class="emoji big">🥷</div>
              <div class="scoreNum">{{ playerScore }}</div>
              <div class="muted tiny">You</div>
            </div>

            <div class="finalBox" :class="{ winBox: !playerWon && !isDraw }">
              <div class="emoji big">{{ selectedOpponent?.avatar }}</div>
              <div class="scoreNum">{{ opponentScore }}</div>
              <div class="muted tiny">{{ selectedOpponent?.name }}</div>
            </div>
          </div>

          <div class="stats">
            <div class="statRow">
              <span class="muted">Correct Answers:</span>
              <span class="strong">{{ playerCorrect }}/{{ DUEL_QUESTIONS.length }}</span>
            </div>
            <div class="statRow">
              <span class="muted">XP Earned:</span>
              <span class="strong xpPlus">+{{ playerScore }} XP</span>
            </div>
          </div>

          <div class="stackSm" style="width: 100%">
            <button class="ctaBtn" type="button" @click="resetDuel">Play Again</button>
            <button class="outlineBtn" type="button" @click="router.push('/dashboard')">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <BottomNavbar currentPage="duel" />
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavbar from '@/components/BottomNavbar.vue'
import {
  Swords,
  ArrowLeft,
  Clock,
  Trophy,
  Star,
  Zap,
  Users,
  Play,
  Crown,
  CheckCircle,
  XCircle,
} from 'lucide-vue-next'

const router = useRouter()

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
]

const MOCK_OPPONENTS = [
  { id: 1, name: 'AlgoMaster', avatar: '🤖', level: 6, winRate: 78, status: 'online' },
  { id: 2, name: 'CodeWizard', avatar: '🧙‍♂️', level: 4, winRate: 65, status: 'online' },
  { id: 3, name: 'DataNinja', avatar: '🥷', level: 7, winRate: 82, status: 'online' },
  { id: 4, name: 'ByteHunter', avatar: '🦸‍♀️', level: 5, winRate: 71, status: 'online' },
]

const duelState = ref('lobby') // "lobby" | "matchmaking" | "versus" | "playing" | "results"
const selectedOpponent = ref(null)

const currentQuestion = ref(0)
const playerScore = ref(0)
const opponentScore = ref(0)

const playerAnswers = ref([])
const opponentAnswers = ref([])

const selectedAnswer = ref(null)
const timeLeft = ref(15)
const showResults = ref(false)

/* derived */
const currentQuestionData = computed(() => DUEL_QUESTIONS[currentQuestion.value])
const progress = computed(() =>
  Math.round(((currentQuestion.value + 1) / DUEL_QUESTIONS.length) * 100),
)

/* ----- Timer ----- */
let t = null
const clearTimer = () => {
  if (t) {
    clearTimeout(t)
    t = null
  }
}
const tick = () => {
  clearTimer()
  if (duelState.value !== 'playing') return
  if (showResults.value) return
  if (timeLeft.value <= 0) return

  t = setTimeout(() => {
    timeLeft.value -= 1
    if (timeLeft.value <= 0 && duelState.value === 'playing' && !showResults.value) handleTimeUp()
    else tick()
  }, 1000)
}
watch([duelState, showResults, timeLeft], () => {
  if (duelState.value === 'playing') tick()
  else clearTimer()
})
onBeforeUnmount(() => clearTimer())

/* ----- Simulate opponent answer when player answers ----- */
let oppT = null
const clearOppTimer = () => {
  if (oppT) {
    clearTimeout(oppT)
    oppT = null
  }
}

watch(selectedAnswer, (val) => {
  if (duelState.value !== 'playing') return
  if (val === null) return

  clearOppTimer()

  const opponentDelay = Math.random() * 3000 + 1000 // 1-4s
  oppT = setTimeout(() => {
    const opponentCorrect = Math.random() > 0.3 // 70% chance correct
    opponentAnswers.value = [...opponentAnswers.value, opponentCorrect]
    if (opponentCorrect) opponentScore.value += 100

    setTimeout(() => {
      showResults.value = true
      setTimeout(() => nextQuestion(), 1200)
    }, 350)
  }, opponentDelay)
})

onBeforeUnmount(() => clearOppTimer())

/* actions */
const startMatchmaking = () => {
  duelState.value = 'matchmaking'
  setTimeout(() => {
    const randomOpponent = MOCK_OPPONENTS[Math.floor(Math.random() * MOCK_OPPONENTS.length)]
    selectedOpponent.value = randomOpponent
    duelState.value = 'versus'
  }, 1400)
}

const selectOpponentAndMatch = (opp) => {
  selectedOpponent.value = opp
  startMatchmaking()
}

const startDuel = () => {
  duelState.value = 'playing'
  currentQuestion.value = 0
  playerScore.value = 0
  opponentScore.value = 0
  playerAnswers.value = []
  opponentAnswers.value = []
  selectedAnswer.value = null
  timeLeft.value = 15
  showResults.value = false
  tick()
}

const handleAnswerSelect = (idx) => {
  if (selectedAnswer.value !== null) return

  selectedAnswer.value = idx
  const ok = idx === currentQuestionData.value.correctAnswer
  playerAnswers.value = [...playerAnswers.value, ok]
  if (ok) playerScore.value += 100

  // si respondes, el timer se puede seguir (pero no avanza hasta resultados), ok.
}

const handleTimeUp = () => {
  if (selectedAnswer.value !== null) return
  selectedAnswer.value = -1
  playerAnswers.value = [...playerAnswers.value, false]

  // si se acaba el tiempo, igual simulamos respuesta del oponente rápido
  const opponentCorrect = Math.random() > 0.3
  opponentAnswers.value = [...opponentAnswers.value, opponentCorrect]
  if (opponentCorrect) opponentScore.value += 100

  showResults.value = true
  setTimeout(() => nextQuestion(), 1200)
}

const nextQuestion = () => {
  if (currentQuestion.value < DUEL_QUESTIONS.length - 1) {
    currentQuestion.value += 1
    selectedAnswer.value = null
    timeLeft.value = 15
    showResults.value = false
    tick()
  } else {
    duelState.value = 'results'
  }
}

const resetDuel = () => {
  duelState.value = 'lobby'
  selectedOpponent.value = null
  currentQuestion.value = 0
  playerScore.value = 0
  opponentScore.value = 0
  playerAnswers.value = []
  opponentAnswers.value = []
  selectedAnswer.value = null
  timeLeft.value = 15
  showResults.value = false
}

/* results computed */
const playerWon = computed(() => playerScore.value > opponentScore.value)
const isDraw = computed(() => playerScore.value === opponentScore.value)
const playerCorrect = computed(() => playerAnswers.value.filter(Boolean).length)

const resultTitle = computed(() =>
  playerWon.value ? 'Victory!' : isDraw.value ? 'Draw!' : 'Defeat!',
)
const resultSubtitle = computed(() =>
  playerWon.value
    ? 'Great job! You outplayed your opponent.'
    : isDraw.value
      ? 'Evenly matched! Try again for a decisive win.'
      : 'Better luck next time! Keep practicing.',
)

const resultTitleClass = computed(() =>
  playerWon.value ? 'okText' : isDraw.value ? 'warnText' : 'badText',
)

const resultBadgeClass = computed(() =>
  playerWon.value ? 'success' : isDraw.value ? 'warn' : 'danger',
)
</script>

<style scoped>
.duel {
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

.card {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(120, 140, 190, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.padLg {
  padding: 18px;
}
.padXL {
  padding: 24px;
}
.padSm {
  padding: 12px;
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
}
.h2Big {
  margin: 0;
  font-size: 18px;
  font-weight: 950;
  letter-spacing: -0.01em;
}
.muted {
  margin: 0;
  color: rgba(210, 225, 255, 0.66);
  line-height: 1.55;
}
.small {
  font-size: 12px;
}
.tiny {
  font-size: 11px;
}
.strong {
  font-weight: 950;
}
.badText {
  color: #ef4444;
}
.okText {
  color: #10b981;
}
.warnText {
  color: #f59e0b;
}

.topBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.ghostBack {
  border: 0;
  background: transparent;
  color: rgba(210, 225, 255, 0.8);
  font-weight: 950;
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

.onlineBadge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.18);
  color: rgba(16, 185, 129, 0.95);
  font-size: 12px;
  font-weight: 950;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.95);
}
.dot.good {
  background: rgba(16, 185, 129, 0.95);
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
  background: linear-gradient(135deg, #10b981 0%, #22c55e 100%);
}
.badgeBig.warn {
  background: linear-gradient(135deg, #f59e0b 0%, #fb923c 100%);
}
.badgeBig.danger {
  background: linear-gradient(135deg, #ef4444 0%, #fb7185 100%);
}

.bigIcon {
  width: 38px;
  height: 38px;
  color: rgba(255, 255, 255, 0.93);
}
.mini {
  width: 18px;
  height: 18px;
}
.midIcon {
  width: 32px;
  height: 32px;
  color: rgba(255, 255, 255, 0.93);
}

.pop {
  animation: pop 650ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
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

.how {
  display: grid;
  gap: 10px;
}
.howRow {
  display: flex;
  align-items: center;
  gap: 10px;
}
.step {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(217, 70, 239, 0.1);
  border: 1px solid rgba(217, 70, 239, 0.18);
  color: rgba(217, 70, 239, 0.95);
  font-weight: 950;
  font-size: 12px;
}

.opp {
  width: 100%;
  text-align: left;
  cursor: pointer;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}
.opp:hover {
  transform: translateY(-1px);
  border-color: rgba(160, 190, 255, 0.32);
  background: rgba(255, 255, 255, 0.045);
}
.opp:active {
  transform: scale(0.99);
}

.oppAvatar {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(217, 70, 239, 0.2));
  border: 1px solid rgba(160, 190, 255, 0.16);
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}
.emoji {
  font-size: 22px;
}
.emoji.big {
  font-size: 26px;
}

.oppMeta {
  flex: 1;
  min-width: 0;
}
.oppTop {
  display: flex;
  align-items: center;
  gap: 10px;
}
.oppName {
  font-weight: 950;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lvlBadge {
  font-size: 10px;
  font-weight: 950;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(160, 190, 255, 0.16);
  background: rgba(255, 255, 255, 0.03);
  flex: 0 0 auto;
}
.oppStatus {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}
.goodText {
  color: rgba(16, 185, 129, 0.95);
  font-weight: 950;
  font-size: 12px;
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
    filter 160ms ease;
}
.ctaBtn:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
}
.ctaBtn:active {
  transform: scale(0.99);
}
.ctaBtn.danger {
  background: linear-gradient(90deg, #ef4444 0%, #fb923c 100%);
}

.mmIcon {
  width: 70px;
  height: 70px;
  border-radius: 20px;
  background: linear-gradient(135deg, #d946ef 0%, #3b82f6 100%);
  display: grid;
  place-items: center;
  margin: 0 auto;
  box-shadow:
    0 14px 34px rgba(59, 130, 246, 0.18),
    0 14px 34px rgba(217, 70, 239, 0.12);
}
.pulse {
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}

.dots {
  display: flex;
  gap: 6px;
  justify-content: center;
}
.bDot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(217, 70, 239, 0.95);
  animation: bounce 900ms ease-in-out infinite;
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

/* VS screen */
.vsRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.pCol {
  text-align: center;
  display: grid;
  gap: 8px;
  justify-items: center;
}
.pAvatar {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(160, 190, 255, 0.16);
}
.pMe {
  background: linear-gradient(135deg, #d946ef 0%, #3b82f6 100%);
}
.pOpp {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(217, 70, 239, 0.2));
}
.pName {
  font-weight: 950;
}
.vsCol {
  text-align: center;
  display: grid;
  justify-items: center;
  gap: 6px;
}
.vsIcon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.18);
  display: grid;
  place-items: center;
}
.vsText {
  color: rgba(239, 68, 68, 0.95);
  font-weight: 950;
}

/* Playing */
.playHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
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
.dangerText {
  color: #ef4444;
  animation: pulseRed 900ms ease-in-out infinite;
}
@keyframes pulseRed {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.scoreGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.score {
  padding: 12px;
}
.scoreRow {
  display: flex;
  align-items: center;
  gap: 10px;
}
.chip {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(160, 190, 255, 0.14);
}
.chipMe {
  background: rgba(217, 70, 239, 0.1);
}
.chipOpp {
  background: rgba(59, 130, 246, 0.1);
}
.scoreNum {
  font-size: 18px;
  font-weight: 950;
}
.meScore {
  background: rgba(217, 70, 239, 0.05);
  border-color: rgba(217, 70, 239, 0.18);
}
.oppScore {
  background: rgba(59, 130, 246, 0.05);
  border-color: rgba(59, 130, 246, 0.18);
}

.progressTrack {
  width: 100%;
  height: 10px;
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
  font-weight: 950;
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
.optionBtn.selected {
  border-color: rgba(217, 70, 239, 0.55);
  background: rgba(217, 70, 239, 0.08);
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

/* overlay */
.overlay {
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(160, 190, 255, 0.22);
}
.ovRow {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.ovSide {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* final */
.finalGrid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.finalBox {
  border-radius: 18px;
  padding: 14px;
  border: 1px solid rgba(160, 190, 255, 0.14);
  background: rgba(255, 255, 255, 0.03);
}
.winBox {
  border-color: rgba(16, 185, 129, 0.22);
  background: rgba(16, 185, 129, 0.06);
}
.stats {
  width: 100%;
  border-radius: 18px;
  padding: 12px;
  border: 1px solid rgba(160, 190, 255, 0.14);
  background: rgba(255, 255, 255, 0.03);
  text-align: left;
}
.statRow {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 0;
}
.xpPlus {
  color: rgba(217, 70, 239, 0.95);
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
</style>
