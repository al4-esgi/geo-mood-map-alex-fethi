import { describe, expect, it } from 'vitest'

import { MoodScoreService } from './MoodScoreService'
import type { MoodScoreInput } from './types'

const baseInput: MoodScoreInput = {
  rating: 3,
  text: 'neutral',
  weather: { condition: 'clouds', temperature: 18 },
}

describe('MoodScoreService', () => {
  it('scales rating 1–5 into base score', () => {
    expect(MoodScoreService.compute({ ...baseInput, rating: 1 })).toBe(20)
    expect(MoodScoreService.compute({ ...baseInput, rating: 3 })).toBe(60)
    expect(MoodScoreService.compute({ ...baseInput, rating: 5 })).toBe(100)
  })

  it('applies positive text sentiment from keywords', () => {
    const score = MoodScoreService.compute({ ...baseInput, text: 'I feel happy and calm' })
    expect(score).toBe(70)
  })

  it('applies AI text sentiment score when provided', () => {
    const score = MoodScoreService.compute({ ...baseInput, textSentimentScore: 0.5 })
    expect(score).toBe(70)
  })

  it('penalizes rain and cold, clamping at 0', () => {
    const score = MoodScoreService.compute({
      rating: 1,
      text: '',
      weather: { condition: 'rain', temperature: 2, humidity: 90 },
    })
    expect(score).toBe(0)
  })

  it('applies heatwave and humidity penalties', () => {
    const score = MoodScoreService.compute({
      ...baseInput,
      weather: { condition: 'sun', temperature: 35, humidity: 90 },
    })
    expect(score).toBe(45) // base 60 -10 heat -5 humidity
  })

  it('applies pleasant sun bonus', () => {
    const score = MoodScoreService.compute({
      ...baseInput,
      weather: { condition: 'sun', temperature: 23, humidity: 50 },
    })
    expect(score).toBe(65) // base 60 +5
  })

  it('applies image sentiment score when provided', () => {
    const score = MoodScoreService.compute({
      ...baseInput,
      imageSentimentScore: 0.6,
    })
    expect(score).toBe(66) // +6
  })

  it('clamps above 100 when combining positive factors', () => {
    const score = MoodScoreService.compute({
      rating: 5,
      textSentimentScore: 0.8, // +16
      imageSentimentScore: 0.8, // +8
      weather: { condition: 'sun', temperature: 24 },
    })
    expect(score).toBe(100)
  })
})

