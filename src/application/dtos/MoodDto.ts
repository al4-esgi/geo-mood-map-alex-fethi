export type MoodDto = {
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

