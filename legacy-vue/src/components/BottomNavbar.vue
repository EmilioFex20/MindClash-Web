<template>
  <nav class="bnWrap" aria-label="Bottom navigation">
    <div class="bnInner">
      <button
        class="bnBtn"
        :class="{ active: selectedTab === 'dashboard' }"
        type="button"
        @click="handleNavigation('dashboard', '/dashboard')"
      >
        <Home class="bnIcon" />
        <span class="bnText">Home</span>
      </button>

      <button
        class="bnBtn"
        :class="{ active: selectedTab === 'quiz' }"
        type="button"
        @click="handleNavigation('quiz', '/quiz')"
      >
        <Target class="bnIcon" />
        <span class="bnText">Quiz</span>
      </button>

      <button
        class="bnBtn"
        :class="{ active: selectedTab === 'duel' }"
        type="button"
        @click="handleNavigation('duel', '/duel')"
      >
        <Swords class="bnIcon" />
        <span class="bnText">Duel</span>
      </button>

      <button
        class="bnBtn"
        :class="{ active: selectedTab === 'leaderboard' }"
        type="button"
        @click="handleNavigation('leaderboard', '/leaderboard')"
      >
        <Trophy class="bnIcon" />
        <span class="bnText">Ranks</span>
      </button>

      <button
        class="bnBtn"
        :class="{ active: selectedTab === 'profile' }"
        type="button"
        @click="handleNavigation('profile', '/profile')"
      >
        <User class="bnIcon" />
        <span class="bnText">Profile</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Home, Target, Swords, Trophy, User } from 'lucide-vue-next'

const props = defineProps({
  currentPage: {
    type: String,
    default: 'dashboard', // "dashboard" | "quiz" | "duel" | "leaderboard" | "profile"
  },
})

const router = useRouter()
const selectedTab = ref(props.currentPage)

watch(
  () => props.currentPage,
  (val) => {
    selectedTab.value = val
  },
)

const handleNavigation = (page, path) => {
  selectedTab.value = page
  router.push(path)
}
</script>

<style scoped>
.bnWrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;

  /* “glass” */
  background: rgba(10, 10, 18, 0.7);
  border-top: 1px solid rgba(160, 190, 255, 0.16);
  backdrop-filter: blur(14px);

  /* center to phone width */
  display: flex;
  justify-content: center;
  padding: 10px 12px 14px;
}

.bnInner {
  width: min(430px, 100%);
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.bnBtn {
  border: 1px solid rgba(160, 190, 255, 0.14);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(210, 225, 255, 0.68);

  border-radius: 14px;
  padding: 10px 6px;

  display: grid;
  place-items: center;
  gap: 6px;

  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    box-shadow 160ms ease;
}

.bnBtn:hover {
  transform: translateY(-1px);
  border-color: rgba(160, 190, 255, 0.28);
  background: rgba(255, 255, 255, 0.045);
}

.bnBtn:active {
  transform: scale(0.99);
}

.bnBtn.active {
  color: rgba(255, 255, 255, 0.92);
  border-color: rgba(217, 70, 239, 0.45);
  background: rgba(217, 70, 239, 0.08);
  box-shadow: 0 14px 30px rgba(217, 70, 239, 0.1);
}

.bnIcon {
  width: 20px;
  height: 20px;
}

.bnText {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.01em;
}
</style>
