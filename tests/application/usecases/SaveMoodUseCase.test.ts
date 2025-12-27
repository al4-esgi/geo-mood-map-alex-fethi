import { describe, expect, it } from 'vitest'

import {
  FakeGeoProvider,
  FakeImageSentimentProvider,
  FakeTextSentimentProvider,
  FakeWeatherProvider,
} from '../../../src/application/fakes/FakeProviders'
import { FakeMoodRepository } from '../../../src/application/fakes/FakeMoodRepository'
import { SaveMoodUseCase } from '../../../src/application/usecases/SaveMoodUseCase'

describe('SaveMoodUseCase', () => {
  it('computes mood score and persists entry via repo', async () => {
    const repo = new FakeMoodRepository()
    const uc = new SaveMoodUseCase(
      repo,
      new FakeWeatherProvider({ condition: 'sun', temperature: 22 }),
      new FakeGeoProvider({ lat: 1, lon: 2, name: 'Test Place', type: 'city' }),
      new FakeTextSentimentProvider({ score: 0.6, source: 'mock' }),
      new FakeImageSentimentProvider({ score: 0.4, source: 'mock' }),
    )

    const saved = await uc.execute({
      text: 'happy day',
      rating: 4,
      coords: { lat: 1, lon: 2 },
      imageDataUrl: 'data:image/png;base64,xxx',
    })

    expect(saved.id).toBeDefined()
    expect(saved.placeName).toBe('Test Place')
    expect(saved.score).toBeGreaterThan(0)
    expect(saved.textSentimentScore).toBe(0.6)
    expect(saved.imageSentimentScore).toBe(0.4)
  })
})
