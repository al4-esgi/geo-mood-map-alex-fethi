export type VisionAnalysisResult = {
  score: number // -1..1
  labels?: Array<string>
  source: 'api' | 'mock'
}

const VISION_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate?key='

export async function analyzeImage(
  dataUrl: string,
): Promise<VisionAnalysisResult> {
  const isTestEnv =
    import.meta.env.MODE === 'test' || import.meta.env.NODE_ENV === 'test'
  const apiKey = import.meta.env.VITE_GCLOUD_VISION_KEY

  if (!dataUrl) return { score: 0, source: 'mock' }
  if (isTestEnv || !apiKey || typeof fetch === 'undefined') {
    return mockVisionAnalysis()
  }

  try {
    const base64 = dataUrl.split(',')[1] ?? dataUrl
    const res = await fetch(`${VISION_ENDPOINT}${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [
              { type: 'FACE_DETECTION' },
              { type: 'LABEL_DETECTION', maxResults: 5 },
            ],
          },
        ],
      }),
    })
    if (!res.ok) return mockVisionAnalysis()
    const data = (await res.json()) as {
      responses?: Array<{
        faceAnnotations?: Array<{
          joyLikelihood?: string
          sorrowLikelihood?: string
        }>
        labelAnnotations?: Array<{ description?: string }>
      }>
    }
    const face = data.responses?.[0]?.faceAnnotations?.[0]
    const labels = data.responses?.[0]?.labelAnnotations
      ?.map((l) => l.description ?? '')
      .filter(Boolean)
    const joy = likelihoodToScore(face?.joyLikelihood)
    const sorrow = likelihoodToScore(face?.sorrowLikelihood)
    const score = clamp(joy - sorrow, -1, 1)
    return { score, labels, source: 'api' }
  } catch {
    return mockVisionAnalysis()
  }
}

function likelihoodToScore(l?: string): number {
  const map: Record<string, number> = {
    VERY_UNLIKELY: 0,
    UNLIKELY: 0.1,
    POSSIBLE: 0.3,
    LIKELY: 0.6,
    VERY_LIKELY: 0.8,
  }
  return map[l ?? ''] ?? 0
}

function mockVisionAnalysis(): VisionAnalysisResult {
  return { score: 0.2, labels: ['outdoor', 'person'], source: 'mock' }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}
