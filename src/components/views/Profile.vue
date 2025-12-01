<template>
  <main class="pf">
    <section class="pad">
      <div class="wrap">
        <!-- Header -->
        <header class="head">
          <button class="ghostBack" type="button" @click="router.push('/dashboard')">
            <ArrowLeft class="mini" />
            Back
          </button>

          <h1 class="h1">Profile</h1>

          <button class="iconBtn" type="button" @click="toggleEdit">
            <component :is="isEditing ? CheckCircle : Edit2" class="mini" />
          </button>
        </header>

        <!-- Profile Header Card -->
        <section class="card padLg hero">
          <div class="rowTop">
            <div class="avatarBlob">
              <span class="avatarEmoji">{{ selectedAvatar?.emoji ?? '🙂' }}</span>
            </div>

            <div class="grow">
              <div class="nameBlock">
                <input
                  v-if="isEditing"
                  class="input inputTitle"
                  v-model.trim="userData.username"
                  placeholder="Your username"
                />
                <h2 v-else class="h2">{{ userData.username }}</h2>

                <div class="metaRow">
                  <span class="pill">Level {{ userData.level }}</span>
                  <span class="dot">•</span>
                  <span class="muted small">Rank #{{ userData.rank }}</span>
                  <span class="dot">•</span>
                  <span class="muted small metaIcon">
                    <Calendar class="micro" />
                    Joined {{ userData.joinDate }}
                  </span>
                </div>

                <input
                  v-if="isEditing"
                  class="input inputBio"
                  v-model="userData.bio"
                  placeholder="Tell us about yourself..."
                />
                <p v-else class="muted small bio">{{ userData.bio }}</p>
              </div>
            </div>
          </div>

          <!-- XP Progress -->
          <div class="xpWrap">
            <div class="rowBetween">
              <span class="small strong">Progress to Level {{ userData.level + 1 }}</span>
              <span class="small strong primaryText"
                >{{ userData.xp }}/{{ userData.xpToNext }} XP</span
              >
            </div>

            <div class="progressTrack" aria-label="XP progress">
              <div class="progressFill" :style="{ width: xpProgress + '%' }" />
            </div>
          </div>
        </section>

        <!-- Quick Stats Grid -->
        <section class="statsGrid">
          <article class="card stat">
            <div class="statIcon bgStreak">
              <Flame class="mini streak" />
            </div>
            <div class="statNum">{{ userData.streak }}</div>
            <div class="statLbl">Streak</div>
          </article>

          <article class="card stat">
            <div class="statIcon bgSuccess">
              <Star class="mini success" />
            </div>
            <div class="statNum">{{ userData.badgesEarned }}</div>
            <div class="statLbl">Badges</div>
          </article>

          <article class="card stat">
            <div class="statIcon bgPrimary">
              <Trophy class="mini primary" />
            </div>
            <div class="statNum">{{ userData.totalPoints }}</div>
            <div class="statLbl">Points</div>
          </article>

          <article class="card stat">
            <div class="statIcon bgSecondary">
              <Clock class="mini secondary" />
            </div>
            <div class="statNum">{{ userData.hoursLearned }}</div>
            <div class="statLbl">Hours</div>
          </article>
        </section>

        <!-- Tabs -->
        <nav class="tabs" role="tablist" aria-label="Profile tabs">
          <button
            class="tab"
            :class="{ active: selectedTab === 'overview' }"
            @click="selectedTab = 'overview'"
          >
            Overview
          </button>
          <button
            class="tab"
            :class="{ active: selectedTab === 'stats' }"
            @click="selectedTab = 'stats'"
          >
            Stats
          </button>
          <button
            class="tab"
            :class="{ active: selectedTab === 'activity' }"
            @click="selectedTab = 'activity'"
          >
            Activity
          </button>
          <button
            class="tab"
            :class="{ active: selectedTab === 'settings' }"
            @click="selectedTab = 'settings'"
          >
            Settings
          </button>
        </nav>

        <!-- OVERVIEW -->
        <section v-if="selectedTab === 'overview'" class="stackMd">
          <!-- Performance Overview -->
          <div class="stackSm">
            <h3 class="sectionH">Performance Overview</h3>

            <div class="grid2">
              <article class="card padMd">
                <div class="row">
                  <div class="square bgPrimary">
                    <Target class="mini primary" />
                  </div>
                  <div class="grow">
                    <div class="muted small">Quizzes</div>
                    <div class="big">{{ userData.quizzesCompleted }}</div>
                  </div>
                </div>
                <div class="muted tiny">Completed</div>
              </article>

              <article class="card padMd">
                <div class="row">
                  <div class="square bgSecondary">
                    <Swords class="mini secondary" />
                  </div>
                  <div class="grow">
                    <div class="muted small">Win Rate</div>
                    <div class="big">{{ winRate }}%</div>
                  </div>
                </div>
                <div class="muted tiny">
                  {{ userData.duelsWon }}/{{ userData.duelsPlayed }} Duels
                </div>
              </article>
            </div>
          </div>

          <!-- Subject Mastery -->
          <div class="stackSm">
            <h3 class="sectionH">Subject Mastery</h3>

            <div class="stackSm">
              <article v-for="s in CS_SUBJECTS" :key="s.id" class="card padMd">
                <div class="rowBetween">
                  <div class="row">
                    <div class="subjectIcon" :style="{ background: s.color }">
                      <component :is="s.icon" class="mini white" />
                    </div>
                    <div>
                      <div class="strong">{{ s.name }}</div>
                      <div class="muted tiny">{{ s.mastery }}</div>
                    </div>
                  </div>
                  <div class="strong small">{{ s.progress }}%</div>
                </div>

                <div class="progressTrack sm" aria-label="Subject progress">
                  <div class="progressFill" :style="{ width: s.progress + '%' }" />
                </div>
              </article>
            </div>
          </div>

          <!-- Top Badges -->
          <div class="stackSm">
            <div class="rowBetween">
              <h3 class="sectionH">Top Badges</h3>
              <button class="ghostLink" type="button" @click="router.push('/rewards')">
                View All
              </button>
            </div>

            <div class="grid3">
              <article v-for="b in TOP_BADGES" :key="b.id" class="card badgeCard">
                <div class="badgeEmoji">{{ b.icon }}</div>
                <div class="badgeTitle">{{ b.title }}</div>
                <div class="muted tiny">{{ b.earned }}</div>
              </article>
            </div>
          </div>
        </section>

        <!-- STATS -->
        <section v-else-if="selectedTab === 'stats'" class="stackMd">
          <div class="stackSm">
            <h3 class="sectionH">Weekly Progress</h3>

            <article class="card padMd">
              <div v-for="(w, idx) in STATS_HISTORY" :key="w.week" class="weekRow">
                <div class="rowBetween">
                  <div class="strong small">{{ w.week }}</div>
                  <div class="muted tiny">
                    {{ w.xp }} XP • {{ w.quizzes }} Quizzes • {{ w.duels }} Duels
                  </div>
                </div>

                <div class="progressTrack sm">
                  <div
                    class="progressFill"
                    :style="{ width: Math.min(100, (w.xp / 800) * 100) + '%' }"
                  />
                </div>

                <div v-if="idx < STATS_HISTORY.length - 1" class="divider" />
              </div>
            </article>
          </div>

          <div class="stackSm">
            <h3 class="sectionH">Detailed Statistics</h3>

            <div class="grid2">
              <article class="card padMd">
                <div class="row">
                  <div class="miniSq bgPrimary">
                    <BookOpen class="micro primary" />
                  </div>
                  <div class="muted small">Total Quizzes</div>
                </div>
                <div class="big">{{ userData.quizzesCompleted }}</div>
                <div class="trend okText tiny"><TrendingUp class="micro" /> +12 this week</div>
              </article>

              <article class="card padMd">
                <div class="row">
                  <div class="miniSq bgSecondary">
                    <Swords class="micro secondary" />
                  </div>
                  <div class="muted small">Total Duels</div>
                </div>
                <div class="big">{{ userData.duelsPlayed }}</div>
                <div class="trend okText tiny"><TrendingUp class="micro" /> +5 this week</div>
              </article>

              <article class="card padMd">
                <div class="row">
                  <div class="miniSq bgSuccess">
                    <Award class="micro success" />
                  </div>
                  <div class="muted small">Achievements</div>
                </div>
                <div class="big">{{ userData.badgesEarned }}</div>
                <div class="trend okText tiny"><TrendingUp class="micro" /> +2 this week</div>
              </article>

              <article class="card padMd">
                <div class="row">
                  <div class="miniSq bgXP">
                    <Zap class="micro xp" />
                  </div>
                  <div class="muted small">Total XP</div>
                </div>
                <div class="big">{{ userData.totalPoints }}</div>
                <div class="trend okText tiny"><TrendingUp class="micro" /> +720 this week</div>
              </article>
            </div>
          </div>
        </section>

        <!-- ACTIVITY -->
        <section v-else-if="selectedTab === 'activity'" class="stackMd">
          <h3 class="sectionH">Recent Activity</h3>

          <div class="stackSm">
            <article v-for="a in RECENT_ACTIVITY" :key="a.id" class="card padMd">
              <div class="row">
                <div class="actIcon">{{ a.icon }}</div>
                <div class="grow min0">
                  <div class="strong small truncate">{{ a.title }}</div>
                  <div class="muted tiny">{{ a.subject }} • +{{ a.xp }} XP • {{ a.time }}</div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- SETTINGS -->
        <section v-else class="stackMd">
          <!-- Avatar selection only when editing -->
          <section v-if="isEditing" class="stackSm">
            <h3 class="sectionH">Choose Avatar</h3>

            <div class="grid3">
              <button
                v-for="a in AVATAR_OPTIONS"
                :key="a.id"
                type="button"
                class="card avatarPick"
                :class="{ picked: userData.avatar === a.id }"
                @click="userData.avatar = a.id"
              >
                <div class="pickEmoji">{{ a.emoji }}</div>
                <div class="pickName">{{ a.name }}</div>
              </button>
            </div>
          </section>

          <!-- Account Settings -->
          <section class="stackSm">
            <h3 class="sectionH">Account Settings</h3>

            <article class="card padMd">
              <div class="rowBetween">
                <div class="grow">
                  <div class="rowSm">
                    <Mail class="micro" />
                    <div class="strong small">Email Address</div>
                  </div>

                  <input
                    v-if="isEditingEmail"
                    class="input"
                    type="email"
                    v-model.trim="userData.email"
                    placeholder="your.email@example.com"
                  />
                  <div v-else class="muted small" style="margin-top: 6px">{{ userData.email }}</div>
                </div>

                <button class="outlineBtn sm" type="button" @click="toggleEmailEdit">
                  <component :is="isEditingEmail ? Save : Edit2" class="micro" />
                  <span>{{ isEditingEmail ? 'Save' : 'Edit' }}</span>
                </button>
              </div>

              <div class="divider" />

              <div class="rowBetween">
                <div>
                  <div class="strong small">Notifications</div>
                  <div class="muted tiny">Receive daily reminders</div>
                </div>
                <button class="outlineBtn sm" type="button">Enable</button>
              </div>

              <div class="divider" />

              <div class="rowBetween">
                <div>
                  <div class="strong small">Privacy</div>
                  <div class="muted tiny">Control who sees your profile</div>
                </div>
                <button class="outlineBtn sm" type="button">Public</button>
              </div>

              <div class="divider" />

              <div class="rowBetween">
                <div>
                  <div class="strong small">Theme</div>
                  <div class="muted tiny">Arcade neon theme</div>
                </div>
                <button class="outlineBtn sm" type="button">Change</button>
              </div>
            </article>
          </section>

          <!-- Danger Zone -->
          <section class="stackSm">
            <h3 class="dangerTitle">Danger Zone</h3>

            <article class="card padMd dangerCard">
              <button class="dangerOutline" type="button">Reset Progress</button>
              <button class="dangerSolid" type="button">Delete Account</button>
            </article>
          </section>
        </section>
      </div>
    </section>

    <BottomNavbar currentPage="profile" />
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavbar from '@/components/BottomNavbar.vue'
import {
  ArrowLeft,
  Trophy,
  Star,
  Flame,
  Target,
  Swords,
  Edit2,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Zap,
  Code,
  Database,
  Network,
  Brain,
  Shield,
  BookOpen,
  CheckCircle,
  Mail,
  Save,
} from 'lucide-vue-next'

