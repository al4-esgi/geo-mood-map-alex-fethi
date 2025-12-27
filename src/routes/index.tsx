import { createFileRoute } from '@tanstack/react-router'

import MoodMapPage from '../presentation/MoodMapPage'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return <MoodMapPage persistence="api" />
}
