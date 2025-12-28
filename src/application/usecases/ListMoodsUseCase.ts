import type { MoodRepository } from '../../domain/ports/MoodRepository'
import type { MoodDto } from '../dtos/MoodDto'

export class ListMoodsUseCase {
  constructor(private readonly repo: MoodRepository) {}

  async execute(): Promise<Array<MoodDto>> {
    return this.repo.list()
  }
}
