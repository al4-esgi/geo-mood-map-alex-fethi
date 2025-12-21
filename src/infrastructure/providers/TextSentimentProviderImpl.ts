import type { TextSentimentProvider } from '../../domain/ports/TextSentimentProvider'
import { analyzeText } from '../../services/textAnalysisService'

export class TextSentimentProviderImpl implements TextSentimentProvider {
  async analyze(text: string) {
    return analyzeText(text)
  }
}

