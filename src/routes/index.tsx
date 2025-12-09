import { createFileRoute } from '@tanstack/react-router'

import MoodCapture from '../presentation/MoodCapture'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <MoodCapture />
    </main>
  )
}
