<template>
  <main class="dash">
    <!-- Header -->
    <header class="wrap top">
      <div class="row">
        <div class="user">
          <div class="avatarBox" aria-hidden="true">
            <span class="avatarEmoji">{{ userData.avatar }}</span>
          </div>
          <div class="userText">
            <div class="hello">Hi, {{ userData.username }}!</div>
            <div class="sub">Level {{ userData.level }} • Rank #{{ userData.rank }}</div>
          </div>
        </div>

        <div class="actions">
          <button class="iconBtn" type="button" @click="go('/rewards')" aria-label="Rewards">
            <Gift class="i" />
          </button>
          <button class="iconBtn" type="button" aria-label="Notifications">
            <Bell class="i" />
          </button>
          <button class="iconBtn" type="button" aria-label="Settings">
            <Settings class="i" />
          </button>
        </div>
      </div>

      <section class="card xpCard">
        <div class="xpRow">
          <span class="xpLabel">Progress to Level {{ userData.level + 1 }}</span>
          <span class="xpValue">{{ userData.xp }}/{{ userData.xpToNext }} XP</span>
        </div>

        <div
          class="progressTrack"
          role="progressbar"
          :aria-valuenow="xpPercent"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="progressFill" :style="{ width: xpPercent + '%' }"></div>
        </div>

        <div class="xpHint">
          <span>Keep going! You're doing great</span>
          <span class="xpToGo">{{ userData.xpToNext - userData.xp }} XP to go</span>
        </div>
      </section>
    </header>

    <!-- Stats -->
    <section class="wrap">
      <div class="grid4">
        <button class="card stat" type="button" @click="go('/rewards')">
          <div class="statIcon bgPink"><Flame class="i" /></div>
          <div class="statNum">{{ userData.streak }}</div>
          <div class="statLbl">Streak</div>
        </button>

        <button class="card stat" type="button" @click="go('/rewards')">
          <div class="statIcon bgGreen"><Star class="i" /></div>
          <div class="statNum">12</div>
          <div class="statLbl">Badges</div>
        </button>

        <div class="card stat">
          <div class="statIcon bgIndigo"><Trophy class="i" /></div>
          <div class="statNum">{{ userData.totalPoints }}</div>
          <div class="statLbl">Points</div>
        </div>

        <div class="card stat">
          <div class="statIcon bgPurple"><Clock class="i" /></div>
          <div class="statNum">{{ userData.completedToday }}</div>
          <div class="statLbl">Today</div>
        </div>
      </div>
    </section>

    <!-- Daily Challenges -->
    <section class="wrap section">
      <div class="sectionHead">
        <h2 class="h2">Daily Challenges</h2>
        <button class="linkBtn" type="button">View All <ChevronRight class="mini" /></button>
      </div>

      <div class="stack">
        <article
          v-for="c in DAILY_CHALLENGES"
          :key="c.id"
          class="card challenge"
          :class="{ done: c.completed }"
          @click="!c.completed && go('/quiz')"
          role="button"
          tabindex="0"
        >
          <div class="chIcon" :class="c.completed ? 'chDone' : 'chTodo'">
            <Star v-if="c.completed" class="chI doneI" />
            <BookOpen v-else class="chI todoI" />
          </div>

          <div class="chBody">
            <div class="chTop">
              <div class="chTitle">{{ c.title }}</div>
              <span class="badge" :class="diffClass(c.difficulty)">{{ c.difficulty }}</span>
            </div>
            <div class="chSub">{{ c.subject }} • +{{ c.xp }} XP</div>
          </div>

          <button
            v-if="!c.completed"
            class="playBtn"
            type="button"
            @click.stop="go('/quiz')"
            aria-label="Start"
          >
            <Play class="mini" />
          </button>
        </article>
      </div>
    </section>

    <!-- Subjects -->
    <section class="wrap section">
      <h2 class="h2">Your Progress</h2>

      <div class="grid2">
        <article
          v-for="s in CS_SUBJECTS"
          :key="s.id"
          class="card subject"
          role="button"
          tabindex="0"
        >
          <div class="subRow">
            <div class="subIcon" :style="{ background: subjectColor(s.colorKey) }">
              <component :is="s.icon" class="miniW" />
            </div>
            <div class="subMeta">
              <div class="subName">{{ s.name }}</div>
              <div class="subPct">{{ s.progress }}%</div>
            </div>
          </div>

          <div class="progressTrack small">
            <div class="progressFill" :style="{ width: s.progress + '%' }"></div>
          </div>
        </article>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="wrap section">
      <h2 class="h2">Quick Actions</h2>

      <div class="grid2">
        <button class="card quick" type="button" @click="go('/duel')">
          <div class="quickIcon bgIndigo"><Swords class="miniW" /></div>
          <div>
            <div class="quickTitle">1v1 Duel</div>
            <div class="quickSub">Challenge friends</div>
          </div>
        </button>

        <button class="card quick" type="button" @click="go('/leaderboard')">
          <div class="quickIcon bgPurple"><Trophy class="miniW" /></div>
          <div>
            <div class="quickTitle">Leaderboard</div>
            <div class="quickSub">See rankings</div>
          </div>
        </button>
      </div>
    </section>

    <!-- Achievements -->
    <section class="wrap section last">
      <h2 class="h2">Recent Achievements</h2>

      <div class="stack">
        <article v-for="a in RECENT_ACHIEVEMENTS" :key="a.id" class="card achieve">
          <div class="achEmoji">{{ a.icon }}</div>
          <div class="achBody">
            <div class="achTitle">{{ a.title }}</div>
            <div class="achDesc">{{ a.description }}</div>
          </div>
          <div class="achTime">{{ a.earned }}</div>
        </article>
      </div>
    </section>

    <!-- Bottom nav -->
    <BottomNavbar currentPage="dashboard" />
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Trophy,
  Target,
  Play,
  Flame,
  Star,
  BookOpen,
  Swords,
  Clock,
  ChevronRight,
  Settings,
  Bell,
  Code,
  Database,
  Network,
  Brain,
  Shield,
  Gift,
} from 'lucide-vue-next'
import BottomNavbar from '@/components/BottomNavbar.vue'

