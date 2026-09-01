import Link from 'next/link'
import { BrandMark } from '@/components/brand/brand-mark'
import styles from './site-header.module.css'

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.titleBar}>
        <Link href="/" className={styles.brandLink} aria-label="ICC Clash home">
          <BrandMark compact onTitleBar />
        </Link>
      </div>
      <nav className={styles.menuBar} aria-label="Main navigation">
        <a className={styles.featuresLink} href="#features">
          Why ICC Clash
        </a>
        <div className={styles.spacer} />
        <Link className={styles.loginLink} href="/login">
          Log in
        </Link>
        <Link className={styles.registerLink} href="/register">
          Create account
        </Link>
      </nav>
    </header>
  )
}
