import type { ImageSentimentProvider } from '../../domain/ports/ImageSentimentProvider'
import { analyzeImage } from '../../services/visionService'

export class ImageSentimentProviderImpl implements ImageSentimentProvider {
  async analyze(imageDataUrl: string) {
    return analyzeImage(imageDataUrl)
  }
}

