import { describe, expect, it, vi } from 'vitest'

import { getPlaceByCoords } from '../services/geolocationService'

describe('geolocationService', () => {
  it('falls back to mock when fetch is not mocked in test env', async () => {
    const place = await getPlaceByCoords({ lat: 0, lon: 0 })
    expect(place.source).toBe('mock')
    expect(place.name).toBe('Mock Place')
  })

  it('maps Nominatim response to internal shape', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        display_name: 'Central Park, NYC',
        type: 'park',
        category: 'park',
      }),
    } as Response)

    const place = await getPlaceByCoords({ lat: 40.785091, lon: -73.968285 })

    expect(place.source).toBe('api')
    expect(place.name).toContain('Central Park')
    expect(place.type).toBe('park')

    fetchMock.mockRestore()
  })
})
