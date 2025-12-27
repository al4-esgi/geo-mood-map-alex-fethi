export type MoodRecord = {
  id: string
  text: string
  rating: number
  score: number
  placeName: string
  latitude?: number
  longitude?: number
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
  latitude?: number
  longitude?: number
  weatherSummary?: string
  weatherIcon?: string
  imageUrl?: string
  textSentimentScore?: number
  imageSentimentScore?: number
  createdAt?: Date
}

export interface MoodRepository {
  save: (input: SaveMoodCommand) => Promise<MoodRecord>
  list: () => Promise<Array<MoodRecord>>
  clear: () => Promise<void>
}