const router = useRouter()
const selectedTab = ref('home')

const userData = {
  username: 'CodeNinja',
  avatar: '🥷',
  level: 5,
  xp: 1250,
  xpToNext: 1500,
  streak: 7,
  totalPoints: 3420,
  rank: 42,
  completedToday: 2,
}

const CS_SUBJECTS = [
  { id: 'programming', name: 'Programming', icon: Code, colorKey: 'programming', progress: 65 },
  { id: 'algorithms', name: 'Algorithms', icon: Target, colorKey: 'algorithms', progress: 45 },
  { id: 'databases', name: 'Databases', icon: Database, colorKey: 'databases', progress: 30 },
  { id: 'networking', name: 'Networking', icon: Network, colorKey: 'networking', progress: 20 },
  { id: 'ai', name: 'AI/ML', icon: Brain, colorKey: 'ai', progress: 15 },
  { id: 'security', name: 'Security', icon: Shield, colorKey: 'security', progress: 10 },
]

const DAILY_CHALLENGES = [
  {
    id: 1,
    title: 'Array Algorithms',
    subject: 'Programming',
    xp: 50,
    difficulty: 'Easy',
    completed: false,
  },
  {
    id: 2,
    title: 'SQL Joins',
    subject: 'Databases',
    xp: 75,
    difficulty: 'Medium',
    completed: true,
  },
  {
    id: 3,
    title: 'Network Protocols',
    subject: 'Networking',
    xp: 100,
    difficulty: 'Hard',
    completed: false,
  },
]

const RECENT_ACHIEVEMENTS = [
  {
    id: 1,
    title: 'First Quiz Master',
    description: 'Completed your first quiz',
    icon: '🏆',
    earned: '2 days ago',
  },
  {
    id: 2,
    title: 'Week Warrior',
    description: '7-day learning streak',
    icon: '🔥',
    earned: '1 day ago',
  },
  {
    id: 3,
    title: 'Code Crusher',
    description: 'Solved 10 programming problems',
    icon: '💻',
    earned: '3 hours ago',
  },
]

