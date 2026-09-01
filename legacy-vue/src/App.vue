<template>
  <main v-if="firebaseConfigurationError" class="config-page">
    <section class="config-card" role="alert">
      <div class="config-mark" aria-hidden="true">!</div>
      <p class="config-label">Configuration required</p>
      <h1>Connect Firebase to run MindClash</h1>
      <p class="config-copy">
        Copy <code>.env.example</code> to <code>.env</code>, replace the placeholders with your
        Firebase web app values, and restart the development server.
      </p>
      <p class="config-detail">{{ firebaseConfigurationError }}</p>
    </section>
  </main>
  <router-view v-else v-slot="{ Component }">
    <component :is="Component" v-if="Component" />
    <main v-else class="route-loading" aria-live="polite" aria-label="Loading application">
      <div class="loading-spinner" aria-hidden="true"></div>
    </main>
  </router-view>
</template>

<script setup lang="ts">
import { firebaseConfigurationError } from '@/firebase/config'
</script>

<style scoped>
.config-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  color: rgba(255, 255, 255, 0.94);
  background:
    radial-gradient(800px 460px at 20% 10%, rgba(217, 70, 239, 0.2), transparent 58%),
    radial-gradient(800px 460px at 80% 20%, rgba(59, 130, 246, 0.2), transparent 58%),
    linear-gradient(180deg, #0b0a14, #06151a);
}

.route-loading {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #0b0a14, #06151a);
}

.loading-spinner {
  width: 42px;
  height: 42px;
  border: 3px solid rgba(255, 255, 255, 0.14);
  border-top-color: #a855f7;
  border-radius: 999px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.config-card {
  width: min(560px, 100%);
  padding: 32px;
  border: 1px solid rgba(160, 190, 255, 0.24);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
}

.config-mark {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  font-size: 26px;
  font-weight: 900;
  background: linear-gradient(135deg, #d946ef, #3b82f6);
}

.config-label {
  margin-top: 22px;
  color: #c084fc;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin-top: 6px;
  font-size: clamp(28px, 6vw, 42px);
  line-height: 1.1;
  font-weight: 900;
}

.config-copy {
  margin-top: 18px;
  color: rgba(220, 230, 255, 0.76);
  line-height: 1.7;
}

code {
  padding: 2px 7px;
  border-radius: 7px;
  color: #fff;
  background: rgba(255, 255, 255, 0.09);
}

.config-detail {
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: 12px;
  color: #fda4af;
  background: rgba(244, 63, 94, 0.1);
  font-size: 13px;
  overflow-wrap: anywhere;
}
</style>
