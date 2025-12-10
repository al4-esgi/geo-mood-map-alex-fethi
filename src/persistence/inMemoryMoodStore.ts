export type MoodEntryInput = {
  text: string;
  rating: number;
  score: number;
  placeName: string;
  weatherSummary?: string;
  weatherIcon?: string;
  imageUrl?: string;
  createdAt?: Date;
};

export type MoodEntry = MoodEntryInput & {
  id: string;
  createdAt: Date;
};

export type MoodStore = {
  save: (entry: MoodEntryInput) => Promise<MoodEntry>;
  list: () => Promise<MoodEntry[]>;
};

export function createInMemoryMoodStore(): MoodStore {
  const entries: MoodEntry[] = [];

  return {
    async save(entry: MoodEntryInput) {
      const saved: MoodEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: entry.createdAt ?? new Date(),
      };
      entries.push(saved);
      return saved;
    },
    async list() {
      return [...entries];
    },
  };
}

