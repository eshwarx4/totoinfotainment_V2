import { useCoins } from '@/contexts/CoinContext';
import { CurrencyPair } from '@/components/ui/CurrencyDisplay';
import { useGame } from '@/state/GameContext';

export function CoinDisplay() {
  const { coins } = useCoins();
  const game = useGame();
  const total = game.getTotalProgress();

  return (
    <CurrencyPair
      coins={coins}
      diamonds={total.totalDiamonds}
    />
  );
}
