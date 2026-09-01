<template>
  <main class="lb">
    <section class="pad">
      <div class="wrap">
        <!-- Header -->
        <header class="head">
          <button class="ghostBack" type="button" @click="router.back()">
            <ArrowLeft class="mini" />
            Back
          </button>

          <h1 class="h1">Leaderboard</h1>
          <div class="spacer" />
        </header>

        <!-- Current User Card -->
        <div v-if="currentUser" class="card padMd meCard">
          <div class="row">
            <div class="rankBadge" :class="rankBgClass(currentUser.rank)">
              <span class="emoji">{{ currentUser.avatar }}</span>
            </div>

            <div class="grow">
              <div class="rowSm">
                <div class="name">{{ currentUser.username }}</div>
                <span class="youPill">You</span>
              </div>
              <div class="muted small">
                Rank #{{ currentUser.rank }} • Level {{ currentUser.level }} •
                {{ currentUser.xp }} XP
              </div>
            </div>

            <div class="right">
              <component :is="rankIcon(currentUser.rank)" class="rankIcon" />
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button
            v-for="t in tabs"
            :key="t.key"
            class="tab"
            :class="{ active: selectedTab === t.key }"
            type="button"
            @click="selectedTab = t.key"
          >
            {{ t.label }}
          </button>
        </div>

        <!-- GLOBAL -->
        <section v-if="selectedTab === 'global'" class="stackMd">
          <div class="sectionTitle">
            <Globe class="mini primary" />
            <h2 class="h2">Global Rankings</h2>
          </div>

          <div class="stackSm">
            <article
              v-for="u in GLOBAL_LEADERBOARD.slice(0, 10)"
              :key="u.rank"
              class="card padMd item"
              :class="{ isMe: u.isCurrentUser }"
            >
              <div class="row">
                <div class="rankBadge" :class="rankBgClass(u.rank)">
                  <span class="emoji">{{ u.avatar }}</span>
                </div>

                <div class="grow">
                  <div class="rowSm">
                    <div class="name">{{ u.username }}</div>
                    <span v-if="u.isCurrentUser" class="youPill">You</span>
                    <span class="country">{{ u.country }}</span>
                  </div>

                  <div class="meta">
                    <span>Level {{ u.level }}</span>
                    <span>{{ u.xp }} XP</span>
                    <span class="metaIcon">
                      <Flame class="micro streak" />
                      {{ u.streak }}
                    </span>
                    <span class="metaIcon">
                      <Star class="micro success" />
                      {{ u.badges }}
                    </span>
                  </div>
                </div>

                <div class="right">
                  <component :is="rankIcon(u.rank)" class="rankIcon" />
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- FRIENDS -->
        <section v-else-if="selectedTab === 'friends'" class="stackMd">
          <div class="rowBetween">
            <div class="sectionTitle">
              <Users class="mini secondary" />
              <h2 class="h2">Friends Rankings</h2>
            </div>

            <button class="outlineBtn sm" type="button">Add Friends</button>
          </div>

          <div class="stackSm">
            <article
              v-for="u in FRIENDS_LEADERBOARD"
              :key="u.rank"
              class="card padMd item"
              :class="{ isMe: u.isCurrentUser }"
            >
              <div class="row">
                <div class="rankBadge" :class="rankBgClass(u.rank)">
                  <span class="emoji">{{ u.avatar }}</span>
                </div>

                <div class="grow">
                  <div class="rowSm">
                    <div class="name">{{ u.username }}</div>
                    <span v-if="u.isCurrentUser" class="youPill">You</span>
                  </div>

                  <div class="meta">
                    <span>Level {{ u.level }}</span>
                    <span>{{ u.xp }} XP</span>
                    <span class="metaIcon">
                      <Flame class="micro streak" />
                      {{ u.streak }}
                    </span>
                  </div>
                </div>

                <div class="right">
                  <component :is="rankIcon(u.rank)" class="rankIcon" />
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- WEEKLY -->
        <section v-else-if="selectedTab === 'weekly'" class="stackMd">
          <div class="sectionTitle">
            <TrendingUp class="mini accent" />
            <h2 class="h2">This Week's Top Performers</h2>
          </div>

          <div class="card padMd weekCard center">
            <div class="muted small">Week ends in</div>
            <div class="bigNum">2 days</div>
            <div class="muted small">Keep learning to climb higher!</div>
          </div>

          <div class="stackSm">
            <article
              v-for="u in WEEKLY_LEADERS"
              :key="u.rank"
              class="card padMd item"
              :class="{ isMe: u.isCurrentUser }"
            >
              <div class="row">
                <div class="rankBadge" :class="rankBgClass(u.rank)">
                  <span class="emoji">{{ u.avatar }}</span>
                </div>

                <div class="grow">
                  <div class="rowSm">
                    <div class="name">{{ u.username }}</div>
                    <span v-if="u.isCurrentUser" class="youPill">You</span>
                  </div>

                  <div class="meta">
                    <span>{{ u.weeklyXP }} XP this week</span>
                    <span :class="changeClass(u.change)">{{ u.change }} positions</span>
                  </div>
                </div>

                <div class="right">
                  <component :is="rankIcon(u.rank)" class="rankIcon" />
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- SUBJECTS -->
        <section v-else class="stackMd">
          <div class="sectionTitle">
            <Target class="mini primary" />
            <h2 class="h2">Subject Rankings</h2>
          </div>

          <div class="subjectSwitch">
            <button
              class="pillBtn"
              :class="{ active: selectedSubject === 'programming' }"
              type="button"
              @click="selectedSubject = 'programming'"
            >
              Programming
            </button>
            <button
              class="pillBtn"
              :class="{ active: selectedSubject === 'algorithms' }"
              type="button"
              @click="selectedSubject = 'algorithms'"
            >
              Algorithms
            </button>
          </div>

          <div class="stackSm">
            <article
              v-for="u in SUBJECT_LEADERS[selectedSubject]"
              :key="u.rank"
              class="card padMd item"
              :class="{ isMe: u.isCurrentUser }"
            >
              <div class="row">
                <div class="rankBadge" :class="rankBgClass(u.rank)">
                  <span class="emoji">{{ u.avatar }}</span>
                </div>

                <div class="grow">
                  <div class="rowSm">
                    <div class="name">{{ u.username }}</div>
                    <span v-if="u.isCurrentUser" class="youPill">You</span>
                  </div>

                  <div class="muted small">Average Score: {{ u.score }}%</div>
                </div>

                <div class="right">
                  <component :is="rankIcon(u.rank)" class="rankIcon" />
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <BottomNavbar currentPage="leaderboard" />
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavbar from '@/components/BottomNavbar.vue'
import {
  Crown,
  Medal,
  Star,
  Users,
  Globe,
  ArrowLeft,
  TrendingUp,
  Flame,
  Target,
} from 'lucide-vue-next'

