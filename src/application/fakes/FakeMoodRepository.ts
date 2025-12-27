import type {
  MoodRecord,
  MoodRepository,
  SaveMoodCommand,
} from '../../domain/ports/MoodRepository'

export class FakeMoodRepository implements MoodRepository {
  private entries: Array<MoodRecord> = []

  async save(input: SaveMoodCommand): Promise<MoodRecord> {
    const saved: MoodRecord = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: input.createdAt ?? new Date(),
    }
    this.entries.push(saved)
    return saved
  }

  async list(): Promise<Array<MoodRecord>> {
    return [...this.entries]
  }

  async clear(): Promise<void> {
    this.entries = []
  }
}
