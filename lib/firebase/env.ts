const firebaseEnvironment = {
  VITE_APIKEY: process.env.VITE_APIKEY ?? '',
  VITE_AUTHDOMAIN: process.env.VITE_AUTHDOMAIN ?? '',
  VITE_PROJECTID: process.env.VITE_PROJECTID ?? '',
  VITE_STORAGEBUCKET: process.env.VITE_STORAGEBUCKET ?? '',
  VITE_MESSAGINGSENDERID: process.env.VITE_MESSAGINGSENDERID ?? '',
  VITE_APPID: process.env.VITE_APPID ?? '',
}

const requiredKeys = ['VITE_APIKEY', 'VITE_AUTHDOMAIN', 'VITE_PROJECTID', 'VITE_APPID'] as const

export const missingFirebaseEnvironment = requiredKeys.filter(
  (key) => !firebaseEnvironment[key],
)

export const firebaseConfigurationError = missingFirebaseEnvironment.length
  ? `Missing Firebase environment variables: ${missingFirebaseEnvironment.join(', ')}`
  : null

export const firebaseConfig = {
  apiKey: firebaseEnvironment.VITE_APIKEY || 'firebase-not-configured',
  authDomain: firebaseEnvironment.VITE_AUTHDOMAIN || 'firebase-not-configured.invalid',
  projectId: firebaseEnvironment.VITE_PROJECTID || 'firebase-not-configured',
  storageBucket: firebaseEnvironment.VITE_STORAGEBUCKET || undefined,
  messagingSenderId: firebaseEnvironment.VITE_MESSAGINGSENDERID || undefined,
  appId: firebaseEnvironment.VITE_APPID || 'firebase-not-configured',
}
