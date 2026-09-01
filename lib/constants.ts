export const XP_PER_LEVEL = 500

export const AVATAR_OPTIONS = [
  { id: 'robot', emoji: '🤖', name: 'Robo Coder' },
  { id: 'wizard', emoji: '🧙‍♂️', name: 'Code Wizard' },
  { id: 'ninja', emoji: '🥷', name: 'Bug Ninja' },
  { id: 'scientist', emoji: '👩‍🔬', name: 'Data Scientist' },
  { id: 'astronaut', emoji: '👨‍🚀', name: 'Space Explorer' },
  { id: 'superhero', emoji: '🦸‍♀️', name: 'Code Hero' },
] as const

export function computeLevel(totalXp: number) {
  const safe = Math.max(0, Math.floor(totalXp || 0))
  const level = Math.floor(safe / XP_PER_LEVEL) + 1
  const xpWithinLevel = safe % XP_PER_LEVEL
  const xpToNext = XP_PER_LEVEL - xpWithinLevel
  const progressPct = (xpWithinLevel / XP_PER_LEVEL) * 100

  return { level, xpWithinLevel, xpToNext, progressPct }
}

// Subject progress is stored 0-100; tolerate a 0-1 fraction too.
export function normalizeProgress(value: unknown) {
  const numeric = Number(value ?? 0)
  return numeric > 1 ? Math.max(0, Math.min(1, numeric / 100)) : Math.max(0, Math.min(1, numeric))
}

export function masteryLabel(progressFraction: number) {
  const pct = progressFraction * 100
  if (pct >= 70) return 'Advanced'
  if (pct >= 40) return 'Intermediate'
  if (pct >= 15) return 'Beginner'
  return 'Novice'
}
