import type { GeoProvider, Place } from '../../domain/ports/GeoProvider'
import type { ImageSentimentProvider } from '../../domain/ports/ImageSentimentProvider'
import type { TextSentimentProvider } from '../../domain/ports/TextSentimentProvider'
import type { WeatherProvider } from '../../domain/ports/WeatherProvider'
import type { SentimentScore, WeatherSnapshot } from '../../domain/mood/types'

export class FakeWeatherProvider implements WeatherProvider {
  constructor(
    private snapshot: WeatherSnapshot = {
      condition: 'clouds',
      temperature: 17,
    },
  ) {}
  async getByCoords(): Promise<WeatherSnapshot> {
    return this.snapshot
  }
}

export class FakeGeoProvider implements GeoProvider {
  constructor(
    private place: Place = { lat: 0, lon: 0, name: 'Mock Place', type: 'city' },
  ) {}
  async getPlaceByCoords(): Promise<Place> {
    return this.place
  }
}

export class FakeTextSentimentProvider implements TextSentimentProvider {
  constructor(
    private result: SentimentScore = { score: 0.5, source: 'mock' },
  ) {}
  async analyze(): Promise<SentimentScore> {
    return this.result
  }
}

export class FakeImageSentimentProvider implements ImageSentimentProvider {
  constructor(
    private result: SentimentScore = { score: 0.2, source: 'mock' },
  ) {}
  async analyze(): Promise<SentimentScore> {
    return this.result
  }
}
