import { Camera, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Props = {
  onCapture: (dataUrl?: string) => void
  resetSignal?: number
  onClear?: () => void
}

export function CameraCapture({ onCapture, resetSignal, onClear }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [active, setActive] = useState(false)
  const [captured, setCaptured] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resolution, setResolution] = useState<string | null>(null)

  useEffect(() => {
    if (!active) return

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Camera error')
        setActive(false)
      }
    }
    void start()

    return () => {
      stopCamera()
    }
  }, [active])

  useEffect(() => {
    // Reset preview and stop camera when parent requests
    stopCamera()
    setCaptured(null)
    setActive(false)
    setError(null)
  }, [resetSignal])

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  function captureFrame() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/png')
    setCaptured(dataUrl)
    setResolution(`${canvas.width}×${canvas.height}`)
    onCapture(dataUrl)
    stopCamera()
    setActive(false)
  }

  function handleStart() {
    setError(null)
    setCaptured(null)
    onCapture(undefined)
    setActive(true)
  }

  function handleRetake() {
    handleStart()
  }

  function handleClear() {
    stopCamera()
    setCaptured(null)
    setActive(false)
    setError(null)
    setResolution(null)
    onCapture(undefined)
    onClear?.()
  }

  return (
    <div className="space-y-4 rounded-2xl border bg-white/80 p-4 shadow-lg ring-1 ring-slate-200">
      <div
        className={`flex items-center justify-between ${!active && !captured && !error ? 'm-0!' : ''}`}
      >
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={handleStart}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-custom text-white shadow-inner">
            <Camera className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Capture photo
            </p>
            <p className="text-xs text-slate-600">
              Ajoute une image à ton mood
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {resolution && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              {resolution}
            </span>
          )}
          <span
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
              active
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                : captured
                  ? 'bg-blue-50 text-blue-700 ring-blue-200'
                  : 'bg-slate-100 text-slate-700 ring-slate-200'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {active
              ? 'Caméra active'
              : captured
                ? 'Capture prête'
                : 'En attente'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {captured && (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
            onClick={handleRetake}
          >
            <RefreshCw className="h-4 w-4" />
            Reprendre
          </button>
        )}
        {(captured || active) && (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-200"
            onClick={handleClear}
          >
            <Trash2 className="h-4 w-4" />
            Effacer
          </button>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      {active && !captured && (
        <div className="space-y-3 rounded-xl border bg-slate-950/70 p-3 shadow-inner ring-1 ring-slate-800">
          <div className="relative overflow-hidden rounded-lg ring-1 ring-white/10">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/5 via-transparent to-white/5" />
            <video
              ref={videoRef}
              className="aspect-4/3 w-full rounded-lg object-cover"
              playsInline
              muted
              aria-label="camera-preview"
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-200">
            <span>Cadre ton sujet puis capture l’image.</span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
              onClick={captureFrame}
            >
              <Camera className="h-4 w-4" />
              Capturer
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {captured && (
        <div className="space-y-2 rounded-xl border bg-white/70 p-3 shadow-inner ring-1 ring-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Prévisualisation</span>
            {resolution && (
              <span className="font-semibold text-slate-700">{resolution}</span>
            )}
          </div>
          <div className="overflow-hidden rounded-lg ring-1 ring-slate-100 shadow">
            <img
              src={captured}
              alt="Captured preview"
              className="w-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CameraCapture
