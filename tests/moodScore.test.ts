import { describe, expect, it } from 'vitest'

import { computeMoodScore } from '../src/mood/moodScore'
import type { MoodScoreInput } from '../src/mood/moodScore'

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

  it('gives no text delta when sentiment is mixed (happy + sad)', () => {
    const score = computeMoodScore({
      ...baseInput,
      text: 'happy but also a bit sad',
      weather: { condition: 'clouds', temperature: 20, humidity: 50 },
    })
    expect(score).toBe(60)
  })

  it('penalizes heatwave temperatures', () => {
    const score = computeMoodScore({
      ...baseInput,
      text: '',
      weather: { condition: 'sun', temperature: 35, humidity: 40 },
    })
    expect(score).toBe(50) // base 60 -10 heat penalty
  })

  it('penalizes very high humidity slightly', () => {
    const score = computeMoodScore({
      ...baseInput,
      text: '',
      weather: { condition: 'clouds', temperature: 22, humidity: 90 },
    })
    expect(score).toBe(55) // base 60 -5 humidity penalty
  })

  it('combines rain penalty, humidity penalty, and positive text bonus', () => {
    const score = computeMoodScore({
      ...baseInput,
      rating: 4,
      text: 'happy and grateful',
      weather: { condition: 'rain', temperature: 12, humidity: 95 },
    })
    // base 80 -20 rain -5 humidity +10 positive = 65
    expect(score).toBe(65)
  })

  it('applies negative image sentiment penalty', () => {
    const score = computeMoodScore({
      ...baseInput,
      rating: 4,
      text: 'content',
      weather: { condition: 'clouds', temperature: 20, humidity: 60 },
      imageSentiment: 'negative',
    })
    // base 80 +0 text -0 weather -5 image = 75
    expect(score).toBe(75)
  })

  it('combines extreme cold and rain penalties and clamps at 0 if needed', () => {
    const score = computeMoodScore({
      ...baseInput,
      rating: 1,
      text: '',
      weather: { condition: 'rain', temperature: -2, humidity: 70 },
    })
    // base 20 -20 rain -10 cold = -10 -> clamp 0
    expect(score).toBe(0)
  })

  it('combines heatwave and high humidity penalties with positive text', () => {
    const score = computeMoodScore({
      ...baseInput,
      rating: 5,
      text: 'joyful and excited',
      weather: { condition: 'sun', temperature: 34, humidity: 90 },
    })
    // base 100 -10 heat -5 humidity +10 positive = 95
    expect(score).toBe(95)
  })
})
