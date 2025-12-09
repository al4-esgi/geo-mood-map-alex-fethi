import { describe, expect, it } from 'vitest'

import { createInMemoryMoodStore, type MoodEntryInput } from '../persistence/inMemoryMoodStore'
import { formatMoodSummary } from '../presentation/formatter'

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

describe('formatter', () => {
  it('produces a readable summary containing place, score, and text', async () => {
    const store = createInMemoryMoodStore()
    const saved = await store.save(sample)

    const summary = formatMoodSummary(saved)

    expect(summary).toContain('Paris')
    expect(summary).toContain('score=72')
    expect(summary).toContain('Feeling calm')
    expect(summary).toContain('cloudy 17°C')
  })
})

