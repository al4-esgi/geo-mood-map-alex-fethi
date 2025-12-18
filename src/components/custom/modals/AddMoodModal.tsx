import { useState } from 'react'
import CameraCapture from '../../../presentation/CameraCapture'
import { Button } from '../../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'

interface AddMoodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    text: string
    rating: number
    imageFileDataUrl?: string
  }) => Promise<void>
  isLoading?: boolean
  coords: { lat: number; lon: number }
}

const moodEmojis = [
  { rating: 1, emoji: '😢', label: 'Très mauvais' },
  { rating: 2, emoji: '😕', label: 'Mauvais' },
  { rating: 3, emoji: '😐', label: 'Neutre' },
  { rating: 4, emoji: '🙂', label: 'Bon' },
  { rating: 5, emoji: '😄', label: 'Excellent' },
]

export function AddMoodModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  coords,
}: AddMoodModalProps) {
  const [text, setText] = useState('')
  const [rating, setRating] = useState(3)
  const [imageFileDataUrl, setImageFileDataUrl] = useState<string | undefined>(
    undefined,
  )
  const [cameraReset, setCameraReset] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({ text, rating, imageFileDataUrl })

    // Reset form
    setText('')
    setRating(3)
    setImageFileDataUrl(undefined)
    setCameraReset((n) => n + 1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un mood</DialogTitle>
          <DialogDescription>
            Partagez votre humeur à cet endroit : {coords.lat.toFixed(4)},{' '}
            {coords.lon.toFixed(4)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Rating */}
          <div className="space-y-3">
            <Label>Comment vous sentez-vous ?</Label>
            <div className="flex justify-between gap-2">
              {moodEmojis.map((mood) => (
                <button
                  key={mood.rating}
                  type="button"
                  onClick={() => setRating(mood.rating)}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                    rating === mood.rating
                      ? 'border-blue-600 bg-blue-50 scale-110'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  title={mood.label}
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="text-xs text-slate-600">{mood.rating}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood Text */}
          <div className="space-y-2">
            <Label htmlFor="mood-text">Décrivez votre mood</Label>
            <Textarea
              id="mood-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Je me sens..."
              rows={4}
              required
              className="resize-none"
            />
          </div>

          {/* Camera Capture */}
          <div className="space-y-2">
            <Label htmlFor="mood-image-capture">Photo (optionnel)</Label>
            <CameraCapture
              resetSignal={cameraReset}
              onCapture={(dataUrl) => {
                setImageFileDataUrl(dataUrl)
              }}
              onClear={() => setImageFileDataUrl(undefined)}
            />
            {imageFileDataUrl && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                Photo capturée avec succès
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-custom"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
