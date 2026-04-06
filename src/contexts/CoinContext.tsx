import React, { createContext, useContext } from 'react';
import { useCoinSystem } from '@/hooks/useCoinSystem';

type CoinContextType = ReturnType<typeof useCoinSystem>;

const CoinContext = createContext<CoinContextType | null>(null);

export function CoinProvider({ children }: { children: React.ReactNode }) {
  const coinSystem = useCoinSystem();
  return (
    <CoinContext.Provider value={coinSystem}>{children}</CoinContext.Provider>
  );
}

export function useCoins(): CoinContextType {
  const ctx = useContext(CoinContext);
  if (!ctx) throw new Error('useCoins must be used within a CoinProvider');
  return ctx;
}
