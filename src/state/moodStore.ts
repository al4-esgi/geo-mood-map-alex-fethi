import { Store } from '@tanstack/store'
import { createApiMoodStore } from '../persistence/apiMoodStore'
import { createInMemoryMoodStore } from '../persistence/inMemoryMoodStore'
import { createLocalStorageMoodStore } from '../persistence/localStorageMoodStore'
import type {
  MoodEntry,
  MoodEntryInput,
  MoodStore,
} from '../persistence/inMemoryMoodStore'

export type MoodPersistence = 'memory' | 'localStorage' | 'api'

const DEFAULT_STORAGE_KEY = 'geomood.entries'

export const moodStore = new Store<Array<MoodEntry>>([])

let memoryStore = createInMemoryMoodStore()
const localStorageStores = new Map<string | undefined, MoodStore>()
let apiStore: MoodStore | null = null

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
  if (persistence === 'api') {
    if (!apiStore) {
      apiStore = createApiMoodStore()
    }
    return apiStore
  }
  return memoryStore
}

export async function clearMoodStore(
  persistence: MoodPersistence,
  storageKey?: string,
) {
  const resolvedStorageKey = storageKey ?? DEFAULT_STORAGE_KEY
  if (persistence === 'localStorage') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(resolvedStorageKey)
    }
    localStorageStores.delete(storageKey)
  } else if (persistence === 'api') {
    if (apiStore) {
      await apiStore.clear()
    }
  } else {
    memoryStore = createInMemoryMoodStore()
  }
  moodStore.setState([])
}
