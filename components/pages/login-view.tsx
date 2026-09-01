'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { AuthCard } from '@/components/auth/auth-card'
import { FormInput } from '@/components/auth/form-input'
import { AuthLayout } from '@/components/auth/auth-layout'
import { PasswordInput } from '@/components/auth/password-input'
import { useAuth } from '@/components/auth/auth-provider'
import { PrimaryButton } from '@/components/ui/primary-button'
import styles from './auth-form.module.css'

export function LoginView() {
  const router = useRouter()
  const { login, error, loading, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      await login(email, password)
      const requested = new URLSearchParams(window.location.search).get('redirect') ?? ''
      const destination =
        requested.startsWith('/') && !requested.startsWith('//') ? requested : '/dashboard'
      router.replace(destination)
    } catch (loginError) {
      console.error('Login failed:', loginError)
    }
  }

  return (
    <AuthLayout mode="login">
      <AuthCard
        eyebrow="Member access"
        title="Log in to ICC Clash"
        description="Continue your streak and jump back into your next challenge."
        footer={
          <p>
            New to ICC Clash? <Link href="/register">Create an account</Link>
          </p>
        }
      >
        <form
          className={styles.form}
          onSubmit={handleSubmit}
          aria-describedby={error ? 'login-form-error' : undefined}
        >
          <FormInput
            id="login-email"
            name="email"
            label="Email address"
            type="email"
            inputMode="email"
            value={email}
            onChange={(event) => {
              clearError()
              setEmail(event.target.value)
            }}
            required
            disabled={loading}
            autoComplete="email"
            placeholder="you@example.com"
          />
          <PasswordInput
            id="login-password"
            name="password"
            label="Password"
            value={password}
            onChange={(event) => {
              clearError()
              setPassword(event.target.value)
            }}
            required
            disabled={loading}
            autoComplete="current-password"
            placeholder="Enter your password"
          />
          {error && (
            <div className={styles.error} id="login-form-error" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
          <PrimaryButton type="submit" loading={loading} loadingLabel="Logging you in…">
            Log in
            <ArrowRight aria-hidden="true" />
          </PrimaryButton>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
