import prisma from './prisma'
import type {
  MoodRecord,
  MoodRepository,
  SaveMoodCommand,
} from '../../domain/ports/MoodRepository'

export class PrismaMoodRepository implements MoodRepository {
  async save(input: SaveMoodCommand): Promise<MoodRecord> {
    const created = await prisma.mood.create({
      data: {
        text: input.text,
        rating: input.rating,
        score: input.score,
        placeName: input.placeName,
        latitude: input.latitude,
        longitude: input.longitude,
        weatherSummary: input.weatherSummary,
        weatherIcon: input.weatherIcon,
        imageUrl: input.imageUrl,
        textSentimentScore: input.textSentimentScore,
        imageSentimentScore: input.imageSentimentScore,
        createdAt: input.createdAt ?? new Date(),
      },
    })
    return mapRecord(created)
  }

  async list(): Promise<Array<MoodRecord>> {
    const rows = await prisma.mood.findMany({ orderBy: { createdAt: 'asc' } })
    return rows.map(mapRecord)
  }

  async clear(): Promise<void> {
    await prisma.mood.deleteMany({})
  }
}

function mapRecord(row: {
  id: string
  text: string
  rating: number
  score: number
  placeName: string
  latitude: number | null
  longitude: number | null
  weatherSummary: string | null
  weatherIcon: string | null
  imageUrl: string | null
  textSentimentScore: number | null
  imageSentimentScore: number | null
  createdAt: Date
}): MoodRecord {
  return {
    id: row.id,
    text: row.text,
    rating: row.rating,
    score: row.score,
    placeName: row.placeName,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    weatherSummary: row.weatherSummary ?? undefined,
    weatherIcon: row.weatherIcon ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    textSentimentScore: row.textSentimentScore ?? undefined,
    imageSentimentScore: row.imageSentimentScore ?? undefined,
    createdAt: row.createdAt,
  }
}
