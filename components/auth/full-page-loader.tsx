import styles from './route-guard.module.css'

export function FullPageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <main className={styles.loadingPage} aria-live="polite" aria-label={label}>
      <div className={styles.box}>
        <div className={`${styles.spinner} spin`} aria-hidden="true" />
        <span className={styles.label}>{label}…</span>
      </div>
    </main>
  )
}
