import type { MoodScoreInput, WeatherSnapshot } from './types'

export class MoodScoreService {
  static compute(input: MoodScoreInput): number {
    const base = clamp(input.rating * 20, 0, 100)
    const sentimentDelta = textSentimentDelta(input.text, input.textSentimentScore)
    const weatherDelta = weatherModifier(input.weather)
    const imageDelta = imageModifier(input.imageSentimentScore)
    return clamp(base + sentimentDelta + weatherDelta + imageDelta, 0, 100)
  }
}

function textSentimentDelta(text?: string, aiScore?: number): number {
  if (typeof aiScore === 'number') return clamp(aiScore, -1, 1) * 20
  if (!text) return 0
  const lower = text.toLowerCase()
  const positives = ['happy', 'joy', 'joyful', 'calm', 'peaceful']
  const negatives = ['sad', 'angry', 'mad', 'upset', 'anxious']
  const hasPositive = positives.some((word) => lower.includes(word))
  const hasNegative = negatives.some((word) => lower.includes(word))
  if (hasPositive && !hasNegative) return 10
  if (hasNegative && !hasPositive) return -10
  return 0
}

function weatherModifier(weather?: WeatherSnapshot): number {
  if (!weather) return 0
  let delta = 0
  const isRainy = weather.condition === 'rain'
  const isCold = weather.temperature < 8
  const isHeatWave = weather.temperature > 32
  const isPleasantSun =
    (weather.condition === 'sun' || weather.condition === 'clear') &&
    weather.temperature >= 18 &&
    weather.temperature <= 28
  const isHumid = typeof weather.humidity === 'number' && weather.humidity > 85

  if (isRainy) delta -= 20
  if (isCold) delta -= 10
  if (isHeatWave) delta -= 10
  if (isPleasantSun) delta += 5
  if (isHumid) delta -= 5
  return delta
}

function imageModifier(aiScore?: number): number {
  if (typeof aiScore === 'number') return clamp(aiScore, -1, 1) * 10
  return 0
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