/* ---- mock tokens: subjectColors.bg (reemplazo simple) ---- */
const subjectColors = {
  programming: { bg: 'linear-gradient(135deg, #d946ef, #9333ea)' },
  algorithms: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  databases: { bg: 'linear-gradient(135deg, #10b981, #059669)' },
  networking: { bg: 'linear-gradient(135deg, #22c55e, #16a34a)' },
  ai: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  security: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)' },
}

const router = useRouter()

const selectedTab = ref('overview')
const isEditing = ref(false)
const isEditingEmail = ref(false)

const userData = reactive({
  username: 'CodeNinja',
  avatar: 'ninja',
  email: 'codeninja@example.com',
  bio: 'Passionate CS learner on a quest to master algorithms and data structures!',
  level: 5,
  xp: 1250,
  xpToNext: 1500,
  streak: 7,
  totalPoints: 3420,
  rank: 42,
  joinDate: 'Jan 2025',
  quizzesCompleted: 45,
  duelsWon: 18,
  duelsPlayed: 25,
  badgesEarned: 12,
  hoursLearned: 24,
})

const AVATAR_OPTIONS = [
  { id: 'robot', emoji: '🤖', name: 'Robo Coder' },
  { id: 'wizard', emoji: '🧙‍♂️', name: 'Code Wizard' },
  { id: 'ninja', emoji: '🥷', name: 'Bug Ninja' },
  { id: 'scientist', emoji: '👩‍🔬', name: 'Data Scientist' },
  { id: 'astronaut', emoji: '👨‍🚀', name: 'Space Explorer' },
  { id: 'superhero', emoji: '🦸‍♀️', name: 'Code Hero' },
]

