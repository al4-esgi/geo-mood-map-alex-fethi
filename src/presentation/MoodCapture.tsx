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

type MoodCaptureProps = {
  initialCoords?: { lat: number; lon: number };
};

export function MoodCapture({ initialCoords = defaultCoords }: MoodCaptureProps) {
  const store = useMemo(() => createInMemoryMoodStore(), [])
  const [text, setText] = useState('')
  const [rating, setRating] = useState(3)
  const [imageUrl, setImageUrl] = useState('')
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [coords, setCoords] = useState<{ lat: number; lon: number }>(initialCoords)
  const lastError = useRef<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('saving')
    lastError.current = null
    try {
      const place = await getPlaceByCoords(coords)
      const weather = await getWeatherByCoords(coords)
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

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      lastError.current = 'Geolocation not supported'
      setStatus('error')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setStatus('idle')
      },
      (err) => {
        lastError.current = err.message
        setStatus('error')
      },
    )
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="mood-lat" className="block font-medium">
              Latitude
            </label>
            <input
              id="mood-lat"
              type="number"
              step="0.0001"
              value={coords.lat}
              onChange={(e) => setCoords((c) => ({ ...c, lat: Number(e.target.value) }))}
              className="w-full rounded border p-2"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="mood-lon" className="block font-medium">
              Longitude
            </label>
            <input
              id="mood-lon"
              type="number"
              step="0.0001"
              value={coords.lon}
              onChange={(e) => setCoords((c) => ({ ...c, lon: Number(e.target.value) }))}
              className="w-full rounded border p-2"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="rounded border px-3 py-2 hover:bg-slate-100"
            disabled={status === 'saving'}
          >
            Use my location
          </button>
          <span className="text-sm text-slate-600">
            Using {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
          </span>
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

