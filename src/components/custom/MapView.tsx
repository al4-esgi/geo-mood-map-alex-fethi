import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { MoodDetailsCard } from './_utils/MoodDetailsCard'
import type { Marker as LeafletMarker } from 'leaflet'

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
      background: linear-gradient(to top left, #db2777, #ef4444, #f97316);;
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
  selectedMoodId?: string
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])

  return null
}

export function MapView({ entries, center, zoom = 13, selectedMoodId }: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false)
  const markerRefs = useRef<Map<string, LeafletMarker>>(new Map())
  const clusterGroupRef = useRef<any>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!selectedMoodId) return
    const marker = markerRefs.current.get(selectedMoodId)
    if (!marker) return

    const cluster = clusterGroupRef.current
    if (cluster?.zoomToShowLayer) {
      cluster.zoomToShowLayer(marker, () => marker.openPopup())
    } else {
      marker.openPopup()
    }
  }, [selectedMoodId])

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
      attributionControl={false}
    >
      <MapUpdater center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.png"
      />
      <MarkerClusterGroup
        ref={clusterGroupRef}
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
        maxClusterRadius={60}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        className='bg-gradient-custom'
      >
        {entries.map((entry) => {
          const coords: [number, number] = entry.coords || center
          return (
            <Marker
              key={entry.id}
              position={coords}
              icon={createMoodIcon(entry.rating)}
              ref={(marker) => {
                if (!marker) {
                  markerRefs.current.delete(entry.id)
                  return
                }
                markerRefs.current.set(entry.id, marker)
                if (selectedMoodId === entry.id) {
                  marker.openPopup()
                }
              }}
            >
              <Popup maxWidth={520} className="m-4!">
                <MoodDetailsCard entry={entry} variant="popup" />
              </Popup>
            </Marker>
          )
        })}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