const CS_SUBJECTS = [
  {
    id: 'programming',
    name: 'Programming',
    icon: Code,
    color: subjectColors.programming.bg,
    progress: 65,
    mastery: 'Advanced',
  },
  {
    id: 'algorithms',
    name: 'Algorithms',
    icon: Target,
    color: subjectColors.algorithms.bg,
    progress: 45,
    mastery: 'Intermediate',
  },
  {
    id: 'databases',
    name: 'Databases',
    icon: Database,
    color: subjectColors.databases.bg,
    progress: 30,
    mastery: 'Beginner',
  },
  {
    id: 'networking',
    name: 'Networking',
    icon: Network,
    color: subjectColors.networking.bg,
    progress: 20,
    mastery: 'Beginner',
  },
  {
    id: 'ai',
    name: 'AI/ML',
    icon: Brain,
    color: subjectColors.ai.bg,
    progress: 15,
    mastery: 'Novice',
  },
  {
    id: 'security',
    name: 'Security',
    icon: Shield,
    color: subjectColors.security.bg,
    progress: 10,
    mastery: 'Novice',
  },
]

const RECENT_ACTIVITY = [
  {
    id: 1,
    type: 'quiz',
    title: 'Completed Array Algorithms Quiz',
    subject: 'Programming',
    xp: 75,
    time: '2 hours ago',
    icon: '🎯',
  },
  {
    id: 2,
    type: 'duel',
    title: 'Won duel against CodeMaster99',
    subject: 'Algorithms',
    xp: 100,
    time: '5 hours ago',
    icon: '⚔️',
  },
  {
    id: 3,
    type: 'achievement',
    title: 'Earned Week Warrior Badge',
    subject: 'Streaks',
    xp: 100,
    time: '1 day ago',
    icon: '🔥',
  },
  {
    id: 4,
    type: 'quiz',
    title: 'Completed SQL Joins Quiz',
    subject: 'Databases',
    xp: 50,
    time: '2 days ago',
    icon: '🎯',
  },
]

