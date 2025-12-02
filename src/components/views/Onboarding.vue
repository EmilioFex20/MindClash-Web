<template>
  <main class="ob">
    <!-- Header -->
    <header class="top">
      <div class="topRow">
        <button
          class="iconBtn"
          type="button"
          @click="handleBack"
          :disabled="currentStep === 0"
          aria-label="Back"
        >
          <ChevronLeft class="icon" />
        </button>

        <div class="stepCount">{{ currentStep + 1 }} of {{ ONBOARDING_STEPS.length }}</div>

        <!-- spacer so the count stays centered-ish -->
        <div style="width: 44px"></div>
      </div>

      <div class="topInfo">
        <div
          class="progressTrack"
          role="progressbar"
          :aria-valuenow="currentStepData.progress"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="progressFill" :style="{ width: currentStepData.progress + '%' }"></div>
        </div>
        <h1 class="topTitle">{{ currentStepData.title }}</h1>
      </div>
    </header>

    <!-- Content -->
    <section class="content">
      <div class="card">
        <!-- STEP 0 -->
        <div v-if="currentStep === 0" class="center stack-lg">
          <div class="bigBadge pop">
            <Sparkles class="bigIcon" />
          </div>
          <div class="stack-sm">
            <h2 class="h2">Welcome to CodeQuest!</h2>
            <p class="muted">Let's set up your learning adventure. This will only take a minute!</p>
          </div>
        </div>

        <!-- STEP 1 -->
        <div v-else-if="currentStep === 1" class="stack-lg">
          <div class="center stack-sm">
            <div class="midBadge">
              <User class="midIcon primary" />
            </div>
            <h2 class="h3">Create Your Profile</h2>
            <p class="muted small">Choose a username and avatar</p>
          </div>

          <div class="stack-md">
            <div>
              <label class="label">Username</label>
              <input
                class="input"
                placeholder="Enter your username"
                v-model.trim="userData.username"
                maxlength="24"
              />
              <div class="hint" :class="{ ok: userData.username.length >= 3 }">
                {{ userData.username.length }}/24 • min 3 chars
              </div>
            </div>

            <div>
              <label class="label">Choose Your Avatar</label>
              <div class="avatarGrid">
                <button
                  v-for="avatar in AVATAR_OPTIONS"
                  :key="avatar.id"
                  type="button"
                  class="avatarCard"
                  :class="{ selected: userData.selectedAvatar === avatar.id }"
                  @click="userData.selectedAvatar = avatar.id"
                >
                  <div class="emoji">{{ avatar.emoji }}</div>
                  <div class="avatarName">{{ avatar.name }}</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 2 -->
        <div v-else-if="currentStep === 2" class="stack-lg">
          <div class="center stack-sm">
            <div class="midBadge secondaryBg">
              <Target class="midIcon secondary" />
            </div>
            <h2 class="h3">Set Your Goals</h2>
            <p class="muted small">How much time can you dedicate daily?</p>
          </div>

          <div class="stack-sm">
            <button
              v-for="goal in LEARNING_GOALS"
              :key="goal.id"
              type="button"
              class="goalRow"
              :class="{ selected2: userData.learningGoal === goal.id }"
              @click="userData.learningGoal = goal.id"
            >
              <div class="goalIcon">{{ goal.icon }}</div>
              <div class="goalBody">
                <div class="goalTitle">{{ goal.title }}</div>
                <div class="goalSub">{{ goal.subtitle }}</div>
              </div>
            </button>
          </div>
        </div>

        <!-- STEP 3 -->
        <div v-else class="center stack-lg">
          <div class="bigBadge pop success">
            <div class="emojiBig">{{ selectedAvatarEmoji }}</div>
          </div>

          <div class="stack-sm">
            <h2 class="h2">You're All Set, {{ userData.username || 'friend' }}!</h2>
            <p class="muted">
              Ready to start your coding adventure? Let's begin with your first lesson!
            </p>
          </div>

          <div class="summary">
            <div class="summaryTitle">Your Profile:</div>
            <div class="summaryText">{{ selectedAvatarName }} • {{ selectedGoalTitle }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <button
        class="ctaBtn"
        type="button"
        @click="handleNext"
        :disabled="!canProceed()"
        :class="{ pulse: isAnimating }"
      >
        {{ currentStep === ONBOARDING_STEPS.length - 1 ? 'Start Learning!' : 'Continue' }}
        <ChevronRight class="ctaIcon" />
      </button>
    </footer>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, User, Target, Sparkles } from 'lucide-vue-next'
import { useUsers } from '@/composables/useUsers'

const router = useRouter()
const { uid, getProfile, saveOnboarding } = useUsers()

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome to CodeQuest!', progress: 25 },
  { id: 'profile', title: 'Create Your Profile', progress: 50 },
  { id: 'goals', title: 'Set Your Goals', progress: 75 },
  { id: 'ready', title: 'Ready to Start!', progress: 100 },
]

