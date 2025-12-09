import { describe, expect, beforeEach, it } from 'vitest'

import { createLocalStorageMoodStore } from '../persistence/localStorageMoodStore'
import type { MoodEntryInput } from '../persistence/inMemoryMoodStore'

const sample: MoodEntryInput = {
  text: 'Stored mood',
  rating: 4,
  score: 80,
  placeName: 'Paris',
  weatherSummary: 'cloudy 17°C',
}

describe('localStorage mood store', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves entries and preserves insertion order', async () => {
    const store = createLocalStorageMoodStore('test-geomood')
    await store.save(sample)
    await store.save({ ...sample, text: 'Second' })

    const list = await store.list()
    expect(list).toHaveLength(2)
    expect(list[0].text).toBe('Stored mood')
    expect(list[1].text).toBe('Second')
    expect(list[0].createdAt).toBeInstanceOf(Date)
  })

  it('restores entries from storage on new instance', async () => {
    const key = 'test-geomood-restore'
    const first = createLocalStorageMoodStore(key)
    const saved = await first.save(sample)
    expect(saved.id).toBeDefined()

    const second = createLocalStorageMoodStore(key)
    const restored = await second.list()

    expect(restored).toHaveLength(1)
    expect(restored[0].text).toBe('Stored mood')
    expect(restored[0].createdAt).toBeInstanceOf(Date)
  })
})

