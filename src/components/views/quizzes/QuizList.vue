<template>
  <main class="page">
    <section class="wrap">
      <div class="top">
        <button class="ghostBack" type="button" @click="router.back()">← Back</button>
        <h1 class="title">Quizzes</h1>
        <p class="subtitle" v-if="subjectFilter">
          Filtrando por: <span class="pill">{{ subjectFilter }}</span>
          <button class="clear" @click="clearFilter">Quitar</button>
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="center">
        <div class="spinner" aria-label="Loading" />
      </div>

      <!-- Error -->
      <p v-else-if="error" class="error">{{ error }}</p>

      <!-- Empty -->
      <p v-else-if="items.length === 0" class="empty">
        No hay quizzes{{ subjectFilter ? ` para "${subjectFilter}"` : '' }}.
      </p>

      <!-- List -->
      <div v-else class="list">
        <button v-for="q in items" :key="q.id" type="button" class="card" @click="openQuiz(q.id)">
          <div class="cardLeft">
            <div class="cardTitle">{{ q.data.title }}</div>
            <div class="cardMeta">
              {{ q.data.subject }} • {{ q.data.difficulty }} • {{ q.data.questionCount }} questions
            </div>
          </div>
          <div class="xp">{{ q.data.maxPoints }} XP</div>
        </button>
      </div>
    </section>

    <BottomNavbar currentPage="quizzes" />
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BottomNavbar from '@/components/BottomNavbar.vue'
import { db } from '@/firebase/config'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'

const router = useRouter()
const route = useRoute()

/**
 * Meta que esperas en cada doc de /quizzes
 * {
 *   title: string,
 *   subject: string,
 *   difficulty: "Easy"|"Medium"|"Hard",
 *   questionCount: number,
 *   maxPoints: number
 * }
 */
const items = ref([]) // [{id, data}]
const loading = ref(true)
const error = ref(null)

const subjectFilter = computed(() => {
  const s = route.query.subject
  return typeof s === 'string' && s.trim() ? s.trim() : ''
})

let unsub = null

const startListener = () => {
  if (unsub) unsub()

  loading.value = true
  error.value = null

  try {
    const base = collection(db, 'quizzes')

    // Si tienes campo createdAt, mejor: orderBy("createdAt","desc")
    // aquí uso title para que sea estable y evitar error si no existe createdAt.
    const q = subjectFilter.value
      ? query(base, where('subject', '==', subjectFilter.value))
      : query(base, orderBy('title', 'asc'))

    unsub = onSnapshot(
      q,
      (snap) => {
        items.value = snap.docs
          .map((d) => ({ id: d.id, data: d.data() }))
          .sort((a, b) => (a.data.title || '').localeCompare(b.data.title || ''))
        loading.value = false
      },
      (err) => {
        console.error(err)
        error.value =
          err?.code === 'failed-precondition'
            ? 'Falta un índice en Firestore para este filtro. Abre la consola y crea el index sugerido.'
            : 'Error cargando quizzes.'
        loading.value = false
      },
    )
  } catch (e) {
    console.error(e)
    error.value = 'Error cargando quizzes.'
    loading.value = false
  }
}

onMounted(startListener)

// Re-escucha si cambian los query params (subject)
import { watch } from 'vue'
watch(subjectFilter, () => startListener())

onBeforeUnmount(() => {
  if (unsub) unsub()
})

const openQuiz = (id) => {
  router.push(`/quizzes/${id}`)
}

const clearFilter = () => {
  router.push({ path: '/quizzes', query: {} })
}
</script>

<style scoped>
/* Colores similares a tu RN */
.page {
  min-height: 100vh;
  width: 100vw;
  color: #f6f7fb;
  padding-bottom: 88px;
  background:
    radial-gradient(900px 520px at 20% 10%, rgba(216, 70, 239, 0.18), transparent 55%),
    radial-gradient(900px 520px at 78% 18%, rgba(59, 130, 246, 0.18), transparent 55%),
    linear-gradient(180deg, #0b0b10 0%, #070a13 70%, #06151a 100%);
  overflow-x: hidden;
}

.wrap {
  width: min(520px, 92vw);
  margin: 0 auto;
  padding: 16px 0 24px;
}

.top {
  margin-bottom: 12px;
}

.ghostBack {
  border: 0;
  background: transparent;
  color: rgba(246, 247, 251, 0.75);
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

.title {
  margin: 8px 0 0;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.01em;
}

.subtitle {
  margin: 8px 0 0;
  color: rgba(246, 247, 251, 0.65);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.pill {
  font-weight: 900;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.clear {
  border: 0;
  background: rgba(109, 141, 255, 0.15);
  color: rgba(246, 247, 251, 0.92);
  font-weight: 900;
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
}
.clear:hover {
  filter: brightness(1.08);
}

.center {
  min-height: 48vh;
  display: grid;
  place-items: center;
}

.spinner {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 3px solid rgba(255, 255, 255, 0.12);
  border-top-color: rgba(109, 141, 255, 0.95);
  animation: spin 0.85s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error {
  color: rgba(255, 80, 80, 0.95);
  font-weight: 800;
  margin: 16px 0 0;
}

.empty {
  margin: 16px 0 0;
  color: rgba(246, 247, 251, 0.65);
}

.list {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

/* Card RN-style */
.card {
  width: 100%;
  text-align: left;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  background: rgba(18, 19, 26, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);

  cursor: pointer;
  transition:
    transform 160ms ease,
    filter 160ms ease,
    opacity 160ms ease;
}
.card:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
}
.card:active {
  transform: translateY(0px) scale(0.99);
  opacity: 0.92;
}

.cardLeft {
  min-width: 0;
  flex: 1;
}

.cardTitle {
  font-weight: 900;
  font-size: 16px;
  line-height: 1.2;
}

.cardMeta {
  margin-top: 6px;
  color: rgba(246, 247, 251, 0.65);
  font-size: 13px;
  line-height: 1.35;
}

.xp {
  color: rgba(109, 141, 255, 0.95);
  font-weight: 900;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
