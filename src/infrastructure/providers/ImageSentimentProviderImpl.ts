import { analyzeImage } from '../../services/visionService'
import type { ImageSentimentProvider } from '../../domain/ports/ImageSentimentProvider'

export class ImageSentimentProviderImpl implements ImageSentimentProvider {
  async analyze(imageDataUrl: string) {
    return analyzeImage(imageDataUrl)
  }
}
