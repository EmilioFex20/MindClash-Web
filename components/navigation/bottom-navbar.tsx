'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Swords, Target, Trophy, User } from 'lucide-react'
import styles from './bottom-navbar.module.css'

const items = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/quiz', label: 'Quiz', icon: Target },
  { href: '/duel', label: 'Duel', icon: Swords },
  { href: '/leaderboard', label: 'Ranks', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
] as const

export function BottomNavbar() {
  const pathname = usePathname()

  return (
    <nav className={styles.wrap} aria-label="Bottom navigation">
      <div className={styles.inner}>
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href === '/quiz' && pathname.startsWith('/quizzes'))
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.button} ${active ? styles.active : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={styles.icon} />
              <span className={styles.text}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
