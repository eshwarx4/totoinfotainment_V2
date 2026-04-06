import { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';

interface CoinPopupProps {
  amount: number;
  onDone?: () => void;
}

export function CoinPopup({ amount, onDone }: CoinPopupProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-coin-pop pointer-events-none">
      <div className="flex items-center gap-1.5 bg-yellow-400 text-yellow-900 font-bold px-4 py-2 rounded-full shadow-lg text-lg">
        <Coins className="h-5 w-5" />
        +{amount}
      </div>
    </div>
  );
}
