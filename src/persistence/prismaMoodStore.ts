import { PrismaMoodRepository } from '../infrastructure/db/PrismaMoodRepository'
import type { MoodEntry, MoodEntryInput, MoodStore } from './inMemoryMoodStore'

export function createPrismaMoodStore(): MoodStore {
  const repo = new PrismaMoodRepository()

  return {
    async save(input: MoodEntryInput): Promise<MoodEntry> {
      const saved = await repo.save({
        text: input.text,
        rating: input.rating,
        score: input.score,
        placeName: input.placeName,
        latitude: input.coords?.[0],
        longitude: input.coords?.[1],
        weatherSummary: input.weatherSummary,
        weatherIcon: input.weatherIcon,
        imageUrl: input.imageUrl,
        textSentimentScore: input.textSentimentScore,
        imageSentimentScore: input.imageSentimentScore,
        createdAt: input.createdAt,
      })

      return {
        id: saved.id,
        text: saved.text,
        rating: saved.rating,
        score: saved.score,
        placeName: saved.placeName,
        weatherSummary: saved.weatherSummary,
        weatherIcon: saved.weatherIcon,
        imageUrl: saved.imageUrl,
        textSentimentScore: saved.textSentimentScore,
        imageSentimentScore: saved.imageSentimentScore,
        coords:
          saved.latitude !== undefined && saved.longitude !== undefined
            ? [saved.latitude, saved.longitude]
            : (input.coords ?? [0, 0]),
        createdAt: saved.createdAt,
      }
    },

    async list(): Promise<Array<MoodEntry>> {
      const records = await repo.list()
      return records.map((record) => ({
        id: record.id,
        text: record.text,
        rating: record.rating,
        score: record.score,
        placeName: record.placeName,
        weatherSummary: record.weatherSummary,
        weatherIcon: record.weatherIcon,
        imageUrl: record.imageUrl,
        textSentimentScore: record.textSentimentScore,
        imageSentimentScore: record.imageSentimentScore,
        coords:
          record.latitude !== undefined && record.longitude !== undefined
            ? [record.latitude, record.longitude]
            : [0, 0],
        createdAt: record.createdAt,
      }))
    },

    async clear(): Promise<void> {
      await repo.clear()
    },
  }
}
