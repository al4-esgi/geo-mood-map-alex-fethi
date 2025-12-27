import { MoodScoreService } from '../../domain/mood/MoodScoreService'
import type { MoodScoreInput } from '../../domain/mood/types'
import type { GeoProvider } from '../../domain/ports/GeoProvider'
import type { ImageSentimentProvider } from '../../domain/ports/ImageSentimentProvider'
import type {
  MoodRepository,
  SaveMoodCommand,
} from '../../domain/ports/MoodRepository'
import type { TextSentimentProvider } from '../../domain/ports/TextSentimentProvider'
import type { WeatherProvider } from '../../domain/ports/WeatherProvider'
import type { MoodDto } from '../dtos/MoodDto'

export type SaveMoodInput = {
  text: string
  rating: number
  coords: { lat: number; lon: number }
  imageDataUrl?: string
}

export class SaveMoodUseCase {
  constructor(
    private readonly repo: MoodRepository,
    private readonly weather: WeatherProvider,
    private readonly geo: GeoProvider,
    private readonly textSentiment: TextSentimentProvider,
    private readonly imageSentiment: ImageSentimentProvider,
  ) {}

  async execute(input: SaveMoodInput): Promise<MoodDto> {
    const place = await this.geo.getPlaceByCoords(input.coords)
    const weather = await this.weather.getByCoords(input.coords)
    const textSentiment = input.text
      ? await this.textSentiment.analyze(input.text)
      : { score: 0, source: 'mock' as const }
    const imageSentiment =
      input.imageDataUrl != null
        ? await this.imageSentiment.analyze(input.imageDataUrl)
        : { score: 0, source: 'mock' as const }

    const score = MoodScoreService.compute({
      rating: input.rating,
      text: input.text,
      weather,
      textSentimentScore: textSentiment.score,
      imageSentimentScore: imageSentiment.score,
      imageSentiment: undefined,
    } satisfies MoodScoreInput)

    const toSave: SaveMoodCommand = {
      text: input.text,
      rating: input.rating,
      score,
      placeName: place.name,
      latitude: place.lat,
      longitude: place.lon,
      weatherSummary: `${weather.condition} ${weather.temperature}°C`,
      weatherIcon: weather.icon,
      imageUrl: input.imageDataUrl,
      textSentimentScore: textSentiment.score,
      imageSentimentScore: imageSentiment.score,
      createdAt: new Date(),
    }

    const saved = await this.repo.save(toSave)
    return saved
  }
}
