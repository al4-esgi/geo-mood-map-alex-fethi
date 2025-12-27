import type { SentimentScore } from '../mood/types'

export interface ImageSentimentProvider {
  analyze: (imageDataUrl: string) => Promise<SentimentScore>
}
