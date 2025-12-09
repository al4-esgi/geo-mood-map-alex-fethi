import { useMemo, useRef, useState } from 'react'

import { computeMoodScore } from '../mood/moodScore'
import { createInMemoryMoodStore, type MoodEntry } from '../persistence/inMemoryMoodStore'
import { formatMoodSummary } from './formatter'
import { getPlaceByCoords } from '../services/geolocationService'
import { getWeatherByCoords } from '../services/weatherService'

const defaultCoords = { lat: 48.8566, lon: 2.3522 } // Paris as deterministic fallback

function weatherLabel(weather: { condition: string; temperature: number }) {
  return `${weather.condition} ${weather.temperature}°C`
}

export function MoodCapture() {
  const store = useMemo(() => createInMemoryMoodStore(), [])
  const [text, setText] = useState('')
  const [rating, setRating] = useState(3)
  const [imageUrl, setImageUrl] = useState('')
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const lastError = useRef<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('saving')
    lastError.current = null
    try {
      const place = await getPlaceByCoords(defaultCoords)
      const weather = await getWeatherByCoords(defaultCoords)
      const score = computeMoodScore({
        rating,
        text,
        weather,
      })

      await store.save({
        text,
        rating,
        score,
        placeName: place.name,
        weatherSummary: weatherLabel(weather),
        imageUrl: imageUrl || undefined,
      })
      const list = await store.list()
      setEntries(list)
      setStatus('saved')
      setText('')
      setImageUrl('')
    } catch (err) {
      lastError.current = err instanceof Error ? err.message : 'Unknown error'
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">GeoMood Map — Quick Capture</h1>
      <form onSubmit={handleSubmit} className="space-y-4 border rounded-md p-4">
        <div className="space-y-1">
          <label htmlFor="mood-text" className="block font-medium">
            Mood text
          </label>
          <textarea
            id="mood-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded border p-2"
            rows={3}
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="mood-rating" className="block font-medium">
            Rating (1–5)
          </label>
          <input
            id="mood-rating"
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-24 rounded border p-2"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="mood-image" className="block font-medium">
            Image URL (optional)
          </label>
          <input
            id="mood-image"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            disabled={status === 'saving'}
          >
            {status === 'saving' ? 'Saving…' : 'Save mood'}
          </button>
          {status === 'saved' && <span role="status">Saved</span>}
          {status === 'error' && <span role="status">Error: {lastError.current}</span>}
        </div>
      </form>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Recent moods</h2>
        {entries.length === 0 ? (
          <p>No entries yet.</p>
        ) : (
          <ul className="space-y-2" aria-label="mood-list">
            {entries.map((entry) => (
              <li key={entry.id} className="rounded border p-2">
                {formatMoodSummary(entry)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default MoodCapture

