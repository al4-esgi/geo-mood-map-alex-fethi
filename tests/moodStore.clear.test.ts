import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearMoodStore,
  loadMoods,
  moodStore,
  saveMood,
} from '../src/state/moodStore'

const storageKey = 'clear-moods-spec'

describe('clearMoodStore', () => {
  beforeEach(() => {
    localStorage.clear()
    clearMoodStore('localStorage', storageKey)
  })

  it('removes cached localStorage data so old moods stay cleared', async () => {
    const seed = [
      {
        id: 'seed-1',
        text: 'old mood',
        rating: 2,
        score: 40,
        placeName: 'Paris',
        createdAt: new Date('2024-01-01').toISOString(),
      },
    ]
    localStorage.setItem(storageKey, JSON.stringify(seed))

    await loadMoods('localStorage', storageKey)
    expect(moodStore.state.map((entry) => entry.text)).toEqual(['old mood'])

    clearMoodStore('localStorage', storageKey)
    expect(moodStore.state).toHaveLength(0)

    await saveMood(
      'localStorage',
      { text: 'fresh', rating: 5, score: 90, placeName: 'London' },
      storageKey,
    )

    expect(moodStore.state.map((entry) => entry.text)).toEqual(['fresh'])
    const persisted = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    expect(persisted).toHaveLength(1)
    expect(persisted[0].text).toBe('fresh')
  })
})
