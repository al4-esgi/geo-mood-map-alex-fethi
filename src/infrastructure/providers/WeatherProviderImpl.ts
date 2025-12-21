import type { WeatherProvider } from '../../domain/ports/WeatherProvider'
import type { Coordinates, WeatherSnapshot } from '../../domain/mood/types'
import { getWeatherByCoords } from '../../services/weatherService'

export class WeatherProviderImpl implements WeatherProvider {
  async getByCoords(coords: Coordinates): Promise<WeatherSnapshot> {
    const res = await getWeatherByCoords({ lat: coords.lat, lon: coords.lon })
    return {
      condition: res.condition,
      temperature: res.temperature,
      humidity: res.humidity,
      icon: res.icon,
    }
  }
}

