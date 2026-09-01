import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './primary-button.module.css'

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  loading?: boolean
  loadingLabel?: string
}

export function PrimaryButton({
  children,
  disabled,
  loading = false,
  loadingLabel = 'Please wait',
  type = 'button',
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      {...props}
      className={`${styles.button} ${props.className ?? ''}`}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <LoaderCircle className={`${styles.spinner} spin`} aria-hidden="true" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