const STATS_HISTORY = [
  { week: 'Week 1', xp: 450, quizzes: 8, duels: 3 },
  { week: 'Week 2', xp: 620, quizzes: 12, duels: 5 },
  { week: 'Week 3', xp: 580, quizzes: 10, duels: 4 },
  { week: 'Week 4', xp: 720, quizzes: 15, duels: 6 },
]

const TOP_BADGES = [
  { id: 1, title: 'Week Warrior', icon: '🔥', rarity: 'uncommon', earned: '1 day ago' },
  { id: 2, title: 'Quiz Master', icon: '🏆', rarity: 'rare', earned: '3 days ago' },
  { id: 3, title: 'First Steps', icon: '🎯', rarity: 'common', earned: '1 week ago' },
]

const winRate = computed(() => Math.round((userData.duelsWon / userData.duelsPlayed) * 100))
const xpProgress = computed(() => Math.round((userData.xp / userData.xpToNext) * 100))
const selectedAvatar = computed(() => AVATAR_OPTIONS.find((a) => a.id === userData.avatar))

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (!isEditing.value) isEditingEmail.value = false
}

const toggleEmailEdit = () => {
  isEditingEmail.value = !isEditingEmail.value
}
</script>

<style scoped>
/* Page base (igual look que leaderboard) */
.pf {
  min-height: 100vh;
  width: 100vw;
  padding-bottom: 92px;
  background:
    radial-gradient(900px 520px at 20% 10%, rgba(216, 70, 239, 0.16), transparent 55%),
    radial-gradient(900px 520px at 78% 18%, rgba(59, 130, 246, 0.16), transparent 55%),
    radial-gradient(900px 520px at 50% 96%, rgba(16, 185, 129, 0.08), transparent 60%),
    linear-gradient(180deg, #0b0a14 0%, #070a13 55%, #06151a 100%);
  color: rgba(255, 255, 255, 0.92);
  overflow-x: hidden;
}
.wrap {
  width: min(560px, 92vw);
  margin: 0 auto;
}
.pad {
  padding: 18px 0 0;
}

.h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 950;
  letter-spacing: -0.01em;
}
.h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 950;
  letter-spacing: -0.01em;
}
.sectionH {
  margin: 0;
  font-size: 16px;
  font-weight: 950;
}
.small {
  font-size: 12px;
}
.tiny {
  font-size: 11px;
}
.muted {
  color: rgba(210, 225, 255, 0.66);
}
.strong {
  font-weight: 950;
}
.primaryText {
  color: #d946ef;
}