const router = useRouter()

/* ----- Mock Data (igual que tu Next) ----- */
const GLOBAL_LEADERBOARD = [
  {
    rank: 1,
    username: 'AlgoMaster',
    avatar: '🤖',
    level: 12,
    xp: 8750,
    streak: 45,
    badges: 28,
    country: 'US',
    isCurrentUser: false,
  },
  {
    rank: 2,
    username: 'CodeWizard',
    avatar: '🧙‍♂️',
    level: 11,
    xp: 8200,
    streak: 32,
    badges: 25,
    country: 'CA',
    isCurrentUser: false,
  },
  {
    rank: 3,
    username: 'DataNinja',
    avatar: '🥷',
    level: 10,
    xp: 7890,
    streak: 28,
    badges: 23,
    country: 'UK',
    isCurrentUser: false,
  },
  {
    rank: 4,
    username: 'ByteHunter',
    avatar: '🦸‍♀️',
    level: 10,
    xp: 7650,
    streak: 21,
    badges: 22,
    country: 'DE',
    isCurrentUser: false,
  },
  {
    rank: 5,
    username: 'StackOverflow',
    avatar: '📚',
    level: 9,
    xp: 7200,
    streak: 19,
    badges: 20,
    country: 'FR',
    isCurrentUser: false,
  },
  {
    rank: 42,
    username: 'CodeNinja',
    avatar: '🥷',
    level: 5,
    xp: 3420,
    streak: 7,
    badges: 12,
    country: 'US',
    isCurrentUser: true,
  },
]

