import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

let PrismaMoodRepository: typeof import('../../infrastructure/db/PrismaMoodRepository').PrismaMoodRepository
let prisma: typeof import('../../infrastructure/db/prisma').default

// Ensure a test database per run
const testDbPath = path.join(process.cwd(), 'prisma', 'test.db')
const testDbUrl = `file:${testDbPath}`

describe('PrismaMoodRepository', () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = testDbUrl
    if (fs.existsSync(testDbPath)) fs.rmSync(testDbPath)
    ;({ PrismaMoodRepository } = await import('../../infrastructure/db/PrismaMoodRepository'))
    ;({ default: prisma } = await import('../../infrastructure/db/prisma'))
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Mood (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        rating INTEGER NOT NULL,
        score INTEGER NOT NULL,
        placeName TEXT NOT NULL,
        weatherSummary TEXT,
        weatherIcon TEXT,
        imageUrl TEXT,
        textSentimentScore REAL,
        imageSentimentScore REAL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)
  })

  beforeEach(async () => {
    await prisma.mood.deleteMany({})
  })

  afterAll(async () => {
    await prisma.$disconnect()
    if (fs.existsSync(testDbPath)) fs.rmSync(testDbPath)
  })

  it('saves and lists moods', async () => {
    const repo = new PrismaMoodRepository()
    const saved = await repo.save({
      text: 'hello',
      rating: 4,
      score: 80,
      placeName: 'Paris',
      weatherSummary: 'clouds 17°C',
      createdAt: new Date('2023-01-01T00:00:00Z'),
    })

    expect(saved.id).toBeDefined()
    expect(saved.text).toBe('hello')

    const list = await repo.list()
    expect(list).toHaveLength(1)
    expect(list[0].text).toBe('hello')
  })
})

