import { describe, expect, it } from 'vitest'

import { computeMoodScore, type MoodScoreInput } from '../mood/moodScore'

const baseInput: MoodScoreInput = {
  rating: 3,
  text: 'I feel okay',
  weather: { condition: 'clouds', temperature: 18 },
}

describe('computeMoodScore', () => {
  it('scales user rating 1–5 into a base score (1→20, 3→60, 5→100)', () => {
    expect(computeMoodScore({ ...baseInput, rating: 1, text: '' })).toBe(20)
    expect(computeMoodScore({ ...baseInput, rating: 3, text: '' })).toBe(60)
    expect(computeMoodScore({ ...baseInput, rating: 5, text: '' })).toBe(100)
  })

  it('adds positive text sentiment keywords', () => {
    const score = computeMoodScore({
      ...baseInput,
      text: 'I feel really happy and calm today',
    })
    expect(score).toBe(70) // +10 for positive sentiment
  })

  it('subtracts negative text sentiment and rainy/cold weather, then clamps to 0', () => {
    const score = computeMoodScore({
      ...baseInput,
      rating: 1,
      text: 'I feel angry and sad',
      weather: { condition: 'rain', temperature: 4, humidity: 90 },
    })
    expect(score).toBe(0)
  })

  it('applies sunny/warm bonus and caps at 100', () => {
    const score = computeMoodScore({
      ...baseInput,
      rating: 5,
      text: 'happy and joyful',
      weather: { condition: 'sun', temperature: 23, humidity: 55 },
      imageSentiment: 'positive',
    })
    expect(score).toBe(100)
  })
})

