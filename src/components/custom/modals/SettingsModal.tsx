import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog'
import { Button } from '../../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'

interface SettingsModalProps {
  moodCount: number
  onClearMoods: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({
  moodCount,
  onClearMoods,
  open,
  onOpenChange,
}: SettingsModalProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const handleDeleteConfirm = () => {
    onClearMoods()
    setShowDeleteAlert(false)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Paramètres</DialogTitle>
            <DialogDescription>
              Gérez vos préférences et vos données
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Moods Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Données</h3>

              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Moods enregistrés</div>
                    <div className="text-xs text-muted-foreground">
                      {moodCount} mood{moodCount > 1 ? 's' : ''} dans votre
                      historique
                    </div>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowDeleteAlert(true)}
                  disabled={moodCount === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer tous les moods
                </Button>
              </div>
            </div>

            {/* App Info Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">À propos</h3>
              <div className="rounded-lg border p-4 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">GeoMood Map</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Cartographiez vos émotions dans le monde
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous vos moods enregistrés (
              {moodCount}) seront définitivement supprimés de votre appareil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer tout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
