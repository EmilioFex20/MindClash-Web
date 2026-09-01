export const XP_PER_LEVEL = 500

export function computeLevel(totalXp: number) {
  const safe = Math.max(0, Math.floor(totalXp || 0))
  const level = Math.floor(safe / XP_PER_LEVEL) + 1 // Level 1 starts at 0..499
  const xpWithinLevel = safe % XP_PER_LEVEL // progress inside current level
  const xpToNext = XP_PER_LEVEL - xpWithinLevel
  const progressPct = (xpWithinLevel / XP_PER_LEVEL) * 100

  return { level, xpWithinLevel, xpToNext, progressPct }
}
