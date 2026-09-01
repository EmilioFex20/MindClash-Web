import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const env = import.meta.env
const requiredFirebaseEnv = {
  VITE_APIKEY: env.VITE_APIKEY,
  VITE_AUTHDOMAIN: env.VITE_AUTHDOMAIN,
  VITE_PROJECTID: env.VITE_PROJECTID,
  VITE_APPID: env.VITE_APPID,
}

const missingFirebaseEnv = Object.entries(requiredFirebaseEnv)
  .filter(([, value]) => !value)
  .map(([name]) => name)

export const firebaseConfigurationError = missingFirebaseEnv.length
  ? `Missing Firebase environment variables: ${missingFirebaseEnv.join(', ')}`
  : null

export const isFirebaseConfigured = firebaseConfigurationError === null

// Non-empty placeholders let Vue render a useful configuration screen instead
// of Firebase throwing auth/invalid-api-key before the app can mount.
const firebaseConfig = {
  apiKey: env.VITE_APIKEY || 'firebase-not-configured',
  authDomain: env.VITE_AUTHDOMAIN || 'firebase-not-configured.invalid',
  projectId: env.VITE_PROJECTID || 'firebase-not-configured',
  storageBucket: env.VITE_STORAGEBUCKET,
  messagingSenderId: env.VITE_MESSAGINGSENDERID,
  appId: env.VITE_APPID || 'firebase-not-configured',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }
