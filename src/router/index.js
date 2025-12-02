// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase/config'

// Import your components
import Login from '@/components/views/Login.vue'
import Register from '@/components/views/Register.vue'
import Dashboard from '@/components/views/Dashboard.vue'
import Profile from '@/components/views/Profile.vue'
import Duel from '@/components/views/Duel.vue'
import Home from '@/components/views/Home.vue'
import Onboarding from '@/components/views/Onboarding.vue'
import Quiz from '@/components/views/Quiz.vue'
import Leaderboard from '@/components/views/Leaderboard.vue'
import QuizDetail from '@/components/views/quizzes/QuizDetail.vue'
import QuizList from '@/components/views/quizzes/QuizList.vue'

const routes = [
  {
    path: '/',
    redirect: '/home',
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
  { path: '/quizzes', name: 'Quizzes', component: QuizList },
  {
    path: '/quizzes/:quizId',
    name: 'QuizDetail',
    component: QuizDetail,
    meta: { requiresAuth: true },
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
  const currentUser = auth.currentUser
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  if (requiresAuth && !currentUser) {
    // Route requires authentication but user is not logged in
    next('/register')
  } else {
    // Allow navigation
    next()
  }
})

export default router
