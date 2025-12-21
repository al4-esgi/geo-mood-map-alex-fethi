import type { GeoProvider, Place } from '../../domain/ports/GeoProvider'
import type { Coordinates } from '../../domain/mood/types'
import { getPlaceByCoords } from '../../services/geolocationService'

export class GeoProviderImpl implements GeoProvider {
  async getPlaceByCoords(coords: Coordinates): Promise<Place> {
    const place = await getPlaceByCoords({ lat: coords.lat, lon: coords.lon })
    return {
      lat: place.lat,
      lon: place.lon,
      name: place.name,
      type: place.type,
    }
  }
}

