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

export function RegisterView() {
  const router = useRouter()
  const { register, error: authError, loading, clearError } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmPassword) {
      setValidationError("Passwords don't match")
      return
    }
    setValidationError(null)
    try {
      await register(email, password, displayName)
      router.replace('/onboarding')
    } catch (registrationError) {
      console.error('Registration failed:', registrationError)
    }
  }

  const update = (setter: (value: string) => void, value: string) => {
    clearError()
    setValidationError(null)
    setter(value)
  }

  return (
    <AuthLayout mode="register">
      <AuthCard
        eyebrow="Create your account"
        title="Join ICC Clash"
        description="Set up your profile and start turning practice into progress."
        footer={
          <p>
            Already have an account? <Link href="/login">Log in instead</Link>
          </p>
        }
      >
        <form
          className={styles.form}
          onSubmit={handleSubmit}
          aria-describedby={authError ? 'register-form-error' : undefined}
        >
          <FormInput
            id="register-name"
            name="displayName"
            label="Display name"
            value={displayName}
            onChange={(event) => update(setDisplayName, event.target.value)}
            required
            disabled={loading}
            autoComplete="name"
            placeholder="Ada Lovelace"
          />
          <FormInput
            id="register-email"
            name="email"
            label="Email address"
            type="email"
            inputMode="email"
            value={email}
            onChange={(event) => update(setEmail, event.target.value)}
            required
            disabled={loading}
            autoComplete="email"
            placeholder="you@example.com"
          />
          <PasswordInput
            id="register-password"
            name="password"
            label="Password"
            value={password}
            onChange={(event) => update(setPassword, event.target.value)}
            required
            disabled={loading}
            minLength={6}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            helperText="Use 6 or more characters."
          />
          <PasswordInput
            id="register-confirm-password"
            name="confirmPassword"
            label="Confirm password"
            value={confirmPassword}
            onChange={(event) => update(setConfirmPassword, event.target.value)}
            required
            disabled={loading}
            autoComplete="new-password"
            placeholder="Repeat your password"
            error={validationError ?? undefined}
          />
          {authError && (
            <div className={styles.error} id="register-form-error" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{authError}</span>
            </div>
          )}
          <PrimaryButton type="submit" loading={loading} loadingLabel="Creating your account…">
            Create account
            <ArrowRight aria-hidden="true" />
          </PrimaryButton>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
