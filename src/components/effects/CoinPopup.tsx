import { useEffect, useState } from 'react';
import { Coins, Gem } from 'lucide-react';

interface CoinPopupProps {
  amount: number;
  type?: 'coin' | 'diamond';
  onDone?: () => void;
}

export function CoinPopup({ amount, type = 'coin', onDone }: CoinPopupProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  const isCoin = type === 'coin';

  return (
    <div className="fixed top-20 right-4 z-50 animate-coin-pop pointer-events-none">
      <div className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-full shadow-lg text-base ${isCoin
          ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-amber-950'
          : 'bg-gradient-to-r from-indigo-500 to-indigo-400 text-white'
        }`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCoin
            ? 'bg-amber-600/30'
            : 'bg-indigo-600/30'
          }`}>
          {isCoin ? <Coins className="h-4 w-4" /> : <Gem className="h-4 w-4" />}
        </div>
        +{amount}
      </div>
    </div>
  );
}
