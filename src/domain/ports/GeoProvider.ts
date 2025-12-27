import type { Coordinates } from '../mood/types'

export type Place = {
  name: string
  type: 'park' | 'cafe' | 'beach' | 'city' | 'unknown'
  lat: number
  lon: number
}

export interface GeoProvider {
  getPlaceByCoords: (coords: Coordinates) => Promise<Place>
}
