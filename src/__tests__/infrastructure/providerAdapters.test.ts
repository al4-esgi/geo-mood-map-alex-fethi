import { afterEach, describe, expect, it, vi } from 'vitest'

describe('provider adapters', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maps weather response including icon', async () => {
    vi.mock('../../services/weatherService', () => ({
      getWeatherByCoords: vi.fn().mockResolvedValue({
        condition: 'clouds',
        temperature: 15,
        humidity: 60,
        icon: 'http://icon',
        source: 'mock',
      }),
    }))
    const { WeatherProviderImpl: Impl } = await import('../../infrastructure/providers/WeatherProviderImpl')
    const provider = new Impl()
    const res = await provider.getByCoords({ lat: 1, lon: 2 })
    expect(res.icon).toBe('http://icon')
    expect(res.condition).toBe('clouds')
  })

  it('maps geo response', async () => {
    vi.mock('../../services/geolocationService', () => ({
      getPlaceByCoords: vi.fn().mockResolvedValue({
        lat: 1,
        lon: 2,
        name: 'Place',
        type: 'city',
        source: 'mock',
      }),
    }))
    const { GeoProviderImpl: Impl } = await import('../../infrastructure/providers/GeoProviderImpl')
    const provider = new Impl()
    const res = await provider.getPlaceByCoords({ lat: 1, lon: 2 })
    expect(res.name).toBe('Place')
    expect(res.type).toBe('city')
  })

  it('delegates text sentiment to analyzer', async () => {
    vi.mock('../../services/textAnalysisService', () => ({
      analyzeText: vi.fn().mockResolvedValue({ score: 0.7, source: 'api' }),
    }))
    const { TextSentimentProviderImpl: Impl } = await import('../../infrastructure/providers/TextSentimentProviderImpl')
    const provider = new Impl()
    const res = await provider.analyze('hello')
    expect(res.score).toBe(0.7)
  })

  it('delegates image sentiment to analyzer', async () => {
    vi.mock('../../services/visionService', () => ({
      analyzeImage: vi.fn().mockResolvedValue({ score: 0.4, source: 'api' }),
    }))
    const { ImageSentimentProviderImpl: Impl } = await import('../../infrastructure/providers/ImageSentimentProviderImpl')
    const provider = new Impl()
    const res = await provider.analyze('data:image/png;base64,test')
    expect(res.score).toBe(0.4)
  })
})

