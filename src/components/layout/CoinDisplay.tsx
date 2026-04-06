import { Coins } from 'lucide-react';
import { useCoins } from '@/contexts/CoinContext';

export function CoinDisplay() {
  const { coins } = useCoins();

  return (
    <div className="coin-badge flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1.5 shadow-sm">
      <Coins className="h-4 w-4 text-yellow-500" />
      <span className="font-bold text-sm text-yellow-800">{coins}</span>
    </div>
  );
}
