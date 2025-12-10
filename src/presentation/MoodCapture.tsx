import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '@tanstack/react-store'

import { computeMoodScore } from '../mood/moodScore'
import { createInMemoryMoodStore } from '../persistence/inMemoryMoodStore'
import { createLocalStorageMoodStore } from '../persistence/localStorageMoodStore'
import CameraCapture from './CameraCapture'
import { getPlaceByCoords } from '../services/geolocationService'
import { getWeatherByCoords } from '../services/weatherService'
import { loadMoods, moodStore, saveMood, type MoodPersistence } from '../state/moodStore'

const defaultCoords = { lat: 48.8566, lon: 2.3522 } // Paris as deterministic fallback

function weatherLabel(weather: { condition: string; temperature: number }) {
  return `${weather.condition} ${weather.temperature}°C`
}

type MoodCaptureProps = {
  initialCoords?: { lat: number; lon: number };
  persistence?: MoodPersistence;
  storageKey?: string;
};

export function MoodCapture({
  initialCoords = defaultCoords,
  persistence = 'localStorage',
  storageKey,
}: MoodCaptureProps) {
  useMemo(() => {
    // Ensure persistence stores are initialized for each mode
    if (persistence === 'localStorage') return createLocalStorageMoodStore(storageKey)
    return createInMemoryMoodStore()
  }, [persistence, storageKey])
  const entries = useStore(moodStore)
  const hydratedRef = useRef(false)

  const [text, setText] = useState('')
  const [rating, setRating] = useState(3)
  const [imageUrl, setImageUrl] = useState('')
  const [imageFileDataUrl, setImageFileDataUrl] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [coords, setCoords] = useState<{ lat: number; lon: number }>(initialCoords)
  const lastError = useRef<string | null>(null)

  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    loadMoods(persistence, storageKey).catch(() => {
      /* ignore hydration errors */
    })
  }, [persistence, storageKey])

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

      await saveMood(persistence, {
        text,
        rating,
        score,
        placeName: place.name,
        weatherSummary: weatherLabel(weather),
        weatherIcon: weather.icon,
        imageUrl: imageFileDataUrl || imageUrl || undefined,
      }, storageKey)
      setStatus('saved')
      setText('')
      setImageUrl('')
      setImageFileDataUrl(undefined)
    } catch (err) {
      lastError.current = err instanceof Error ? err.message : 'Unknown error'
      setStatus('error')
    }
  }

  function handleImageFileChange(file?: File) {
    if (!file) {
      setImageFileDataUrl(undefined)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImageFileDataUrl(typeof reader.result === 'string' ? reader.result : undefined)
    }
    reader.readAsDataURL(file)
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
        <div className="space-y-1">
          <label htmlFor="mood-image-capture" className="block font-medium">
            Capture photo (uses device camera if available)
          </label>
          <input
            id="mood-image-capture"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleImageFileChange(e.target.files?.[0])}
            className="w-full rounded border p-2"
          />
          {imageFileDataUrl && <span className="text-sm text-green-700">Photo ready</span>}
        </div>
        <div className="space-y-2">
          <div className="font-medium">Use device camera</div>
          <CameraCapture
            onCapture={(dataUrl) => {
              setImageFileDataUrl(dataUrl)
              if (!dataUrl) {
                setImageUrl('')
              }
            }}
          />
          {imageFileDataUrl && (
            <div className="text-sm text-slate-700">
              Captured photo stored as data URL (persists in store/localStorage)
            </div>
          )}
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
          <ul className="space-y-3" aria-label="mood-list">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded border p-3 shadow-sm bg-white flex gap-3 items-start"
              >
                {entry.imageUrl && (
                  <img
                    src={entry.imageUrl}
                    alt="mood"
                    className="h-16 w-16 rounded object-cover border"
                  />
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-slate-900">{entry.placeName}</div>
                    <div className="text-xs text-slate-500">
                      {entry.createdAt.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="font-medium">Score {entry.score}</span>
                    {entry.weatherIcon && (
                      <img
                        src={entry.weatherIcon}
                        alt={entry.weatherSummary ?? 'weather icon'}
                        className="h-6 w-6"
                      />
                    )}
                    {entry.weatherSummary && <span>{entry.weatherSummary}</span>}
                  </div>
                  <div className="text-sm text-slate-800">{entry.text}</div>

                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default MoodCapture

