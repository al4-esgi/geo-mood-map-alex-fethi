import { useEffect, useRef, useState } from 'react'

type Props = {
  onCapture: (dataUrl?: string) => void
  resetSignal?: number
}

export function CameraCapture({ onCapture, resetSignal }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [active, setActive] = useState(false)
  const [captured, setCaptured] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!active) return

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
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

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {!active && !captured && (
          <button
            type="button"
            className="rounded border px-3 py-2 hover:bg-slate-100"
            onClick={handleStart}
          >
            Start camera
          </button>
        )}
        {captured && (
          <button
            type="button"
            className="rounded border px-3 py-2 hover:bg-slate-100"
            onClick={handleRetake}
          >
            Retake photo
          </button>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      {active && !captured && (
        <div className="space-y-2">
          <video
            ref={videoRef}
            className="w-full rounded border"
            playsInline
            muted
            aria-label="camera-preview"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
              onClick={captureFrame}
            >
              Take photo
            </button>
            <span className="text-sm text-slate-600">Captures save to store as data URL</span>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {captured && (
        <div className="space-y-2">
          <img
            src={captured}
            alt="Captured preview"
            className="w-full rounded border object-cover"
          />
        </div>
      )}
    </div>
  )
}

export default CameraCapture