const xpPercent = computed(() => Math.round((userData.xp / userData.xpToNext) * 100))

const go = (path) => router.push(path)

const diffClass = (d) => {
  if (d === 'Easy') return 'bEasy'
  if (d === 'Medium') return 'bMed'
  return 'bHard'
}

const subjectColor = (key) => {
  const map = {
    programming: 'linear-gradient(135deg, #d946ef, #3b82f6)',
    algorithms: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    databases: 'linear-gradient(135deg, #10b981, #06b6d4)',
    networking: 'linear-gradient(135deg, #22c55e, #3b82f6)',
    ai: 'linear-gradient(135deg, #a855f7, #3b82f6)',
    security: 'linear-gradient(135deg, #f97316, #ef4444)',
  }
  return map[key] || 'linear-gradient(135deg, #d946ef, #3b82f6)'
}
</script>

<style scoped>
/* Page bg (same family as your other screens) */
.dash {
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
.top {
  padding: 18px 0 10px;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* user */
.user {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.avatarBox {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #d946ef, #3b82f6);
  box-shadow:
    0 14px 30px rgba(59, 130, 246, 0.16),
    0 14px 30px rgba(217, 70, 239, 0.11);
}
.avatarEmoji {
  font-size: 22px;
}
.hello {
  font-weight: 900;
  letter-spacing: -0.01em;
}
.sub {
  font-size: 12px;
  color: rgba(210, 225, 255, 0.62);
  margin-top: 2px;
}

.actions {
  display: flex;
  gap: 8px;
}
.iconBtn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid rgba(160, 190, 255, 0.18);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.85);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}
.iconBtn:hover {
  transform: translateY(-1px);
  border-color: rgba(160, 190, 255, 0.32);
  background: rgba(255, 255, 255, 0.045);
}
.i {
  width: 18px;
  height: 18px;
}

/* cards base */
.card {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(120, 140, 190, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.card:hover {
  border-color: rgba(160, 190, 255, 0.35);
}
.card:active {
  transform: scale(0.99);
}

.xpCard {
  padding: 14px;
  margin-top: 14px;
  background: rgba(217, 70, 239, 0.06);
  border-color: rgba(217, 70, 239, 0.18);
}
.xpRow {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}
.xpLabel {
  font-size: 13px;
  font-weight: 750;
}
.xpValue {
  font-size: 13px;
  font-weight: 900;
  color: rgba(217, 70, 239, 0.95);
}

.progressTrack {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(160, 190, 255, 0.14);
  overflow: hidden;
  margin-top: 10px;
}
.progressTrack.small {
  height: 9px;
  margin-top: 8px;
}
.progressFill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #d946ef 0%, #3b82f6 100%);
  transition: width 260ms ease;
  box-shadow: 0 10px 26px rgba(59, 130, 246, 0.16);
}
.xpHint {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  font-size: 12px;
  color: rgba(210, 225, 255, 0.62);
}
.xpToGo {
  font-weight: 800;
}

/* stats grid */
.grid4 {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.stat {
  padding: 10px 8px;
  text-align: center;
  cursor: pointer;
}
.statIcon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  margin: 0 auto 8px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(160, 190, 255, 0.14);
}
.statNum {
  font-size: 18px;
  font-weight: 950;
}
.statLbl {
  font-size: 10px;
  color: rgba(210, 225, 255, 0.58);
}

.bgPink {
  background: rgba(217, 70, 239, 0.14);
  color: #d946ef;
}
.bgGreen {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
}
.bgIndigo {
  background: rgba(59, 130, 246, 0.14);
  color: #3b82f6;
}
.bgPurple {
  background: rgba(168, 85, 247, 0.14);
  color: #a855f7;
}

/* sections */
.section {
  padding-top: 16px;
}
.last {
  padding-bottom: 10px;
}
.sectionHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.h2 {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 950;
  letter-spacing: -0.01em;
}
.linkBtn {
  border: 0;
  background: transparent;
  color: rgba(217, 70, 239, 0.95);
  font-weight: 800;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 12px;
  cursor: pointer;
}
.linkBtn:hover {
  background: rgba(217, 70, 239, 0.08);
}

/* challenges */
.stack {
  display: grid;
  gap: 10px;
}
.challenge {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.challenge.done {
  background: rgba(16, 185, 129, 0.06);
  border-color: rgba(16, 185, 129, 0.18);
  cursor: default;
}
.chIcon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(160, 190, 255, 0.14);
  flex: 0 0 auto;
}
.chTodo {
  background: rgba(217, 70, 239, 0.1);
}
.chDone {
  background: rgba(16, 185, 129, 0.12);
}
.chI {
  width: 22px;
  height: 22px;
}
.todoI {
  color: #d946ef;
}
.doneI {
  color: #10b981;
}

.chBody {
  flex: 1;
  min-width: 0;
}
.chTop {
  display: flex;
  gap: 8px;
  align-items: center;
}
.chTitle {
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chSub {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(210, 225, 255, 0.62);
}

.badge {
  font-size: 10px;
  font-weight: 900;
  padding: 3px 7px;
  border-radius: 999px;
  border: 1px solid rgba(160, 190, 255, 0.16);
  flex: 0 0 auto;
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

.playBtn {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 0;
  background: linear-gradient(90deg, #d946ef 0%, #3b82f6 100%);
  color: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}
.playBtn:hover {
  filter: brightness(1.03);
  transform: translateY(-1px);
}
.playBtn:active {
  transform: scale(0.99);
}

.mini {
  width: 18px;
  height: 18px;
}
.miniW {
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.92);
}

/* subjects */
.grid2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.subject {
  padding: 12px;
  cursor: pointer;
}
.subRow {
  display: flex;
  align-items: center;
  gap: 10px;
}
.subIcon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}
.subMeta {
  min-width: 0;
}
.subName {
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.subPct {
  margin-top: 3px;
  font-size: 12px;
  color: rgba(210, 225, 255, 0.62);
}

/* quick actions */
.quick {
  padding: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}
.quickIcon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(160, 190, 255, 0.14);
  flex: 0 0 auto;
}
.quickTitle {
  font-size: 13px;
  font-weight: 950;
}
.quickSub {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(210, 225, 255, 0.62);
}

/* achievements */
.achieve {
  padding: 12px;
  background: rgba(16, 185, 129, 0.06);
  border-color: rgba(16, 185, 129, 0.18);
  display: flex;
  align-items: center;
  gap: 12px;
}
.achEmoji {
  font-size: 24px;
  flex: 0 0 auto;
}
.achBody {
  flex: 1;
  min-width: 0;
}
.achTitle {
  font-size: 13px;
  font-weight: 950;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.achDesc {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(210, 225, 255, 0.62);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.achTime {
  font-size: 10px;
  color: rgba(210, 225, 255, 0.55);
  flex: 0 0 auto;
}

/* bottom nav */
.bottomNav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 74px;
  background: rgba(10, 10, 18, 0.65);
  border-top: 1px solid rgba(160, 190, 255, 0.16);
  backdrop-filter: blur(14px);
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 10px 14px 16px;
}
.bnItem {
  width: min(160px, 30vw);
  border: 1px solid rgba(160, 190, 255, 0.14);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(210, 225, 255, 0.7);
  border-radius: 16px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}
.bnItem:hover {
  transform: translateY(-1px);
  border-color: rgba(160, 190, 255, 0.3);
  background: rgba(255, 255, 255, 0.045);
}
.bnItem.active {
  color: rgba(255, 255, 255, 0.92);
  border-color: rgba(217, 70, 239, 0.45);
  background: rgba(217, 70, 239, 0.08);
}
.bnDot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(210, 225, 255, 0.35);
}
.bnItem.active .bnDot {
  background: linear-gradient(90deg, #d946ef, #3b82f6);
}

/* responsive */
@media (max-width: 420px) {
  .grid4 {
    gap: 8px;
  }
  .statNum {
    font-size: 17px;
  }
}
</style>
