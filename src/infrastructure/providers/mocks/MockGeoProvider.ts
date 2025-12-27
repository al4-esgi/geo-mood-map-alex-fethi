import type { GeoProvider, Place } from '../../../domain/ports/GeoProvider'
import type { Coordinates } from '../../../domain/mood/types'

export class MockGeoProvider implements GeoProvider {
  constructor(
    private place: Place = { lat: 0, lon: 0, name: 'Mock Place', type: 'city' },
  ) {}
  async getPlaceByCoords(_coords: Coordinates): Promise<Place> {
    return this.place
  }
}
