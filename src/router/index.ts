import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue' // o tu HomeView
import OnboardingFlow from '../components/views/OnboardingFlow.vue'
import HomeView from '@/components/views/HomeView.vue'
import Dashboard from '@/components/views/Dashboard.vue'
import Quiz from '@/components/views/Quiz.vue'
import Duel from '@/components/views/Duel.vue'
import Leaderboard from '@/components/views/Leaderboard.vue'
import Profile from '@/components/views/Profile.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/onboarding', component: OnboardingFlow },
    { path: '/dashboard', component: Dashboard },
    { path: '/quiz', component: Quiz },
    { path: '/duel', component: Duel },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/profile', component: Profile },
  ],
})
