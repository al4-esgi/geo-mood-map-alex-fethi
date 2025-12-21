import type { MoodScoreInput } from '../mood/types'

export type MoodRecord = {
  id: string
  text: string
  rating: number
  score: number
  placeName: string
  weatherSummary?: string
  weatherIcon?: string
  imageUrl?: string
  textSentimentScore?: number
  imageSentimentScore?: number
  createdAt: Date
}

export type SaveMoodCommand = {
  text: string
  rating: number
  score: number
  placeName: string
  weatherSummary?: string
  weatherIcon?: string
  imageUrl?: string
  textSentimentScore?: number
  imageSentimentScore?: number
  createdAt?: Date
}

export interface MoodRepository {
  save(input: SaveMoodCommand): Promise<MoodRecord>
  list(): Promise<MoodRecord[]>
  clear(): Promise<void>
}

