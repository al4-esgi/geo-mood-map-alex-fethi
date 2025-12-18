import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '@tanstack/react-store'

import { computeMoodScore } from '../mood/moodScore'
import { createInMemoryMoodStore } from '../persistence/inMemoryMoodStore'
import { createLocalStorageMoodStore } from '../persistence/localStorageMoodStore'
import { getPlaceByCoords } from '../services/geolocationService'
import { getWeatherByCoords } from '../services/weatherService'
import {
  
  clearMoodStore,
  loadMoods,
  moodStore,
  saveMood
} from '../state/moodStore'
import { analyzeText } from '../services/textAnalysisService'
import { analyzeImage } from '../services/visionService'
import CameraCapture from './CameraCapture'
import type {MoodPersistence} from '../state/moodStore';

const defaultCoords = { lat: 48.8566, lon: 2.3522 } // Paris as deterministic fallback

function weatherLabel(weather: { condition: string; temperature: number }) {
  return `${weather.condition} ${weather.temperature}°C`
}

type MoodCaptureProps = {
  initialCoords?: { lat: number; lon: number }
  persistence?: MoodPersistence
  storageKey?: string
}

export function MoodCapture({
  initialCoords = defaultCoords,
  persistence = 'localStorage',
  storageKey,
}: MoodCaptureProps) {
  useMemo(() => {
    // Ensure persistence stores are initialized for each mode
    if (persistence === 'localStorage')
      return createLocalStorageMoodStore(storageKey)
    return createInMemoryMoodStore()
  }, [persistence, storageKey])
  const entries = useStore(moodStore)
  const hydratedRef = useRef(false)

  const [text, setText] = useState('')
  const [rating, setRating] = useState(3)
  const [imageUrl, setImageUrl] = useState('')
  const [imageFileDataUrl, setImageFileDataUrl] = useState<string | undefined>(
    undefined,
  )
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle',
  )
  const [coords, setCoords] = useState<{ lat: number; lon: number }>(
    initialCoords,
  )
  const [locationStatus, setLocationStatus] = useState<
    'pending' | 'ready' | 'failed'
  >('pending')
  const [toast, setToast] = useState<string | null>(null)
  const [cameraReset, setCameraReset] = useState(0)
  const lastError = useRef<string | null>(null)

  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    loadMoods(persistence, storageKey).catch(() => {
      /* ignore hydration errors */
    })
  }, [persistence, storageKey])

  useEffect(() => {
    requestLocation()
  }, [])

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('failed')
      setToast('Geolocation not supported')
      return
    }
    setLocationStatus('pending')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setLocationStatus('ready')
      },
      (err) => {
        lastError.current = err.message
        setLocationStatus('failed')
        setToast('Failed to fetch location')
        window.setTimeout(() => setToast(null), 3000)
      },
    )
  }

  function clearMoods() {
    clearMoodStore(persistence, storageKey)
    setToast('Recent moods cleared')
    window.setTimeout(() => setToast(null), 2000)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('saving')
    lastError.current = null
    try {
      const place = await getPlaceByCoords(coords)
      const weather = await getWeatherByCoords(coords)
      const textSentiment = text ? await analyzeText(text) : undefined
      const vision = imageFileDataUrl
        ? await analyzeImage(imageFileDataUrl)
        : undefined
      const score = computeMoodScore({
        rating,
        text,
        weather,
        textSentimentScore: textSentiment?.score,
        imageSentimentScore: vision?.score,
      })

      await saveMood(
        persistence,
        {
          text,
          rating,
          score,
          placeName: place.name,
          weatherSummary: weatherLabel(weather),
          weatherIcon: weather.icon,
          imageUrl: imageFileDataUrl || imageUrl || undefined,
        },
        storageKey,
      )
      setStatus('saved')
      setText('')
      setImageUrl('')
      setImageFileDataUrl(undefined)
      setCameraReset((n) => n + 1)
    } catch (err) {
      lastError.current = err instanceof Error ? err.message : 'Unknown error'
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">GeoMood Map — Quick Capture</h1>
      {toast && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white space-y-4 border rounded-md p-4"
      >
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
          <label htmlFor="mood-image-capture" className="block font-medium">
            Capture photo (uses device camera if available)
          </label>
          <CameraCapture
            resetSignal={cameraReset}
            onCapture={(dataUrl) => {
              setImageFileDataUrl(dataUrl)
              if (!dataUrl) {
                setImageUrl('')
              }
            }}
            onClear={() => setImageFileDataUrl(undefined)}
          />
          {imageFileDataUrl && (
            <div className="flex flex-col">
              <span className="text-green-600">Photo ready</span>
              <span className="text-slate-700">
                Captured photo stored as data URL (persists in
                store/localStorage)
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-700 flex items-center gap-2">
            Location: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
            {locationStatus === 'pending' && (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-slate-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  role="status"
                  aria-label="Locating"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span>(detecting...)</span>
              </>
            )}
            {locationStatus === 'failed' && <span>(using fallback)</span>}
          </span>
          {locationStatus !== 'pending' && (
            <button
              type="button"
              onClick={requestLocation}
              className="rounded border px-3 py-2 hover:bg-slate-100"
              disabled={status === 'saving'}
            >
              Refresh location
            </button>
          )}
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
          {status === 'error' && (
            <span role="status">Error: {lastError.current}</span>
          )}
          <button
            type="button"
            onClick={clearMoods}
            className="rounded border px-3 py-2 hover:bg-slate-100"
            disabled={status === 'saving'}
          >
            Clear moods
          </button>
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
                    <div className="font-semibold text-slate-900">
                      {entry.placeName}
                    </div>
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
                    {entry.weatherSummary && (
                      <span>{entry.weatherSummary}</span>
                    )}
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
