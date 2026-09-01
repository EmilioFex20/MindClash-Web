import Link from 'next/link'
import { BrandMark } from '@/components/brand/brand-mark'
import styles from './site-footer.module.css'

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brandLink} aria-label="ICC Clash home">
          <BrandMark compact />
        </Link>
        <p>Small challenges. Stronger skills. One streak at a time.</p>
        <nav className={styles.links} aria-label="Account links">
          <Link href="/login">Log in</Link>
          <Link href="/register">Create account</Link>
        </nav>
      </div>
    </footer>
  )
}