const AVATAR_OPTIONS = [
  { id: 'robot', emoji: '🤖', name: 'Robo Coder' },
  { id: 'wizard', emoji: '🧙‍♂️', name: 'Code Wizard' },
  { id: 'ninja', emoji: '🥷', name: 'Bug Ninja' },
  { id: 'scientist', emoji: '👩‍🔬', name: 'Data Scientist' },
  { id: 'astronaut', emoji: '👨‍🚀', name: 'Space Explorer' },
  { id: 'superhero', emoji: '🦸‍♀️', name: 'Code Hero' },
]

const LEARNING_GOALS = [
  { id: 'beginner', title: 'Just Starting', subtitle: '5-10 min/day', icon: '🌱' },
  { id: 'casual', title: 'Casual Learner', subtitle: '10-15 min/day', icon: '📚' },
  { id: 'serious', title: 'Serious Student', subtitle: '15-30 min/day', icon: '🎯' },
  { id: 'intense', title: 'Code Warrior', subtitle: '30+ min/day', icon: '⚡' },
]

const currentStep = ref(0)
const checkingProfile = ref(true)
const isAnimating = ref(false)

const userData = reactive({
  username: '',
  selectedAvatar: '',
  learningGoal: '',
})

const currentStepData = computed(() => ONBOARDING_STEPS[currentStep.value])

const selectedAvatarEmoji = computed(
  () => AVATAR_OPTIONS.find((a) => a.id === userData.selectedAvatar)?.emoji || '🎉',
)
const selectedAvatarName = computed(
  () => AVATAR_OPTIONS.find((a) => a.id === userData.selectedAvatar)?.name || 'New Adventurer',
)
const selectedGoalTitle = computed(
  () => LEARNING_GOALS.find((g) => g.id === userData.learningGoal)?.title || '—',
)

watch(
  uid,
  async (newUid) => {
    if (!newUid) {
      // si no hay sesión, decide a dónde mandar:
      checkingProfile.value = false
      // router.replace("/login") // recomendado
      return
    }

    try {
      const profile = await getProfile()

      const completed =
        !!profile?.username?.trim() && !!profile?.selectedAvatar && !!profile?.learningGoal

      if (completed) {
        router.replace('/dashboard')
        return
      }

      // opcional: si ya tenía algo guardado, lo precargas
      if (profile) {
        userData.username = profile.username ?? ''
        userData.selectedAvatar = profile.selectedAvatar ?? ''
        userData.learningGoal = profile.learningGoal ?? ''
      }
    } finally {
      checkingProfile.value = false
    }
  },
  { immediate: true },
)

const canProceed = () => {
  switch (currentStep.value) {
    case 0:
      return true
    case 1:
      return userData.username.length >= 3 && !!userData.selectedAvatar
    case 2:
      return !!userData.learningGoal
    case 3:
      return true
    default:
      return false
  }
}

const handleNext = async () => {
  if (currentStep.value < ONBOARDING_STEPS.length - 1) {
    currentStep.value += 1
    return
  }
  try {
    if (!uid.value) throw new Error('Missing user id')

    await saveOnboarding({
      username: userData.username,
      selectedAvatar: userData.selectedAvatar,
      learningGoal: userData.learningGoal,
    })

    router.replace('/dashboard')
  } catch (e) {
    console.error('Error saving onboarding:', e)
  }
}

const handleBack = () => {
  if (currentStep.value > 0) currentStep.value -= 1
}
</script>

<style scoped>
/* Fullscreen background */
.ob {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  color: rgba(255, 255, 255, 0.92);

  background:
    radial-gradient(900px 520px at 20% 10%, rgba(216, 70, 239, 0.2), transparent 55%),
    radial-gradient(900px 520px at 78% 18%, rgba(59, 130, 246, 0.2), transparent 55%),
    radial-gradient(900px 520px at 50% 96%, rgba(16, 185, 129, 0.1), transparent 60%),
    linear-gradient(180deg, #0b0a14 0%, #070a13 55%, #06151a 100%);
  overflow-x: hidden;
}

/* Header */
.top {
  padding: 18px 16px 10px;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}
.topRow {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
}
.iconBtn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(160, 190, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.85);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    opacity 160ms ease;
}
.iconBtn:hover {
  transform: translateY(-1px);
  border-color: rgba(160, 190, 255, 0.34);
  background: rgba(255, 255, 255, 0.045);
}
.iconBtn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
}
.icon {
  width: 18px;
  height: 18px;
}

.stepCount {
  text-align: center;
  font-size: 13px;
  color: rgba(210, 225, 255, 0.62);
  font-weight: 650;
}

.topInfo {
  margin-top: 12px;
  display: grid;
  gap: 10px;
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
  box-shadow: 0 10px 26px rgba(59, 130, 246, 0.2);
  transition: width 260ms ease;
}
.topTitle {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
  color: rgba(255, 255, 255, 0.9);
}

