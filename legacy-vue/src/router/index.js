// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase/config'
import { initAuth } from '@/composables/useAuth'

// Import your components
import Login from '@/components/views/Login.vue'
import Register from '@/components/views/Register.vue'

// Load authenticated areas only when they are visited. This keeps the initial
// login/register bundle small and avoids shipping every game screen up front.
const Dashboard = () => import('@/components/views/Dashboard.vue')
const Profile = () => import('@/components/views/Profile.vue')
const Duel = () => import('@/components/views/Duel.vue')
const Home = () => import('@/components/views/Home.vue')
const Onboarding = () => import('@/components/views/Onboarding.vue')
const Quiz = () => import('@/components/views/Quiz.vue')
const Leaderboard = () => import('@/components/views/Leaderboard.vue')
const QuizDetail = () => import('@/components/views/quizzes/QuizDetail.vue')
const QuizList = () => import('@/components/views/quizzes/QuizList.vue')

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/home',
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: Leaderboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/quiz',
    name: 'Quiz',
    component: Quiz,
    meta: { requiresAuth: true },
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: Onboarding,
    meta: { requiresAuth: true },
  },
  {
    path: '/duel',
    name: 'Duel',
    component: Duel,
    meta: { requiresAuth: true },
  },
  {
    path: '/quizzes',
    name: 'Quizzes',
    component: QuizList,
    meta: { requiresAuth: true },
  },
  {
    path: '/quizzes/:quizId',
    name: 'QuizDetail',
    component: QuizDetail,
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard to protect routes
router.beforeEach(async (to) => {
  await initAuth()

  const currentUser = auth.currentUser
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  if (requiresAuth && !currentUser) {
    return {
      name: 'Register',
      query: { redirect: to.fullPath },
    }
  }

  if (requiresGuest && currentUser) return { name: 'Dashboard' }

  return true
})

export default router