const FRIENDS_LEADERBOARD = [
  {
    rank: 1,
    username: 'CodeNinja',
    avatar: '🥷',
    level: 5,
    xp: 3420,
    streak: 7,
    badges: 12,
    isCurrentUser: true,
  },
  {
    rank: 2,
    username: 'DevFriend1',
    avatar: '👨‍💻',
    level: 4,
    xp: 2890,
    streak: 5,
    badges: 9,
    isCurrentUser: false,
  },
  {
    rank: 3,
    username: 'StudyBuddy',
    avatar: '📖',
    level: 4,
    xp: 2650,
    streak: 12,
    badges: 11,
    isCurrentUser: false,
  },
  {
    rank: 4,
    username: 'JSExplorer',
    avatar: '🚀',
    level: 3,
    xp: 2100,
    streak: 3,
    badges: 7,
    isCurrentUser: false,
  },
]

const WEEKLY_LEADERS = [
  { rank: 1, username: 'WeeklyChamp', avatar: '⚡', weeklyXP: 850, change: '+5' },
  {
    rank: 2,
    username: 'CodeNinja',
    avatar: '🥷',
    weeklyXP: 720,
    change: '+12',
    isCurrentUser: true,
  },
  { rank: 3, username: 'QuizMaster', avatar: '🎯', weeklyXP: 680, change: '-1' },
]

const SUBJECT_LEADERS = {
  programming: [
    { rank: 1, username: 'CodeGuru', avatar: '💻', score: 95 },
    { rank: 2, username: 'CodeNinja', avatar: '🥷', score: 87, isCurrentUser: true },
    { rank: 3, username: 'DevMaster', avatar: '🚀', score: 82 },
  ],
  algorithms: [
    { rank: 1, username: 'AlgoKing', avatar: '👑', score: 98 },
    { rank: 2, username: 'SortMaster', avatar: '📊', score: 91 },
    { rank: 3, username: 'CodeNinja', avatar: '🥷', score: 76, isCurrentUser: true },
  ],
}

/* ----- State ----- */
const tabs = [
  { key: 'global', label: 'Global' },
  { key: 'friends', label: 'Friends' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'subjects', label: 'Subjects' },
]
const selectedTab = ref('global')
const selectedSubject = ref('programming')

const currentUser = computed(() => GLOBAL_LEADERBOARD.find((u) => u.isCurrentUser))

/* ----- Rank colors (simple reemplazo de design-tokens) ----- */
const rankBgClass = (rank) => {
  if (rank === 1) return 'bgGold'
  if (rank === 2) return 'bgSilver'
  if (rank === 3) return 'bgBronze'
  return 'bgDefault'
}

const rankIcon = (rank) => {
  if (rank === 1) return Crown
  if (rank === 2) return Medal
  if (rank === 3) return Medal
  return Star // fallback visual; el texto #rank lo hacemos con CSS pseudo? mejor: usamos Star tenue
}

const changeClass = (change) => {
  if (String(change).startsWith('+')) return 'okText'
  if (String(change).startsWith('-')) return 'badText'
  return 'muted'
}
</script>

