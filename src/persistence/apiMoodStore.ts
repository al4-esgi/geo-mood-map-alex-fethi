import type { MoodEntry, MoodEntryInput, MoodStore } from './inMemoryMoodStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function createApiMoodStore(): MoodStore {
  return {
    async save(input: MoodEntryInput): Promise<MoodEntry> {
      const response = await fetch(`${API_BASE_URL}/api/moods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save mood')
      }

      const saved = await response.json()
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
        createdAt: new Date(saved.createdAt),
      }
    },

    async list(): Promise<Array<MoodEntry>> {
      const response = await fetch(`${API_BASE_URL}/api/moods`)

      if (!response.ok) {
        throw new Error('Failed to list moods')
      }

      const records = await response.json()
      return records.map((record: any) => ({
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
        createdAt: new Date(record.createdAt),
      }))
    },

    async clear(): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/api/moods`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to clear moods')
      }
    },
  }
}