.primary {
  color: #d946ef;
}
.secondary {
  color: #3b82f6;
}
.success {
  color: #10b981;
}
.streak {
  color: #f59e0b;
}
.xp {
  color: #a78bfa;
}
.white {
  color: white;
}

.card {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(120, 140, 190, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.padLg {
  padding: 16px;
}
.padMd {
  padding: 14px;
}

.stackMd {
  display: grid;
  gap: 16px;
}
.stackSm {
  display: grid;
  gap: 10px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rowSm {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rowBetween {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.rowTop {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.grow {
  flex: 1;
  min-width: 0;
}
.min0 {
  min-width: 0;
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dot {
  opacity: 0.6;
}

.mini {
  width: 18px;
  height: 18px;
}
.micro {
  width: 14px;
  height: 14px;
}

/* Header buttons */
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
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

.iconBtn {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  border: 1px solid rgba(160, 190, 255, 0.18);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}
.iconBtn:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Hero */
.hero {
  background: linear-gradient(90deg, rgba(217, 70, 239, 0.08), rgba(59, 130, 246, 0.06));
  border-color: rgba(217, 70, 239, 0.22);
}
.avatarBlob {
  width: 80px;
  height: 80px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(217, 70, 239, 0.9), rgba(59, 130, 246, 0.9));
  display: grid;
  place-items: center;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
  flex: 0 0 auto;
}
.avatarEmoji {
  font-size: 34px;
}

.metaRow {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: rgba(210, 225, 255, 0.66);
}
.pill {
  font-size: 11px;
  font-weight: 950;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(160, 190, 255, 0.18);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.9);
}
.metaIcon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.nameBlock {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.bio {
  line-height: 1.35;
}

/* Inputs */
.input {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(160, 190, 255, 0.18);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.92);
  padding: 10px 12px;
  outline: none;
}
.input:focus {
  border-color: rgba(217, 70, 239, 0.35);
  box-shadow: 0 0 0 3px rgba(217, 70, 239, 0.14);
}
.inputTitle {
  font-weight: 950;
  font-size: 18px;
  padding: 10px 12px;
}
.inputBio {
  font-size: 12px;
}

/* Progress */
.xpWrap {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}
.progressTrack {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(160, 190, 255, 0.12);
  overflow: hidden;
}
.progressTrack.sm {
  height: 8px;
}
.progressFill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(217, 70, 239, 0.95), rgba(59, 130, 246, 0.9));
  box-shadow: 0 8px 22px rgba(217, 70, 239, 0.18);
}

/* Stats grid */
.statsGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 14px 0 14px;
}
.stat {
  padding: 12px 10px;
  text-align: center;
}
.statIcon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  margin: 0 auto 6px;
  border: 1px solid rgba(160, 190, 255, 0.14);
}
.bgStreak {
  background: rgba(245, 158, 11, 0.12);
}
.bgSuccess {
  background: rgba(16, 185, 129, 0.12);
}
.bgPrimary {
  background: rgba(217, 70, 239, 0.1);
}
.bgSecondary {
  background: rgba(59, 130, 246, 0.1);
}
.bgXP {
  background: rgba(167, 139, 250, 0.12);
}

.statNum {
  font-size: 18px;
  font-weight: 950;
}
.statLbl {
  font-size: 10px;
  color: rgba(210, 225, 255, 0.66);
}

/* Tabs */
.tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding: 8px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(160, 190, 255, 0.14);
  margin: 12px 0 16px;
}
.tab {
  border: 0;
  border-radius: 14px;
  padding: 10px 8px;
  cursor: pointer;
  font-weight: 950;
  font-size: 12px;
  color: rgba(210, 225, 255, 0.7);
  background: transparent;
  transition:
    background 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}
