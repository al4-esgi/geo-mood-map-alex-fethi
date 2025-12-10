import { Store } from '@tanstack/store'
import {
  createInMemoryMoodStore,
  type MoodEntry,
  type MoodEntryInput,
  type MoodStore,
} from '../persistence/inMemoryMoodStore'
import { createLocalStorageMoodStore } from '../persistence/localStorageMoodStore'

export type MoodPersistence = 'memory' | 'localStorage'

export const moodStore = new Store<MoodEntry[]>([])

const memoryStore = createInMemoryMoodStore()
const localStorageStores = new Map<string | undefined, MoodStore>()

export async function loadMoods(persistence: MoodPersistence, storageKey?: string) {
  const store = getPersistenceStore(persistence, storageKey)
  const list = await store.list()
  moodStore.setState(list)
}

export async function saveMood(
  persistence: MoodPersistence,
  entry: MoodEntryInput,
  storageKey?: string,
): Promise<MoodEntry[]> {
  const store = getPersistenceStore(persistence, storageKey)
  await store.save(entry)
  const list = await store.list()
  moodStore.setState(list)
  return list
}

function getPersistenceStore(persistence: MoodPersistence, storageKey?: string) {
  if (persistence === 'localStorage') {
    const cached = localStorageStores.get(storageKey)
    if (cached) return cached
    const created = createLocalStorageMoodStore(storageKey)
    localStorageStores.set(storageKey, created)
    return created
  }
  return memoryStore
}

