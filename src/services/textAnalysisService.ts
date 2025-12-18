export type TextAnalysisResult = {
  score: number // -1..1
  magnitude?: number
  source: 'api' | 'mock'
}

const NLP_ENDPOINT =
  'https://language.googleapis.com/v1/documents:analyzeSentiment?key='

export async function analyzeText(text: string): Promise<TextAnalysisResult> {
  const isTestEnv =
    import.meta.env.MODE === 'test' || import.meta.env.NODE_ENV === 'test'
  const apiKey = import.meta.env.VITE_GCLOUD_NLP_KEY

  if (!text.trim()) return { score: 0, source: 'mock' }
  if (isTestEnv || !apiKey || typeof fetch === 'undefined') {
    return mockTextAnalysis(text)
  }

  try {
    const res = await fetch(`${NLP_ENDPOINT}${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document: { type: 'PLAIN_TEXT', content: text },
        encodingType: 'UTF8',
      }),
    })
    if (!res.ok) return mockTextAnalysis(text)
    const data = (await res.json()) as {
      documentSentiment?: { score?: number; magnitude?: number }
    }
    const score = clamp(data.documentSentiment?.score ?? 0, -1, 1)
    return {
      score,
      magnitude: data.documentSentiment?.magnitude,
      source: 'api',
    }
  } catch {
    return mockTextAnalysis(text)
  }
}

function mockTextAnalysis(text: string): TextAnalysisResult {
  const lower = text.toLowerCase()
  if (lower.includes('happy') || lower.includes('joy'))
    return { score: 0.6, source: 'mock' }
  if (lower.includes('sad') || lower.includes('angry'))
    return { score: -0.6, source: 'mock' }
  return { score: 0, source: 'mock' }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}
