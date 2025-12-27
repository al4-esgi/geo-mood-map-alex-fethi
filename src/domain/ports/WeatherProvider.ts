import type { Coordinates, WeatherSnapshot } from '../mood/types'

export interface WeatherProvider {
  getByCoords: (coords: Coordinates) => Promise<WeatherSnapshot>
}
