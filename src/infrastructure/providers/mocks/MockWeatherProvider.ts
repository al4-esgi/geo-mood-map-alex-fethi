import type { WeatherProvider } from '../../../domain/ports/WeatherProvider'
import type { Coordinates, WeatherSnapshot } from '../../../domain/mood/types'

export class MockWeatherProvider implements WeatherProvider {
  constructor(private snapshot: WeatherSnapshot = { condition: 'clouds', temperature: 17 }) { }
  async getByCoords(_coords: Coordinates): Promise<WeatherSnapshot> {
    return this.snapshot
  }
}

