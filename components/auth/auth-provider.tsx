'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth } from '@/lib/firebase/client'

type AuthContextValue = {
  user: User | null
  initializing: boolean
  loading: boolean
  error: string | null
  clearError: () => void
  login: (email: string, password: string) => Promise<User>
  register: (email: string, password: string, displayName: string) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'An account already exists for this email address.',
      'auth/invalid-credential': 'The email or password you entered is incorrect.',
      'auth/invalid-email': 'Enter a valid email address.',
      'auth/network-request-failed':
        'We could not connect. Check your internet connection and try again.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment before trying again.',
      'auth/user-disabled': 'This account has been disabled. Contact support for help.',
      'auth/weak-password': 'Choose a stronger password with at least 6 characters.',
    }

    return messages[error.code] ?? 'We could not complete that request. Please try again.'
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => setInitializing(false), 5000)
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        window.clearTimeout(timeout)
        setUser(firebaseUser)
        setInitializing(false)
      },
      (authError) => {
        window.clearTimeout(timeout)
        setError(getErrorMessage(authError))
        setUser(null)
        setInitializing(false)
      },
    )

    return () => {
      window.clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      setUser(credential.user)
      return credential.user
    } catch (loginError) {
      setError(getErrorMessage(loginError))
      throw loginError
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    setLoading(true)
    setError(null)
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName.trim()) {
        await updateProfile(credential.user, { displayName: displayName.trim() })
      }
      setUser(credential.user)
      return credential.user
    } catch (registrationError) {
      setError(getErrorMessage(registrationError))
      throw registrationError
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (logoutError) {
      setError(getErrorMessage(logoutError))
      throw logoutError
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({ user, initializing, loading, error, clearError, login, register, logout }),
    [user, initializing, loading, error, clearError, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
