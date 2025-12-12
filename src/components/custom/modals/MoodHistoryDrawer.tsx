import { X } from 'lucide-react'
import { Button } from '../../ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '../../ui/drawer'
import { useResponsive } from '@/lib/useResponsive'
import { MoodDetailsCard } from '../_utils/MoodDetailsCard'

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
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MoodHistoryDrawer({
  entries,
  onMoodClick,
  open,
  onOpenChange,
}: MoodHistoryDrawerProps) {
  const { isMobile } = useResponsive()
  const sortedEntries = [...entries].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )
  const total = sortedEntries.length
  const averageRating =
    total === 0
      ? 0
      : Math.round(
        (sortedEntries.reduce((acc, entry) => acc + entry.rating, 0) / total) *
        10,
      ) / 10
  const averageScore =
    total === 0
      ? 0
      : Math.round(
        (sortedEntries.reduce((acc, entry) => acc + entry.score, 0) / total) *
        10,
      ) / 10

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={isMobile ? 'bottom' : 'right'}>
      <DrawerContent className={`h-[${isMobile ? '85vh' : 'auto'}]`}>
        <DrawerHeader className="border-b bg-gradient-custom/10">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <DrawerTitle>Historique des moods</DrawerTitle>
              <DrawerDescription>
                {entries.length} mood{entries.length > 1 ? 's' : ''} enregistré
                {entries.length > 1 ? 's' : ''}
              </DrawerDescription>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-gradient-custom px-3 py-1 font-semibold text-white shadow-sm">
                  Note moyenne {averageRating}/5
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 ring-1 ring-slate-200">
                  Score moyen {averageScore}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  Dernier: {sortedEntries[0]?.createdAt.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }) || '--'}
                </span>
              </div>
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
                  className={`group overflow-hidden rounded-xl border bg-white/90 p-0 shadow-sm transition-all duration-200 ${onMoodClick
                    ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/60'
                    : ''
                    }`}
                >
                  <MoodDetailsCard entry={entry} variant="list" className="p-4" />
                </div>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
