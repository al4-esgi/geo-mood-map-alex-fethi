import { describe, expect, it } from 'vitest'

import { createInMemoryMoodStore } from '../src/persistence/inMemoryMoodStore'
import type { MoodEntryInput } from '../src/persistence/inMemoryMoodStore'

const sample: MoodEntryInput = {
  text: 'Feeling calm',
  rating: 4,
  score: 72,
  placeName: 'Paris',
  weatherSummary: 'cloudy 17°C',
}

describe('in-memory mood store', () => {
  it('saves entries and returns them in insertion order', async () => {
    const store = createInMemoryMoodStore()
    await store.save(sample)
    await store.save({ ...sample, text: 'Second', score: 65 })

    const list = await store.list()
    expect(list).toHaveLength(2)
    expect(list[0].text).toBe('Feeling calm')
    expect(list[1].text).toBe('Second')
    expect(list[0].id).toBeDefined()
    expect(list[0].createdAt).toBeInstanceOf(Date)
  })
})
