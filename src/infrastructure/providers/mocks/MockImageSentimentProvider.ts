import type { ImageSentimentProvider } from '../../../domain/ports/ImageSentimentProvider'
import type { SentimentScore } from '../../../domain/mood/types'

export class MockImageSentimentProvider implements ImageSentimentProvider {
  constructor(
    private result: SentimentScore = { score: 0.2, source: 'mock' },
  ) {}
  async analyze(): Promise<SentimentScore> {
    return this.result
  }
}
