import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coins, Lock } from 'lucide-react';
import type { MapZone } from '@/config/mapZones';

interface UnlockDialogProps {
  zone: MapZone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCoins: number;
  onUnlock: () => void;
}

export function UnlockDialog({
  zone,
  open,
  onOpenChange,
  currentCoins,
  onUnlock,
}: UnlockDialogProps) {
  if (!zone) return null;

  const canAfford = currentCoins >= zone.cost;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5" />
            Unlock {zone.name}?
          </DialogTitle>
          <DialogDescription>{zone.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="text-5xl">{zone.icon}</div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span>{zone.cost} coins</span>
          </div>
          <p className="text-sm text-muted-foreground">
            You have{' '}
            <span className={canAfford ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
              {currentCoins} coins
            </span>
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onUnlock} disabled={!canAfford}>
            {canAfford ? 'Unlock' : 'Not enough coins'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