.tab:hover {
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-1px);
}
.tab.active {
  color: rgba(255, 255, 255, 0.94);
  background: linear-gradient(90deg, rgba(217, 70, 239, 0.22), rgba(59, 130, 246, 0.18));
  border: 1px solid rgba(217, 70, 239, 0.18);
}

/* Grids */
.grid2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.grid3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
@media (max-width: 430px) {
  .grid3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Small cards elements */
.square {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid rgba(160, 190, 255, 0.14);
  display: grid;
  place-items: center;
}
.miniSq {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 1px solid rgba(160, 190, 255, 0.14);
  display: grid;
  place-items: center;
}

.big {
  font-size: 22px;
  font-weight: 950;
  margin-top: 2px;
}
.trend {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.okText {
  color: #10b981;
  font-weight: 950;
}

/* Subject icon */
.subjectIcon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Badges */
.badgeCard {
  padding: 12px 10px;
  text-align: center;
  background: rgba(16, 185, 129, 0.06);
  border-color: rgba(16, 185, 129, 0.18);
}
.badgeEmoji {
  font-size: 22px;
  margin-bottom: 6px;
}
.badgeTitle {
  font-size: 12px;
  font-weight: 950;
}

/* Activity */
.actIcon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(217, 70, 239, 0.1);
  border: 1px solid rgba(217, 70, 239, 0.18);
  display: grid;
  place-items: center;
  font-size: 20px;
}

/* Settings */
.avatarPick {
  padding: 12px 10px;
  text-align: center;
  cursor: pointer;
  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease;
}
.avatarPick:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.045);
  border-color: rgba(217, 70, 239, 0.22);
}
.avatarPick.picked {
  border: 2px solid rgba(217, 70, 239, 0.4);
  background: rgba(217, 70, 239, 0.08);
}
.pickEmoji {
  font-size: 22px;
  margin-bottom: 4px;
}
.pickName {
  font-size: 11px;
  font-weight: 950;
  color: rgba(255, 255, 255, 0.9);
}

/* Buttons */
.outlineBtn {
  border-radius: 14px;
  border: 1px solid rgba(160, 190, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 950;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.outlineBtn:hover {
  transform: translateY(-1px);
  border-color: rgba(160, 190, 255, 0.3);
  background: rgba(255, 255, 255, 0.045);
}
.outlineBtn:active {
  transform: scale(0.99);
}
.outlineBtn.sm {
  padding: 10px 12px;
  font-size: 12px;
}

.ghostLink {
  border: 0;
  background: transparent;
  color: #d946ef;
  font-weight: 950;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 12px;
}
.ghostLink:hover {
  background: rgba(217, 70, 239, 0.1);
}

.divider {
  height: 1px;
  background: rgba(160, 190, 255, 0.14);
  margin: 12px 0;
}

/* Danger */
.dangerTitle {
  margin: 0;
  font-size: 16px;
  font-weight: 950;
  color: #ef4444;
}
.dangerCard {
  border-color: rgba(239, 68, 68, 0.22);
}
.dangerOutline {
  width: 100%;
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(255, 255, 255, 0.02);
  color: #ef4444;
  font-weight: 950;
  cursor: pointer;
}
.dangerSolid {
  width: 100%;
  margin-top: 10px;
  padding: 12px 12px;
  border-radius: 14px;
  border: 0;
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
  color: white;
  font-weight: 950;
  cursor: pointer;
}
</style>
