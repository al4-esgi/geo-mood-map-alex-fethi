import { analyzeText } from '../../services/textAnalysisService'
import type { TextSentimentProvider } from '../../domain/ports/TextSentimentProvider'

export class TextSentimentProviderImpl implements TextSentimentProvider {
  async analyze(text: string) {
    return analyzeText(text)
  }
}
