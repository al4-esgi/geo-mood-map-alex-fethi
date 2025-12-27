import type { SentimentScore } from '../mood/types'

export interface TextSentimentProvider {
  analyze: (text: string) => Promise<SentimentScore>
}
