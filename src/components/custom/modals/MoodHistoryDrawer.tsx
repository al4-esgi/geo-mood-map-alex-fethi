import { History, X } from 'lucide-react'
import { Button } from '../../ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../../ui/drawer'

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

interface MoodHistoryDrawerProps {
  entries: Array<MoodEntry>
  onMoodClick?: (entry: MoodEntry) => void
}

export function MoodHistoryDrawer({
  entries,
  onMoodClick,
}: MoodHistoryDrawerProps) {
  const sortedEntries = [...entries].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )

  const getMoodEmoji = (rating: number) => {
    if (rating >= 5) return '😄'
    if (rating >= 4) return '🙂'
    if (rating >= 3) return '😐'
    if (rating >= 2) return '😕'
    return '😢'
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="fixed top-4 right-4 z-1000 bg-white shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Voir l'historique"
        >
          <History className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>Historique des moods</DrawerTitle>
              <DrawerDescription>
                {entries.length} mood{entries.length > 1 ? 's' : ''} enregistré
                {entries.length > 1 ? 's' : ''}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto flex-1 p-4">
          {sortedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="text-6xl mb-4">😊</div>
              <h3 className="text-lg font-semibold mb-2">
                Aucun mood pour le moment
              </h3>
              <p className="text-sm text-muted-foreground">
                Commencez à enregistrer vos moods pour les voir apparaître ici !
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => onMoodClick?.(entry)}
                  className={`rounded-lg border bg-card p-4 shadow-sm transition-all ${
                    onMoodClick
                      ? 'cursor-pointer hover:shadow-md hover:border-primary'
                      : ''
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    {/* Emoji & Rating */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="text-4xl">
                        {getMoodEmoji(entry.rating)}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">
                        {entry.rating}/5
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-semibold text-sm">
                            {entry.placeName || 'Lieu inconnu'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entry.createdAt.toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            à{' '}
                            {entry.createdAt.toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-primary">
                          Score: {entry.score}
                        </div>
                      </div>

                      {/* Weather */}
                      {entry.weatherSummary && (
                        <div className="flex items-center gap-2 mb-2">
                          {entry.weatherIcon && (
                            <img
                              src={entry.weatherIcon}
                              alt="weather"
                              className="h-5 w-5"
                            />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {entry.weatherSummary}
                          </span>
                        </div>
                      )}

                      {/* Text */}
                      <p className="text-sm line-clamp-2 mb-2">{entry.text}</p>

                      {/* Image */}
                      {entry.imageUrl && (
                        <img
                          src={entry.imageUrl}
                          alt="mood"
                          className="w-full h-24 object-cover rounded border mt-2"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
