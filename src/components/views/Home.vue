<template>
  <main class="screen">
    <section class="shell">
      <!-- Header -->
      <header class="header">
        <div class="logo" aria-hidden="true">
          <Trophy class="logoIcon" />
        </div>

        <h1 class="title">CodeQuest</h1>
        <p class="subtitle">
          Master Computer Science through fun,<br />
          gamified learning
        </p>
      </header>

      <!-- Feature cards -->
      <section class="grid" aria-label="Features">
        <article class="card">
          <div class="chip chip--pink" aria-hidden="true">
            <Zap class="chipIcon" />
          </div>
          <h3 class="cardTitle">Daily Streaks</h3>
          <p class="cardText">Keep learning every day</p>
        </article>

        <article class="card">
          <div class="chip chip--blue" aria-hidden="true">
            <Users class="chipIcon" />
          </div>
          <h3 class="cardTitle">1v1 Duels</h3>
          <p class="cardText">Challenge friends</p>
        </article>

        <article class="card">
          <div class="chip chip--teal" aria-hidden="true">
            <Target class="chipIcon" />
          </div>
          <h3 class="cardTitle">Smart Quizzes</h3>
          <p class="cardText">Adaptive learning</p>
        </article>

        <article class="card">
          <div class="chip chip--green" aria-hidden="true">
            <Trophy class="chipIcon" />
          </div>
          <h3 class="cardTitle">Leaderboards</h3>
          <p class="cardText">Compete globally</p>
        </article>
      </section>

      <!-- CTA -->
      <section class="cta">
        <button
          class="ctaBtn"
          :class="{ pulse: isAnimating }"
          type="button"
          @click="handleGetStarted"
        >
          Start Your Journey
        </button>
        <p class="foot">Join thousands of students mastering CS concepts</p>
      </section>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Trophy, Zap, Users, Target } from 'lucide-vue-next'

const router = useRouter()
const isAnimating = ref(false)

const handleGetStarted = () => {
  isAnimating.value = true
  setTimeout(() => (isAnimating.value = false), 650)
  router.push('/onboarding')
}
</script>

<style scoped>
/* ===== Background (como la captura) ===== */
.screen {
  min-height: 100vh;
  width: 100vw; /* 🔥 ocupa todo el ancho */
  display: flex; /* en vez de grid */
  justify-content: center;
  padding: 24px 16px;

  color: rgba(255, 255, 255, 0.92);

  background:
    radial-gradient(900px 500px at 25% 10%, rgba(216, 70, 239, 0.22), transparent 55%),
    radial-gradient(900px 500px at 75% 20%, rgba(59, 130, 246, 0.22), transparent 55%),
    radial-gradient(900px 500px at 50% 95%, rgba(16, 185, 129, 0.12), transparent 60%),
    linear-gradient(180deg, #0b0a14 0%, #070a13 55%, #06151a 100%);

  overflow-x: hidden; /* evita scroll horizontal por gradients */
}
/* ===== Layout ===== */
.shell {
  width: 100%;
  max-width: 460px; /* el contenido sigue “phone-like” */
  margin: 0 auto;

  display: flex;
  flex-direction: column;
  gap: 22px;
}

.header {
  text-align: center;
  display: grid;
  gap: 10px;
  justify-items: center;
}

/* ===== Logo ===== */
.logo {
  width: 76px;
  height: 76px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #d946ef 0%, #3b82f6 100%);
  box-shadow:
    0 10px 30px rgba(59, 130, 246, 0.25),
    0 10px 30px rgba(217, 70, 239, 0.18);
  animation: pop 650ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
}

.logoIcon {
  width: 40px;
  height: 40px;
  color: rgba(255, 255, 255, 0.92);
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.25));
}

/* ===== Typography ===== */
.title {
  margin: 0;
  font-size: 44px;
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-weight: 850;
  text-shadow: 0 8px 30px rgba(59, 130, 246, 0.15);
}

.subtitle {
  margin: 0;
  font-size: 18px;
  line-height: 1.55;
  color: rgba(210, 225, 255, 0.72);
}

/* ===== Cards ===== */
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.card {
  border-radius: 18px;
  padding: 18px 16px 16px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(120, 140, 190, 0.25);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
  min-height: 140px;
  display: grid;
  gap: 10px;
  justify-items: center;
  text-align: center;
}

.card:hover {
  transform: translateY(-2px);
  border-color: rgba(160, 190, 255, 0.38);
  background: rgba(255, 255, 255, 0.045);
}

.chip {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.chipIcon {
  width: 22px;
  height: 22px;
}

.chip--pink {
  background: rgba(217, 70, 239, 0.15);
  color: #d946ef;
}
.chip--blue {
  background: rgba(59, 130, 246, 0.16);
  color: #3b82f6;
}
.chip--teal {
  background: rgba(6, 182, 212, 0.14);
  color: #06b6d4;
}
.chip--green {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
}

.cardTitle {
  margin: 2px 0 0;
  font-size: 15px;
  font-weight: 750;
  color: rgba(255, 255, 255, 0.92);
}

.cardText {
  margin: 0;
  font-size: 13px;
  color: rgba(210, 225, 255, 0.62);
}

/* ===== CTA ===== */
.cta {
  display: grid;
  gap: 10px;
}

.ctaBtn {
  width: 100%;
  height: 58px;
  border: 0;
  border-radius: 18px;
  font-size: 20px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
  background: linear-gradient(90deg, #d946ef 0%, #3b82f6 100%);
  box-shadow:
    0 14px 34px rgba(59, 130, 246, 0.2),
    0 14px 34px rgba(217, 70, 239, 0.14);
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
  transform: translateY(0px) scale(0.99);
}

.foot {
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: rgba(210, 225, 255, 0.62);
}

/* ===== Animations ===== */
.pulse {
  animation: pulse 650ms ease-out both;
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

/* Mobile spacing */
@media (max-width: 360px) {
  .title {
    font-size: 40px;
  }
  .subtitle {
    font-size: 16px;
  }
  .card {
    min-height: 132px;
    padding: 16px 14px;
  }
}
</style>
