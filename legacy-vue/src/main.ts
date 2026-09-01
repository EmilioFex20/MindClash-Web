import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initAuth } from '@/composables/useAuth'

const app = createApp(App)

// Start restoring the Firebase session before the initial navigation. The
// router guard awaits this same promise when it needs an auth decision.
void initAuth()

app.use(router)
app.mount('#app')
