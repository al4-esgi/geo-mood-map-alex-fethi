import { MoodScoreService } from '../domain/mood/MoodScoreService'
import type { MoodScoreInput } from '../domain/mood/types'

export type { MoodScoreInput }

/**
 * Compatibility wrapper used by UI/tests; delegates to the single domain service.
 */
export function computeMoodScore(input: MoodScoreInput): number {
  return MoodScoreService.compute(input)
}
