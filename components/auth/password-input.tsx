'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useRef, useState, type InputHTMLAttributes } from 'react'
import styles from './form-controls.module.css'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  id: string
  label: string
  helperText?: string
  error?: string
}

export function PasswordInput({
  id,
  label,
  helperText,
  error,
  className,
  ...inputProps
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const helperId = helperText ? `${id}-helper` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [inputProps['aria-describedby'], helperId, errorId].filter(Boolean).join(' ')

  function toggleVisibility() {
    const input = inputRef.current
    const selectionStart = input?.selectionStart ?? null
    const selectionEnd = input?.selectionEnd ?? null
    const selectionDirection = input?.selectionDirection ?? undefined

    setIsVisible((visible) => !visible)

    window.requestAnimationFrame(() => {
      if (!input) return
      input.focus({ preventScroll: true })
      if (selectionStart !== null && selectionEnd !== null) {
        input.setSelectionRange(selectionStart, selectionEnd, selectionDirection)
      }
    })
  }

  const toggleLabel = isVisible ? 'Hide password' : 'Show password'

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.passwordWrap}>
        <input
          {...inputProps}
          ref={inputRef}
          id={id}
          type={isVisible ? 'text' : 'password'}
          className={`${styles.input} ${styles.passwordInput} ${error ? styles.inputError : ''} ${className ?? ''}`}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : inputProps['aria-invalid']}
        />
        <button
          className={styles.visibilityButton}
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={toggleVisibility}
          aria-label={toggleLabel}
          aria-pressed={isVisible}
          title={toggleLabel}
        >
          {isVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </div>
      {helperText && (
        <p className={styles.helper} id={helperId}>
          {helperText}
        </p>
      )}
      {error && (
        <p className={styles.fieldError} id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
