import { describe, expect, it, vi } from 'vitest'

import { getWeatherByCoords } from '../services/weatherService'

describe('weatherService', () => {
  it('falls back to mock when no API key', async () => {
    const weather = await getWeatherByCoords({ lat: 0, lon: 0 })
    expect(weather.source).toBe('mock')
    expect(weather.condition).toBe('clouds')
  })

  it('maps OpenWeather response to internal shape', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        weather: [{ main: 'Rain' }],
        main: { temp: 12, humidity: 80 },
      }),
    } as Response)

    // Stub API key
    const originalEnv = import.meta.env
    // @ts-expect-error test override
    import.meta.env = {
      ...import.meta.env,
      VITE_WEATHER_API_KEY: 'test-key',
    }

    const weather = await getWeatherByCoords({ lat: 1, lon: 2 })
    expect(weather.source).toBe('api')
    expect(weather.condition).toBe('rain')
    expect(weather.temperature).toBe(12)
    expect(weather.humidity).toBe(80)

    fetchMock.mockRestore()
    // @ts-expect-error restore
    import.meta.env = originalEnv
  })
})
