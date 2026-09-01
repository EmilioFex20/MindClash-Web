import styles from './configuration-error.module.css'

export function ConfigurationError({ message }: { message: string }) {
  return (
    <main className={`${styles.page} bg-check`}>
      <section className={styles.card} role="alert">
        <div className={styles.titleBar}>
          <span>ICC Clash - Configuration Error</span>
        </div>
        <div className={styles.body}>
          <div className={styles.mark} aria-hidden="true">
            !
          </div>
          <p className={styles.label}>Configuration required</p>
          <h1>Connect Firebase to run ICC Clash</h1>
          <p className={styles.copy}>
            Copy <code>.env.example</code> to <code>.env</code>, replace the placeholders with
            your Firebase web app values, and restart the development server.
          </p>
          <p className={styles.detail}>{message}</p>
        </div>
      </section>
    </main>
  )
}
