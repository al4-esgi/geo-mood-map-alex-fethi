export type Coordinates = {
  lat: number
  lon: number
}

export type WeatherSnapshot = {
  condition: 'sun' | 'clouds' | 'rain' | 'snow' | 'clear'
  temperature: number
  humidity?: number
  icon?: string
}

export type SentimentScore = {
  score: number // -1..1
  source: 'api' | 'mock'
  magnitude?: number
}

export type MoodScoreInput = {
  rating: number // 1–5 user rating
  text?: string
  weather?: WeatherSnapshot
  textSentimentScore?: number // -1..1 from NLP
  imageSentimentScore?: number // -1..1 from Vision
}

