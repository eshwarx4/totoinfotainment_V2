// ==========================================
// GAME STATE TYPES - Toto Infotainment V4
// Multi-user + Coins/Diamonds system
// ==========================================

export type WorldId = 'forest' | 'farm' | 'nature' | 'village' | 'bodyLand';

export interface LevelState {
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0-3
  bestAccuracy: number; // 0-100
  coinsEarned: number;
}

export interface WorldState {
  levels: Record<number, LevelState>;
  conceptStoryUnlocked: boolean; // after level 2
  folkStoryUnlocked: boolean;    // after level 4
  culturalUnlocked: boolean;     // after all 5 levels
  conceptStoryCompleted: boolean;
  folkStoryCompleted: boolean;
}

export interface GameState {
  userId: string;
  playerName: string;
  playerRole: 'child' | 'teacher';
  playerAvatar: string; // emoji avatar
  totalCoins: number;
  totalDiamonds: number;
  streak: number;
  lastActive: string;
  tutorialComplete: boolean;
  onboardingComplete: boolean;
  worlds: Record<WorldId, WorldState>;
  learnedWords: string[];
  completedStories: string[];
  completedConcepts: string[];
  // Shop
  purchasedItems: string[];    // shop item IDs owned
  equippedTag: string | null;  // tag ID currently equipped (shown in leaderboard)
  equippedAvatar: string | null; // overrides playerAvatar if set
}

// Scoring
export interface LevelResult {
  game1Accuracy: number; // 0-100
  game2Accuracy: number;
  game3Accuracy: number;
  game3Speed?: number; // bonus from speed
  overallAccuracy: number;
  stars: number;
  coinsEarned: number;
  diamondsEarned: number;
}

export interface GameRoundResult {
  correct: number;
  total: number;
  timeBonus?: number;
}

// Coin/Diamond Constants
export const COINS_PER_LEVEL = 50;
export const COINS_THREE_STAR_BONUS = 20;
export const COINS_STORY_COMPLETE = 30;
export const COINS_CULTURAL_COMPLETE = 40;
export const COINS_WORD_LEARNED = 5;
export const DIAMONDS_PER_PERFECT_LEVEL = 1;

// Storage keys
export const STORAGE_USERS_KEY = 'totoUsers';
export const STORAGE_ACTIVE_USER_KEY = 'totoActiveUser';

// Legacy key (for migration)
export const STORAGE_KEY_V3 = 'totoV3State';

// Default level states
function createDefaultLevels(): Record<number, LevelState> {
  const levels: Record<number, LevelState> = {};
  for (let i = 1; i <= 5; i++) {
    levels[i] = {
      unlocked: i === 1, // only first level unlocked
      completed: false,
      stars: 0,
      bestAccuracy: 0,
      coinsEarned: 0,
    };
  }
  return levels;
}

function createDefaultWorldState(): WorldState {
  return {
    levels: createDefaultLevels(),
    conceptStoryUnlocked: false,
    folkStoryUnlocked: false,
    culturalUnlocked: false,
    conceptStoryCompleted: false,
    folkStoryCompleted: false,
  };
}

export function createDefaultGameState(userId?: string, name?: string): GameState {
  return {
    userId: userId || crypto.randomUUID(),
    playerName: name || '',
    playerRole: 'child',
    playerAvatar: '🦉',
    totalCoins: 0,
    totalDiamonds: 0,
    streak: 0,
    lastActive: new Date().toISOString(),
    tutorialComplete: false,
    onboardingComplete: false,
    worlds: {
      forest: createDefaultWorldState(),
      farm: createDefaultWorldState(),
      nature: createDefaultWorldState(),
      village: createDefaultWorldState(),
      bodyLand: createDefaultWorldState(),
    },
    learnedWords: [],
    completedStories: [],
    completedConcepts: [],
    purchasedItems: [],
    equippedTag: null,
    equippedAvatar: null,
  };
}

// Keep DEFAULT_GAME_STATE for backward compat
export const DEFAULT_GAME_STATE: GameState = createDefaultGameState();
