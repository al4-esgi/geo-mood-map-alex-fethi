import {
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { getMoodEmoji } from '@/lib/moodUtils'

type MoodDetails = {
  id: string
  text?: string
  rating: number
  score: number
  placeName?: string
  weatherSummary?: string
  weatherIcon?: string
  imageUrl?: string
  createdAt: Date
  coords?: [number, number]
}

type MoodDetailsCardProps = {
  entry: MoodDetails
  variant?: 'popup' | 'list'
  className?: string
}

const variantClasses = {
  popup: 'w-[min(440px,88vw)] space-y-4 rounded-2xl bg-white/90 py-3',
  list: 'space-y-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200 shadow-sm w-full',
}

function resolveWeatherIcon(summary?: string) {
  if (!summary) return null
  const lower = summary.toLowerCase()
  if (lower.includes('orage') || lower.includes('thunder'))
    return { Icon: CloudLightning, color: 'text-amber-500' }
  if (lower.includes('neige') || lower.includes('snow'))
    return { Icon: CloudSnow, color: 'text-blue-500' }
  if (lower.includes('pluie') || lower.includes('rain'))
    return { Icon: CloudRain, color: 'text-blue-600' }
  if (lower.includes('nuage') || lower.includes('cloud'))
    return { Icon: CloudSun, color: 'text-slate-600' }
  if (
    lower.includes('soleil') ||
    lower.includes('clear') ||
    lower.includes('sun')
  )
    return { Icon: Sun, color: 'text-amber-400' }
  return { Icon: Cloud, color: 'text-slate-600' }
}

export function MoodDetailsCard({
  entry,
  variant = 'popup',
  className,
}: MoodDetailsCardProps) {
  const weatherIcon = resolveWeatherIcon(entry.weatherSummary)

  return (
    <div className={cn(variantClasses[variant], className)}>
      <div className="flex flex-col gap-3 rounded-xl bg-gradient-custom p-3 text-white shadow-inner">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-lg font-semibold shadow-sm">
            Score {entry.score}
          </span>
          {entry.weatherSummary && (
            <span className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold shadow-sm">
              {weatherIcon && (
                <weatherIcon.Icon className="bg-transparent text-white/95" />
              )}
              <span className="text-white/95">{entry.weatherSummary}</span>
            </span>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-base font-semibold tracking-tight">
            {entry.placeName || 'Lieu inconnu'}
          </div>
          <div className="text-xs text-white/80">
            {entry.createdAt.toLocaleString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
        <div className="rounded-lg border col-span-2 border-slate-100 bg-slate-50 px-3 py-2 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Humeur
          </div>
          <div className="text-slate-800">
            {entry.text || 'Aucune note ajoutée.'}
          </div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Note
          </div>
          <div className="text-slate-800">
            {getMoodEmoji(entry.rating)} {entry.rating}/5
          </div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Coordonnées
          </div>
          <div className="text-slate-800">
            {entry.coords
              ? `${entry.coords[0].toFixed(4)}, ${entry.coords[1].toFixed(4)}`
              : 'Position inconnue'}
          </div>
        </div>
      </div>

      {entry.imageUrl && (
        <div className="overflow-hidden rounded-xl ring-1 ring-slate-100 shadow-lg">
          <img
            src={entry.imageUrl}
            alt="mood"
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </div>
  )
}
