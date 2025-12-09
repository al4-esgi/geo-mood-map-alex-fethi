import type { MoodEntry, MoodEntryInput, MoodStore } from './inMemoryMoodStore'

const DEFAULT_KEY = 'geomood.entries'

export function createLocalStorageMoodStore(storageKey: string = DEFAULT_KEY): MoodStore {
  let entries: MoodEntry[] = loadFromStorage(storageKey)

  return {
    async save(entry: MoodEntryInput) {
      const saved: MoodEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: entry.createdAt ?? new Date(),
      }
      entries = [...entries, saved]
      persist(storageKey, entries)
      return saved
    },
    async list() {
      return [...entries]
    },
  }
}

function loadFromStorage(storageKey: string): MoodEntry[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as MoodEntry[]
    return parsed.map((e) => ({
      ...e,
      createdAt: new Date(e.createdAt),
    }))
  } catch {
    return []
  }
}

function persist(storageKey: string, entries: MoodEntry[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(
    storageKey,
    JSON.stringify(
      entries.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      })),
    ),
  )
}

