import type { MoodEntry } from '../persistence/inMemoryMoodStore'

/**
 * Produces a human-readable summary of a mood entry for quick display.
 */
export function formatMoodSummary(entry: MoodEntry): string {
  const timestamp = entry.createdAt.toISOString()
  const weather = entry.weatherSummary ? ` • ${entry.weatherSummary}` : ''
  const image = entry.imageUrl ? ` • image=${entry.imageUrl}` : ''
  return `[${timestamp}] ${entry.placeName}: score=${entry.score} — ${entry.text}${weather}${image}`
}

