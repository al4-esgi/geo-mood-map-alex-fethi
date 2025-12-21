import type { TextSentimentProvider } from '../../../domain/ports/TextSentimentProvider'
import type { SentimentScore } from '../../../domain/mood/types'

export class MockTextSentimentProvider implements TextSentimentProvider {
  constructor(private result: SentimentScore = { score: 0.5, source: 'mock' }) {}
  async analyze(): Promise<SentimentScore> {
    return this.result
  }
}

