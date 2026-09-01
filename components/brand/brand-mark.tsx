import { Swords } from 'lucide-react'
import styles from './brand-mark.module.css'

export function BrandMark({
  compact = false,
  onTitleBar = false,
}: {
  compact?: boolean
  onTitleBar?: boolean
}) {
  return (
    <span
      className={`${styles.brand} ${compact ? styles.compact : ''} ${onTitleBar ? styles.onTitleBar : ''}`}
    >
      <span className={styles.iconWrap} aria-hidden="true">
        <Swords className={styles.icon} />
      </span>
      <span className={styles.name}>
        ICC<span>Clash</span>
      </span>
    </span>
  )
}
