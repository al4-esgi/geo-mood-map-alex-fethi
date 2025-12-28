import { describe, expect, it } from 'vitest'

import { FakeMoodRepository } from '../../../src/application/fakes/FakeMoodRepository'
import { ListMoodsUseCase } from '../../../src/application/usecases/ListMoodsUseCase'

describe('ListMoodsUseCase', () => {
  it('returns moods from repository', async () => {
    const repo = new FakeMoodRepository()
    await repo.save({
      text: 'a',
      rating: 3,
      score: 60,
      placeName: 'X',
      createdAt: new Date(),
    })
    await repo.save({
      text: 'b',
      rating: 4,
      score: 70,
      placeName: 'Y',
      createdAt: new Date(),
    })

    const uc = new ListMoodsUseCase(repo)
    const list = await uc.execute()

    expect(list).toHaveLength(2)
    expect(list[0].text).toBe('a')
    expect(list[1].text).toBe('b')
  })
})
