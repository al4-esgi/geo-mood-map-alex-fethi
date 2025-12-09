import { describe, expect, it } from 'vitest'

import { getPlaceByCoords } from '../services/geolocationService'
import { getWeatherByCoords } from '../services/weatherService'

const parisCoords = { lat: 48.8566, lon: 2.3522 }

describe('mocked services', () => {
  it('returns deterministic weather when API is not wired', async () => {
    const weather = await getWeatherByCoords(parisCoords)
    expect(weather).toMatchObject({
      lat: parisCoords.lat,
      lon: parisCoords.lon,
      condition: 'clouds',
      source: 'mock',
    })
    expect(typeof weather.temperature).toBe('number')
  })

  it('returns deterministic place data when geo API is not wired', async () => {
    const place = await getPlaceByCoords(parisCoords)
    expect(place).toMatchObject({
      lat: parisCoords.lat,
      lon: parisCoords.lon,
      name: 'Mock Place',
      type: 'park',
      source: 'mock',
    })
  })
})

