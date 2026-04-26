// ==========================================
// GAME STATE HOOK - Multi-user state management
// ==========================================

import { useState, useCallback } from 'react';
import {
  GameState,
  WorldId,
  LevelResult,
  createDefaultGameState,
  DEFAULT_GAME_STATE,
  STORAGE_USERS_KEY,
  STORAGE_ACTIVE_USER_KEY,
  STORAGE_KEY_V3,
  COINS_STORY_COMPLETE,
  COINS_CULTURAL_COMPLETE,
  COINS_WORD_LEARNED,
} from '@/types/game';
import { CONCEPT_STORY_UNLOCK_AFTER, FOLK_STORY_UNLOCK_AFTER } from '@/config/worlds';

// === Multi-user persistence ===

function loadAllUsers(): GameState[] {
  try {
    const saved = localStorage.getItem(STORAGE_USERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load users:', e);
  }
  return [];
}

function saveAllUsers(users: GameState[]) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

function getActiveUserId(): string | null {
  return localStorage.getItem(STORAGE_ACTIVE_USER_KEY);
}

function setActiveUserId(id: string | null) {
  if (id) {
    localStorage.setItem(STORAGE_ACTIVE_USER_KEY, id);
  } else {
    localStorage.removeItem(STORAGE_ACTIVE_USER_KEY);
  }
}

/** Load the active user's state, or return null if no active user */
function loadActiveUser(): GameState | null {
  const userId = getActiveUserId();
  if (!userId) return null;

  const users = loadAllUsers();
  const user = users.find(u => u.userId === userId);
  if (user) {
    // Merge with defaults for forward-compat
    return { ...createDefaultGameState(), ...user };
  }
  return null;
}

/** Migrate old single-user state to multi-user (one-time) */
function migrateV3State(): GameState | null {
  try {
    const old = localStorage.getItem(STORAGE_KEY_V3);
    if (!old) return null;
    const parsed = JSON.parse(old);
    if (parsed && parsed.playerName) {
      // Create a user from the old state
      const userId = crypto.randomUUID();
      const migrated: GameState = {
        ...createDefaultGameState(userId, parsed.playerName),
        ...parsed,
        userId,
        totalCoins: parsed.totalXP || 0,
        totalDiamonds: parsed.totalStars || 0,
        playerAvatar: '🦉',
        completedConcepts: [],
      };
      // Save to new system
      saveAllUsers([migrated]);
      setActiveUserId(userId);
      // Remove old key
      localStorage.removeItem(STORAGE_KEY_V3);
      return migrated;
    }
  } catch (e) {
    console.error('Migration failed:', e);
  }
  return null;
}

function loadState(): GameState {
  // Try active user first
  const active = loadActiveUser();
  if (active) return active;

  // Try migration
  const migrated = migrateV3State();
  if (migrated) return migrated;

  // No user — return default (not logged in)
  return DEFAULT_GAME_STATE;
}

function saveCurrentUser(state: GameState) {
  if (!state.userId) return;

  const users = loadAllUsers();
  const idx = users.findIndex(u => u.userId === state.userId);
  if (idx >= 0) {
    users[idx] = state;
  } else {
    users.push(state);
  }
  saveAllUsers(users);
  setActiveUserId(state.userId);
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);

  const persist = useCallback((updater: (prev: GameState) => GameState) => {
    setState(prev => {
      const next = updater(prev);
      saveCurrentUser(next);
      return next;
    });
  }, []);

  // === Multi-user ===

  const listUsers = useCallback((): Array<{ userId: string; playerName: string; playerAvatar: string; totalCoins: number; totalDiamonds: number }> => {
    return loadAllUsers().map(u => ({
      userId: u.userId,
      playerName: u.playerName,
      playerAvatar: u.playerAvatar || '🦉',
      totalCoins: u.totalCoins || 0,
      totalDiamonds: u.totalDiamonds || 0,
    }));
  }, []);

  const createUser = useCallback((name: string): string => {
    const userId = crypto.randomUUID();
    const newUser = createDefaultGameState(userId, name);
    const users = loadAllUsers();
    users.push(newUser);
    saveAllUsers(users);
    setActiveUserId(userId);
    setState(newUser);
    return userId;
  }, []);

  const switchUser = useCallback((userId: string) => {
    const users = loadAllUsers();
    const user = users.find(u => u.userId === userId);
    if (user) {
      const merged = { ...createDefaultGameState(), ...user };
      setActiveUserId(userId);
      setState(merged);
    }
  }, []);

  const logout = useCallback(() => {
    setActiveUserId(null);
    setState(DEFAULT_GAME_STATE);
  }, []);

  const deleteUser = useCallback((userId: string) => {
    const users = loadAllUsers().filter(u => u.userId !== userId);
    saveAllUsers(users);
    // If deleting active user, logout
    if (getActiveUserId() === userId) {
      setActiveUserId(null);
      setState(DEFAULT_GAME_STATE);
    }
  }, []);

  const isLoggedIn = !!state.userId && !!state.playerName;

  // === Profile ===

  const setProfile = useCallback((name: string, role: 'child' | 'teacher', avatar?: string) => {
    persist(prev => ({
      ...prev,
      playerName: name,
      playerRole: role,
      playerAvatar: avatar || prev.playerAvatar || '🦉',
      onboardingComplete: true,
    }));
  }, [persist]);

  const completeTutorial = useCallback(() => {
    persist(prev => ({ ...prev, tutorialComplete: true }));
  }, [persist]);

  // === Level Completion ===

  const completeLevel = useCallback((worldId: WorldId, levelNum: number, result: LevelResult) => {
    persist(prev => {
      const world = { ...prev.worlds[worldId] };
      const levels = { ...world.levels };
      const currentLevel = levels[levelNum];

      // Update this level (keep best scores)
      levels[levelNum] = {
        ...currentLevel,
        completed: true,
        stars: Math.max(currentLevel.stars, result.stars),
        bestAccuracy: Math.max(currentLevel.bestAccuracy, result.overallAccuracy),
        coinsEarned: Math.max(currentLevel.coinsEarned, result.coinsEarned),
      };

      // Unlock next level
      if (levelNum < 5 && levels[levelNum + 1]) {
        levels[levelNum + 1] = { ...levels[levelNum + 1], unlocked: true };
      }

      // Unlock stories based on level
      let conceptStoryUnlocked = world.conceptStoryUnlocked;
      let folkStoryUnlocked = world.folkStoryUnlocked;
      let culturalUnlocked = world.culturalUnlocked;

      if (levelNum >= CONCEPT_STORY_UNLOCK_AFTER) {
        conceptStoryUnlocked = true;
      }
      if (levelNum >= FOLK_STORY_UNLOCK_AFTER) {
        folkStoryUnlocked = true;
      }

      // Check if all 5 levels complete for cultural unlock
      const allComplete = Object.values(levels).every(l => l.completed);
      if (allComplete) {
        culturalUnlocked = true;
      }

      world.levels = levels;
      world.conceptStoryUnlocked = conceptStoryUnlocked;
      world.folkStoryUnlocked = folkStoryUnlocked;
      world.culturalUnlocked = culturalUnlocked;

      // Calculate coin/diamond gains
      const coinsGained = result.coinsEarned - (currentLevel.coinsEarned || 0);
      const diamondsGained = result.diamondsEarned || 0;

      return {
        ...prev,
        worlds: { ...prev.worlds, [worldId]: world },
        totalCoins: prev.totalCoins + Math.max(0, coinsGained),
        totalDiamonds: prev.totalDiamonds + Math.max(0, diamondsGained),
        lastActive: new Date().toISOString(),
      };
    });
  }, [persist]);

  // === Story Completion ===

  const completeStory = useCallback((worldId: WorldId, type: 'concept' | 'folk', storyId: string) => {
    persist(prev => {
      const world = { ...prev.worlds[worldId] };
      const alreadyCompleted = prev.completedStories.includes(storyId);

      if (type === 'concept') {
        world.conceptStoryCompleted = true;
      } else {
        world.folkStoryCompleted = true;
      }

      return {
        ...prev,
        worlds: { ...prev.worlds, [worldId]: world },
        totalCoins: prev.totalCoins + (alreadyCompleted ? 0 : COINS_STORY_COMPLETE),
        completedStories: alreadyCompleted
          ? prev.completedStories
          : [...prev.completedStories, storyId],
      };
    });
  }, [persist]);

  // === Cultural Completion ===

  const completeCultural = useCallback((_worldId: WorldId) => {
    persist(prev => {
      return {
        ...prev,
        totalCoins: prev.totalCoins + COINS_CULTURAL_COMPLETE,
      };
    });
  }, [persist]);

  // === Word Learning ===

  const markWordLearned = useCallback((wordId: string) => {
    persist(prev => {
      if (prev.learnedWords.includes(wordId)) return prev;
      return {
        ...prev,
        learnedWords: [...prev.learnedWords, wordId],
        totalCoins: prev.totalCoins + COINS_WORD_LEARNED,
      };
    });
  }, [persist]);

  // === Concept Completion ===

  const markConceptCompleted = useCallback((conceptId: string) => {
    persist(prev => {
      if (prev.completedConcepts.includes(conceptId)) return prev;
      return {
        ...prev,
        completedConcepts: [...prev.completedConcepts, conceptId],
        totalCoins: prev.totalCoins + 20,
      };
    });
  }, [persist]);

  // === Streak ===

  const updateStreak = useCallback(() => {
    persist(prev => {
      const lastDate = new Date(prev.lastActive).toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let newStreak = prev.streak;
      if (lastDate === today) {
        // Already played today, no change
      } else if (lastDate === yesterday) {
        newStreak = prev.streak + 1;
      } else {
        newStreak = 1; // streak broken
      }

      return {
        ...prev,
        streak: newStreak,
        lastActive: new Date().toISOString(),
      };
    });
  }, [persist]);

  // === Reset ===

  const resetAll = useCallback(() => {
    const users = loadAllUsers().filter(u => u.userId !== state.userId);
    saveAllUsers(users);
    setActiveUserId(null);
    setState(DEFAULT_GAME_STATE);
  }, [state.userId]);

  // === Shop ===

  const purchaseShopItem = useCallback((itemId: string, cost: number): boolean => {
    let success = false;
    persist(prev => {
      if ((prev.purchasedItems || []).includes(itemId)) return prev; // already owned
      if (prev.totalCoins < cost) return prev; // not enough coins
      success = true;
      return {
        ...prev,
        totalCoins: prev.totalCoins - cost,
        purchasedItems: [...(prev.purchasedItems || []), itemId],
      };
    });
    return success;
  }, [persist]);

  const equipTag = useCallback((tagId: string | null) => {
    persist(prev => ({ ...prev, equippedTag: tagId }));
  }, [persist]);

  const equipAvatar = useCallback((avatarEmoji: string) => {
    persist(prev => ({ ...prev, playerAvatar: avatarEmoji, equippedAvatar: avatarEmoji }));
  }, [persist]);

  // === Computed Values ===

  const getWorldProgress = useCallback((worldId: WorldId) => {
    const world = state.worlds[worldId];
    const completedLevels = Object.values(world.levels).filter(l => l.completed).length;
    const totalStars = Object.values(world.levels).reduce((sum, l) => sum + l.stars, 0);
    const maxStars = 15; // 5 levels * 3 stars
    return {
      completedLevels,
      totalLevels: 5,
      totalStars,
      maxStars,
      percentage: Math.round((completedLevels / 5) * 100),
      isComplete: completedLevels === 5,
    };
  }, [state.worlds]);

  const getTotalProgress = useCallback(() => {
    const worldIds: WorldId[] = ['forest', 'farm', 'nature', 'village', 'bodyLand'];
    let completedWorlds = 0;
    let totalCompletedLevels = 0;

    for (const wid of worldIds) {
      const wp = getWorldProgress(wid);
      totalCompletedLevels += wp.completedLevels;
      if (wp.isComplete) completedWorlds++;
    }

    return {
      completedWorlds,
      totalWorlds: 5,
      totalCompletedLevels,
      totalLevels: 25,
      totalCoins: state.totalCoins,
      totalDiamonds: state.totalDiamonds,
      maxStars: 75,
      wordsLearned: state.learnedWords.length,
      storiesCompleted: state.completedStories.length,
      conceptsCompleted: (state.completedConcepts || []).length,
      streak: state.streak,
    };
  }, [state, getWorldProgress]);

  return {
    ...state,
    isLoggedIn,
    // Multi-user
    listUsers,
    createUser,
    switchUser,
    logout,
    deleteUser,
    // Profile
    setProfile,
    completeTutorial,
    // Game
    completeLevel,
    completeStory,
    completeCultural,
    markWordLearned,
    markConceptCompleted,
    updateStreak,
    resetAll,
    // Shop
    purchaseShopItem,
    equipTag,
    equipAvatar,
    // Computed
    getWorldProgress,
    getTotalProgress,
  };
}
