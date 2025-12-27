import express from 'express'
import cors from 'cors'
import { PrismaMoodRepository } from '../src/infrastructure/db/PrismaMoodRepository'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const moodRepo = new PrismaMoodRepository()

// GET /api/moods - List all moods
app.get('/api/moods', async (req, res) => {
  try {
    const moods = await moodRepo.list()
    res.json(moods)
  } catch (error) {
    console.error('Error listing moods:', error)
    res.status(500).json({ error: 'Failed to list moods' })
  }
})

// POST /api/moods - Create a mood
app.post('/api/moods', async (req, res) => {
  try {
    const mood = await moodRepo.save(req.body)
    res.json(mood)
  } catch (error) {
    console.error('Error creating mood:', error)
    res.status(500).json({ error: 'Failed to create mood' })
  }
})

// DELETE /api/moods - Clear all moods
app.delete('/api/moods', async (req, res) => {
  try {
    await moodRepo.clear()
    res.json({ success: true })
  } catch (error) {
    console.error('Error clearing moods:', error)
    res.status(500).json({ error: 'Failed to clear moods' })
  }
})

app.listen(port, () => {
  console.log(`🚀 API Server running on http://localhost:${port}`)
})
