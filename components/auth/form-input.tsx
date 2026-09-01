import type { InputHTMLAttributes } from 'react'
import styles from './form-controls.module.css'

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  helperText?: string
  error?: string
}

export function FormInput({
  id,
  label,
  helperText,
  error,
  className,
  ...inputProps
}: FormInputProps) {
  const helperId = helperText ? `${id}-helper` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [inputProps['aria-describedby'], helperId, errorId].filter(Boolean).join(' ')

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        {...inputProps}
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ''} ${className ?? ''}`}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : inputProps['aria-invalid']}
      />
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
