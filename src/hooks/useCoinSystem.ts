import { useState, useEffect, useCallback } from 'react';
import {
  CoinState,
  COIN_REWARDS,
  STORAGE_KEY,
  DEFAULT_COIN_STATE,
} from '@/types/gamification';

function migrateV1Data(): CoinState | null {
  const oldGamification = localStorage.getItem('gamification');
  const oldLearnedWords = localStorage.getItem('learnedWords');
  const oldStreak = localStorage.getItem('streak');
  const oldStars = localStorage.getItem('totalStars');

  if (!oldGamification && !oldLearnedWords) return null;

  const gamData = oldGamification ? JSON.parse(oldGamification) : { totalXp: 0 };
  const learnedWords = oldLearnedWords ? JSON.parse(oldLearnedWords) : [];
  const streak = oldStreak ? parseInt(oldStreak) : 0;
  const stars = oldStars ? parseInt(oldStars) : 0;

  const migratedCoins = gamData.totalXp + stars;

  // Clean up old keys
  localStorage.removeItem('gamification');
  localStorage.removeItem('learnedWords');
  localStorage.removeItem('streak');
  localStorage.removeItem('totalStars');
  localStorage.removeItem('currentWordIndex');

  return {
    ...DEFAULT_COIN_STATE,
    coins: migratedCoins,
    totalCoinsEarned: migratedCoins,
    learnedWords,
    streak,
    lastActive: new Date().toISOString(),
  };
}

function loadState(): CoinState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }

  const migrated = migrateV1Data();
  if (migrated) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  }

  return DEFAULT_COIN_STATE;
}

export function useCoinSystem() {
  const [state, setState] = useState<CoinState>(loadState);

  const persist = useCallback((newState: CoinState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const addCoins = useCallback((amount: number, description?: string): number => {
    setState(prev => {
      const newState = {
        ...prev,
        coins: prev.coins + amount,
        totalCoinsEarned: prev.totalCoinsEarned + amount,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
    return amount;
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setState(prev => {
      if (prev.coins < amount) return prev;
      success = true;
      const newState = { ...prev, coins: prev.coins - amount };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
    return success;
  }, []);

  const unlockZone = useCallback((zoneId: string, cost: number): boolean => {
    let success = false;
    setState(prev => {
      if (prev.coins < cost || prev.unlockedZones.includes(zoneId)) return prev;
      success = true;
      const newState = {
        ...prev,
        coins: prev.coins - cost,
        unlockedZones: [...prev.unlockedZones, zoneId],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
    return success;
  }, []);

  const isZoneUnlocked = useCallback((zoneId: string): boolean => {
    return state.unlockedZones.includes(zoneId);
  }, [state.unlockedZones]);

  const learnWord = useCallback((wordId: string) => {
    setState(prev => {
      if (prev.learnedWords.includes(wordId)) return prev;
      const newState = {
        ...prev,
        coins: prev.coins + COIN_REWARDS.LEARN_WORD,
        totalCoinsEarned: prev.totalCoinsEarned + COIN_REWARDS.LEARN_WORD,
        learnedWords: [...prev.learnedWords, wordId],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const completeStory = useCallback((storyId: string) => {
    setState(prev => {
      const alreadyCompleted = prev.completedStories.includes(storyId);
      const reward = alreadyCompleted ? 0 : COIN_REWARDS.COMPLETE_STORY;
      const newState = {
        ...prev,
        coins: prev.coins + reward,
        totalCoinsEarned: prev.totalCoinsEarned + reward,
        completedStories: alreadyCompleted
          ? prev.completedStories
          : [...prev.completedStories, storyId],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const updateGameStats = useCallback(
    (game: keyof CoinState['gameStats'], score: number, isPerfect: boolean) => {
      setState(prev => {
        const reward = isPerfect
          ? COIN_REWARDS.PERFECT_GAME
          : COIN_REWARDS.COMPLETE_GAME;
        const prevStats = prev.gameStats[game];
        const newState = {
          ...prev,
          coins: prev.coins + reward,
          totalCoinsEarned: prev.totalCoinsEarned + reward,
          gameStats: {
            ...prev.gameStats,
            [game]: {
              played: prevStats.played + 1,
              bestScore: Math.max(prevStats.bestScore, score),
            },
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        return newState;
      });
    },
    []
  );

  const resetV2Data = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_COIN_STATE);
  }, []);

  return {
    ...state,
    addCoins,
    spendCoins,
    unlockZone,
    isZoneUnlocked,
    learnWord,
    completeStory,
    updateGameStats,
    resetV2Data,
  };
}
