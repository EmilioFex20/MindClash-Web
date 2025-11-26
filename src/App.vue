<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10"
  >
    <div class="w-full max-w-md space-y-8">
      <!-- Logo and Title -->
      <div class="text-center space-y-4">
        <div
          class="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center animate-bounce-in"
        >
          <!-- Trophy Icon -->
          <Trophy class="w-10 h-10 text-primary-foreground" />
        </div>
        <div class="space-y-2">
          <h1 class="text-4xl font-bold text-foreground text-balance">CodeQuest</h1>
          <p class="text-lg text-muted-foreground text-pretty">
            Master Computer Science through fun, gamified learning
          </p>
        </div>
      </div>

      <!-- Feature Cards -->
      <div class="grid grid-cols-2 gap-4">
        <Card
          className="p-4 text-center space-y-2 border-2 hover:border-primary/50 transition-colors"
        >
          <div class="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
            <Zap class="w-6 h-6 text-primary" />
          </div>
          <h3 class="font-semibold text-sm">Daily Streaks</h3>
          <p class="text-xs text-muted-foreground">Keep learning every day</p>
        </Card>

        <Card
          className="p-4 text-center space-y-2 border-2 hover:border-secondary/50 transition-colors"
        >
          <div
            class="w-12 h-12 mx-auto bg-secondary/10 rounded-xl flex items-center justify-center"
          >
            <Users class="w-6 h-6 text-secondary" />
          </div>
          <h3 class="font-semibold text-sm">1v1 Duels</h3>
          <p class="text-xs text-muted-foreground">Challenge friends</p>
        </Card>

        <Card
          className="p-4 text-center space-y-2 border-2 hover:border-accent/50 transition-colors"
        >
          <div class="w-12 h-12 mx-auto bg-accent/10 rounded-xl flex items-center justify-center">
            <Target class="w-6 h-6 text-accent-foreground" />
          </div>
          <h3 class="font-semibold text-sm">Smart Quizzes</h3>
          <p class="text-xs text-muted-foreground">Adaptive learning</p>
        </Card>

        <Card
          className="p-4 text-center space-y-2 border-2 hover:border-success/50 transition-colors"
        >
          <div class="w-12 h-12 mx-auto bg-success/10 rounded-xl flex items-center justify-center">
            <Trophy class="w-6 h-6 text-success" />
          </div>
          <h3 class="font-semibold text-sm">Leaderboards</h3>
          <p class="text-xs text-muted-foreground">Compete globally</p>
        </Card>
      </div>

      <!-- CTA Button -->
      <div class="space-y-4">
        <Button
          @click="handleGetStarted"
          :class="[
            'w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300',
            isAnimating ? 'animate-pulse-glow' : '',
          ]"
        >
          Start Your Journey
        </Button>

        <p class="text-center text-sm text-muted-foreground">
          Join thousands of students mastering CS concepts
        </p>
      </div>

      <!-- Subject Pills -->
      <div class="flex flex-wrap gap-2 justify-center">
        <span
          v-for="subject in subjects"
          :key="subject"
          class="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground"
        >
          {{ subject }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Button } from './components/ui/Button.vue' // Assuming Button is a separate component
import { Card } from './components/ui/Card.vue' // Assuming Card is a separate component
import { Trophy, Zap, Users, Target } from 'lucide-vue-next' // Lucide Vue icons (install lucide-vue-next)

const isAnimating = ref(false)
const subjects = ref(['Programming', 'Algorithms', 'Networking', 'AI/ML', 'Databases'])

const handleGetStarted = () => {
  isAnimating.value = true
  window.location.href = '/onboarding'
}
</script>
