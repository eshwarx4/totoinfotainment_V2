import React, { createContext, useContext } from 'react';
import { useGameState } from './useGameState';

type GameContextType = ReturnType<typeof useGameState>;

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const gameState = useGameState();
  return (
    <GameContext.Provider value={gameState}>{children}</GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
