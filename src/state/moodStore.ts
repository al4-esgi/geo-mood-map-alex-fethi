import { Store } from '@tanstack/store'
import { createInMemoryMoodStore } from '../persistence/inMemoryMoodStore'
import { createLocalStorageMoodStore } from '../persistence/localStorageMoodStore'
import type {
  MoodEntry,
  MoodEntryInput,
  MoodStore,
} from '../persistence/inMemoryMoodStore'

export type MoodPersistence = 'memory' | 'localStorage'

const DEFAULT_STORAGE_KEY = 'geomood.entries'

export const moodStore = new Store<Array<MoodEntry>>([])

let memoryStore = createInMemoryMoodStore()
const localStorageStores = new Map<string | undefined, MoodStore>()

export async function loadMoods(
  persistence: MoodPersistence,
  storageKey?: string,
) {
  const store = getPersistenceStore(persistence, storageKey)
  const list = await store.list()
  moodStore.setState(list)
}

export async function saveMood(
  persistence: MoodPersistence,
  entry: MoodEntryInput,
  storageKey?: string,
): Promise<Array<MoodEntry>> {
  const store = getPersistenceStore(persistence, storageKey)
  const saved = await store.save(entry)
  moodStore.setState((prev) => [...prev, saved])
  return moodStore.state
}

function getPersistenceStore(
  persistence: MoodPersistence,
  storageKey?: string,
) {
  if (persistence === 'localStorage') {
    const cached = localStorageStores.get(storageKey)
    if (cached) return cached
    const created = createLocalStorageMoodStore(storageKey)
    localStorageStores.set(storageKey, created)
    return created
  }
  return memoryStore
}

export function clearMoodStore(
  persistence: MoodPersistence,
  storageKey?: string,
) {
  const resolvedStorageKey = storageKey ?? DEFAULT_STORAGE_KEY
  if (persistence === 'localStorage') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(resolvedStorageKey)
    }
    localStorageStores.delete(storageKey)
  } else {
    memoryStore = createInMemoryMoodStore()
  }
  moodStore.setState([])
}
