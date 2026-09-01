import type { ReactNode } from 'react'
import styles from './auth-layout.module.css'

type AuthCardProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthCard({ eyebrow, title, description, children, footer }: AuthCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeading}>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        <span>{description}</span>
      </div>
      {children}
      <div className={styles.cardFooter}>{footer}</div>
    </div>
  )
}