/* Content area */
.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 16px;
}
.card {
  width: min(480px, 92vw);
  border-radius: 20px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(120, 140, 190, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* Footer */
.footer {
  padding: 14px 16px 22px;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}
.ctaBtn {
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
  background: linear-gradient(90deg, #d946ef 0%, #3b82f6 100%);
  box-shadow:
    0 14px 34px rgba(59, 130, 246, 0.18),
    0 14px 34px rgba(217, 70, 239, 0.12);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
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
.ctaBtn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  filter: none;
}
.ctaIcon {
  width: 18px;
  height: 18px;
}

/* Step blocks */
.stack-lg {
  display: grid;
  gap: 18px;
}
.stack-md {
  display: grid;
  gap: 14px;
}
.stack-sm {
  display: grid;
  gap: 10px;
}
.center {
  text-align: center;
  justify-items: center;
}

.h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 850;
}
.h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 850;
}
.muted {
  margin: 0;
  color: rgba(210, 225, 255, 0.66);
  line-height: 1.55;
}
.small {
  font-size: 13px;
}

/* Badges/icons */
.bigBadge {
  width: 92px;
  height: 92px;
  border-radius: 24px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #d946ef 0%, #3b82f6 100%);
  box-shadow:
    0 14px 34px rgba(59, 130, 246, 0.18),
    0 14px 34px rgba(217, 70, 239, 0.12);
}
.bigIcon {
  width: 44px;
  height: 44px;
  color: rgba(255, 255, 255, 0.92);
}

.midBadge {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: rgba(217, 70, 239, 0.1);
  border: 1px solid rgba(217, 70, 239, 0.2);
}
.secondaryBg {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.22);
}
.midIcon {
  width: 30px;
  height: 30px;
}
.primary {
  color: #d946ef;
}
.secondary {
  color: #3b82f6;
}
.success {
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
}

/* Inputs */
.label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
}
.input {
  width: 100%;
  height: 46px;
  border-radius: 14px;
  border: 1px solid rgba(160, 190, 255, 0.18);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.92);
  padding: 0 14px;
  outline: none;
  transition:
    border-color 160ms ease,
    background 160ms ease;
}
.input::placeholder {
  color: rgba(210, 225, 255, 0.4);
}
.input:focus {
  border-color: rgba(217, 70, 239, 0.45);
  background: rgba(255, 255, 255, 0.045);
}
.hint {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(210, 225, 255, 0.52);
}
.hint.ok {
  color: rgba(16, 185, 129, 0.75);
}

/* Avatar grid */
.avatarGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.avatarCard {
  border-radius: 16px;
  padding: 12px 10px;
  border: 1px solid rgba(160, 190, 255, 0.16);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
  text-align: center;
}
.avatarCard:hover {
  transform: translateY(-1px);
  border-color: rgba(217, 70, 239, 0.35);
  background: rgba(255, 255, 255, 0.045);
}
.avatarCard.selected {
  border-color: rgba(217, 70, 239, 0.55);
  background: rgba(217, 70, 239, 0.08);
}
.emoji {
  font-size: 26px;
  line-height: 1;
  margin-bottom: 6px;
}
.avatarName {
  font-size: 11px;
  font-weight: 700;
  opacity: 0.9;
}

/* Goals list */
.goalRow {
  width: 100%;
  border-radius: 16px;
  padding: 12px 12px;
  border: 1px solid rgba(160, 190, 255, 0.16);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}
.goalRow:hover {
  transform: translateY(-1px);
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(255, 255, 255, 0.045);
}
.goalRow.selected2 {
  border-color: rgba(59, 130, 246, 0.6);
  background: rgba(59, 130, 246, 0.1);
}
.goalIcon {
  font-size: 26px;
  width: 34px;
  text-align: center;
}
.goalBody {
  flex: 1;
}
.goalTitle {
  font-weight: 800;
  font-size: 14px;
}
.goalSub {
  font-size: 12px;
  color: rgba(210, 225, 255, 0.62);
  margin-top: 2px;
}

/* Summary */
.summary {
  width: 100%;
  border-radius: 14px;
  padding: 12px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(160, 190, 255, 0.16);
  text-align: left;
}
.summaryTitle {
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.88);
}
.summaryText {
  font-size: 13px;
  color: rgba(210, 225, 255, 0.66);
}

/* Animations */
.pop {
  animation: pop 650ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
}
.pulse {
  animation: pulse 650ms ease-out both;
}
.emojiBig {
  font-size: 38px;
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
  0% {
    box-shadow: 0 0 0 0 rgba(217, 70, 239, 0.35);
  }
  100% {
    box-shadow: 0 0 0 18px rgba(217, 70, 239, 0);
  }
}
</style>