<style scoped>
/* Base */
.lb {
  min-height: 100vh;
  width: 100vw;
  padding-bottom: 88px;
  color: rgba(255, 255, 255, 0.92);
  background:
    radial-gradient(900px 520px at 20% 10%, rgba(216, 70, 239, 0.16), transparent 55%),
    radial-gradient(900px 520px at 78% 18%, rgba(59, 130, 246, 0.16), transparent 55%),
    radial-gradient(900px 520px at 50% 96%, rgba(16, 185, 129, 0.08), transparent 60%),
    linear-gradient(180deg, #0b0a14 0%, #070a13 55%, #06151a 100%);
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
  font-size: 16px;
  font-weight: 950;
  letter-spacing: -0.01em;
}
.small {
  font-size: 12px;
}
.muted {
  color: rgba(210, 225, 255, 0.66);
}
.okText {
  color: #10b981;
  font-weight: 900;
}
.badText {
  color: #ef4444;
  font-weight: 900;
}
.primary {
  color: #d946ef;
}
.secondary {
  color: #3b82f6;
}
.accent {
  color: #22c55e;
}
.streak {
  color: #f59e0b;
}
.success {
  color: #10b981;
}

.card {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(120, 140, 190, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.padMd {
  padding: 14px;
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
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rowBetween {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.rowSm {
  display: flex;
  align-items: center;
  gap: 10px;
}
.grow {
  flex: 1;
  min-width: 0;
}
.right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.spacer {
  width: 36px;
}

/* Header */
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
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

.mini {
  width: 18px;
  height: 18px;
}
.micro {
  width: 14px;
  height: 14px;
}

/* Current user card */
.meCard {
  margin-bottom: 16px;
  background: linear-gradient(90deg, rgba(217, 70, 239, 0.06), rgba(59, 130, 246, 0.05));
  border-color: rgba(217, 70, 239, 0.2);
}
.name {
  font-weight: 950;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.youPill {
  font-size: 10px;
  font-weight: 950;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(160, 190, 255, 0.18);
  background: rgba(255, 255, 255, 0.03);
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
  margin-bottom: 16px;
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

/* Section title */
.sectionTitle {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Items */
.item {
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}
.item:hover {
  transform: translateY(-1px);
  border-color: rgba(160, 190, 255, 0.3);
  background: rgba(255, 255, 255, 0.045);
}
.item.isMe {
  background: rgba(217, 70, 239, 0.06);
  border-color: rgba(217, 70, 239, 0.2);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  font-size: 12px;
  color: rgba(210, 225, 255, 0.66);
  margin-top: 4px;
}
.metaIcon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.country {
  font-size: 11px;
  color: rgba(210, 225, 255, 0.55);
}

/* Rank badge */
.rankBadge {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(160, 190, 255, 0.14);
  flex: 0 0 auto;
}
.emoji {
  font-size: 20px;
}

.bgGold {
  background: rgba(245, 158, 11, 0.16);
  border-color: rgba(245, 158, 11, 0.24);
}
.bgSilver {
  background: rgba(148, 163, 184, 0.16);
  border-color: rgba(148, 163, 184, 0.24);
}
.bgBronze {
  background: rgba(234, 88, 12, 0.16);
  border-color: rgba(234, 88, 12, 0.24);
}
.bgDefault {
  background: rgba(255, 255, 255, 0.03);
}

.rankIcon {
  width: 20px;
  height: 20px;
  color: rgba(210, 225, 255, 0.72);
}

/* Weekly card */
.weekCard {
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.06), rgba(59, 130, 246, 0.05));
  border-color: rgba(34, 197, 94, 0.18);
}
.bigNum {
  font-size: 26px;
  font-weight: 950;
  margin: 4px 0;
}

/* Subject switch */
.subjectSwitch {
  display: flex;
  gap: 10px;
}
.pillBtn {
  border-radius: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(160, 190, 255, 0.16);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(210, 225, 255, 0.75);
  font-weight: 950;
  font-size: 12px;
  cursor: pointer;
  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease;
}
.pillBtn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.045);
  border-color: rgba(217, 70, 239, 0.22);
}
.pillBtn.active {
  color: rgba(255, 255, 255, 0.94);
  background: linear-gradient(90deg, rgba(217, 70, 239, 0.22), rgba(59, 130, 246, 0.18));
  border-color: rgba(217, 70, 239, 0.2);
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
</style>
