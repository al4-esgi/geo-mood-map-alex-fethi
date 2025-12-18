import { useStore } from '@tanstack/react-store'
import { History, LocateFixed, Settings, SmilePlus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { MapView } from '../components/custom/MapView'
import { FloatingButton } from '../components/custom/buttons/FloatingButton'
import { AddMoodModal } from '../components/custom/modals/AddMoodModal'
import { MoodHistoryDrawer } from '../components/custom/modals/MoodHistoryDrawer'
import { SettingsModal } from '../components/custom/modals/SettingsModal'
import { computeMoodScore } from '../mood/moodScore'
import { createInMemoryMoodStore } from '../persistence/inMemoryMoodStore'
import { createLocalStorageMoodStore } from '../persistence/localStorageMoodStore'
import { getPlaceByCoords } from '../services/geolocationService'
import { analyzeText } from '../services/textAnalysisService'
import { analyzeImage } from '../services/visionService'
import { getWeatherByCoords } from '../services/weatherService'
import {
  clearMoodStore,
  loadMoods,
  moodStore,
  saveMood,
} from '../state/moodStore'
import type { MoodPersistence } from '../state/moodStore'

const defaultCoords = { lat: 48.8566, lon: 2.3522 } // Paris as deterministic fallback

function weatherLabel(weather: { condition: string; temperature: number }) {
  return `${weather.condition} ${weather.temperature}°C`
}

type MoodMapPageProps = {
  initialCoords?: { lat: number; lon: number }
  persistence?: MoodPersistence
  storageKey?: string
}

export function MoodMapPage({
  initialCoords = defaultCoords,
  persistence = 'localStorage',
  storageKey,
}: MoodMapPageProps) {
  useMemo(() => {
    // Ensure persistence stores are initialized for each mode
    if (persistence === 'localStorage')
      return createLocalStorageMoodStore(storageKey)
    return createInMemoryMoodStore()
  }, [persistence, storageKey])

  const entries = useStore(moodStore)
  const hydratedRef = useRef(false)

  const [coords, setCoords] = useState<{ lat: number; lon: number }>(
    initialCoords,
  )
  const [locationStatus, setLocationStatus] = useState<
    'pending' | 'ready' | 'failed'
  >('pending')
  const [isAddMoodOpen, setIsAddMoodOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

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
      showToast('Géolocalisation non supportée', 'error')
      return
    }
    setLocationStatus('pending')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setLocationStatus('ready')
      },
      () => {
        setLocationStatus('failed')
        showToast('Impossible de récupérer votre position', 'error')
      },
    )
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }

  function clearMoods() {
    clearMoodStore(persistence, storageKey)
    showToast('Tous les moods ont été supprimés', 'success')
  }

  async function handleAddMood(data: {
    text: string
    rating: number
    imageFileDataUrl?: string
  }) {
    setIsLoading(true)
    try {
      const place = await getPlaceByCoords(coords)
      const weather = await getWeatherByCoords(coords)
      const textSentiment = data.text ? await analyzeText(data.text) : undefined
      const vision = data.imageFileDataUrl
        ? await analyzeImage(data.imageFileDataUrl)
        : undefined
      const score = computeMoodScore({
        rating: data.rating,
        text: data.text,
        weather,
        textSentimentScore: textSentiment?.score,
        imageSentimentScore: vision?.score,
      })

      await saveMood(
        persistence,
        {
          text: data.text,
          rating: data.rating,
          score,
          placeName: place.name,
          weatherSummary: weatherLabel(weather),
          weatherIcon: weather.icon,
          imageUrl: data.imageFileDataUrl || undefined,
          coords: [coords.lat, coords.lon],
        },
        storageKey,
      )

      setIsAddMoodOpen(false)
      showToast('Mood enregistré avec succès !', 'success')
    } catch (err) {
      console.error('Error saving mood:', err)
      showToast(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement",
        'error',
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Convert entries to include coords as tuples
  const entriesWithCoords = entries.map((entry) => ({
    ...entry,
    coords:
      (entry as any).coords || ([coords.lat, coords.lon] as [number, number]),
  }))

  // Handle mood click from drawer - center map on the mood's location
  const handleMoodClick = (entry: any) => {
    if (entry.coords) {
      setCoords({ lat: entry.coords[0], lon: entry.coords[1] })
      setSelectedMoodId(entry.id)
      setIsHistoryOpen(false)
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-1200 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-in slide-in-from-top ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
      {/* Map */}
      <MapView
        entries={entriesWithCoords}
        center={[coords.lat, coords.lon]}
        zoom={15}
        selectedMoodId={selectedMoodId || undefined}
      />

      {/* Floating Buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col-reverse items-center gap-3 transform md:left-1/2 md:bottom-6 md:right-auto md:-translate-x-1/2 md:flex-row md:items-center md:gap-4">
        <FloatingButton
          icon={SmilePlus}
          onClick={() => setIsAddMoodOpen(true)}
          label="Ajouter un mood"
          variant="gradient"
          size="lg"
          strategy="inline"
        />

        <FloatingButton
          icon={LocateFixed}
          onClick={requestLocation}
          label="Centrer sur ma position"
          variant="black"
          size="lg"
          strategy="inline"
          className={locationStatus === 'pending' ? 'animate-pulse' : ''}
        />

        <FloatingButton
          icon={History}
          onClick={() => setIsHistoryOpen(true)}
          label="Voir l'historique"
          variant="black"
          size="lg"
          strategy="inline"
        />

        <FloatingButton
          icon={Settings}
          onClick={() => setIsSettingsOpen(true)}
          label="Paramètres"
          variant="black"
          size="lg"
          strategy="inline"
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        moodCount={entries.length}
        onClearMoods={clearMoods}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />

      {/* History Drawer */}
      <MoodHistoryDrawer
        entries={entriesWithCoords}
        onMoodClick={handleMoodClick}
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />

      {/* Add Mood Modal */}
      <AddMoodModal
        open={isAddMoodOpen}
        onOpenChange={setIsAddMoodOpen}
        onSubmit={handleAddMood}
        isLoading={isLoading}
        coords={coords}
      />
    </div>
  )
}

export default MoodMapPage
