import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'

// Fix for default marker icons in react-leaflet
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

// Custom mood marker icons with emoji based on rating (1-5)
function createMoodIcon(rating: number, emoji?: string): L.DivIcon {
  const color =
    rating >= 5
      ? '#22c55e'
      : rating >= 4
        ? '#84cc16'
        : rating >= 3
          ? '#eab308'
          : rating >= 2
            ? '#f97316'
            : '#ef4444'

  const displayEmoji =
    emoji ||
    (rating >= 5
      ? '😄'
      : rating >= 4
        ? '🙂'
        : rating >= 3
          ? '😐'
          : rating >= 2
            ? '😕'
            : '😢')

  return L.divIcon({
    className: 'custom-mood-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        ${displayEmoji}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })
}

interface MoodEntry {
  id: string
  text: string
  rating: number
  score: number
  placeName?: string
  weatherSummary?: string
  weatherIcon?: string
  imageUrl?: string
  createdAt: Date
  coords?: [number, number]
}

// Create cluster icon
function createClusterCustomIcon(cluster: any) {
  const count = cluster.getChildCount()
  return L.divIcon({
    html: `<div style="
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(50, 50, true),
  })
}

interface MapViewProps {
  entries: Array<MoodEntry>
  center: [number, number]
  zoom?: number
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])

  return null
}

export function MapView({ entries, center, zoom = 13 }: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-200">
        <div className="text-slate-600">Loading map...</div>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      zoomControl={false}
      style={{ background: '#cbd5e1' }}
    >
      <MapUpdater center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
        maxClusterRadius={60}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
      >
        {entries.map((entry) => {
          const coords: [number, number] = entry.coords || center
          return (
            <Marker
              key={entry.id}
              position={coords}
              icon={createMoodIcon(entry.rating)}
            >
              <Popup maxWidth={300}>
                <div className="space-y-2 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-slate-900">
                      {entry.placeName || 'Unknown location'}
                    </div>
                    <div className="text-xs text-slate-500">
                      Rating: {entry.rating}/5 • Score: {entry.score}
                    </div>
                  </div>
                  {entry.weatherSummary && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      {entry.weatherIcon && (
                        <img
                          src={entry.weatherIcon}
                          alt="weather"
                          className="h-6 w-6"
                        />
                      )}
                      <span>{entry.weatherSummary}</span>
                    </div>
                  )}
                  {entry.imageUrl && (
                    <img
                      src={entry.imageUrl}
                      alt="mood"
                      className="w-full h-32 object-cover rounded border"
                    />
                  )}
                  <div className="text-sm text-slate-800">{entry.text}</div>
                  <div className="text-xs text-slate-500">
                    {entry.createdAt.toLocaleString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
