export type MoodEntryInput = {
  text: string
  rating: number
  score: number
  placeName: string
  weatherSummary?: string
  weatherIcon?: string
  imageUrl?: string
  coords?: [number, number]
  createdAt?: Date
}

export type MoodEntry = MoodEntryInput & {
  id: string
  createdAt: Date
}

export type MoodStore = {
  save: (entry: MoodEntryInput) => Promise<MoodEntry>
  list: () => Promise<Array<MoodEntry>>
}

export function createInMemoryMoodStore(): MoodStore {
  const entries: Array<MoodEntry> = []

  return {
    async save(entry: MoodEntryInput) {
      const saved: MoodEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: entry.createdAt ?? new Date(),
      }
      entries.push(saved)
      return saved
    },
    async list() {
      return [...entries]
    },
  }
}
