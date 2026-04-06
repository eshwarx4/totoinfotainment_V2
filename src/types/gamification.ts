export interface CoinState {
  coins: number;
  totalCoinsEarned: number;
  learnedWords: string[];
  completedStories: string[];
  completedGames: string[];
  streak: number;
  lastActive: string;
  unlockedZones: string[];
  gameStats: {
    wordMatch: { played: number; bestScore: number };
    pictureQuiz: { played: number; bestScore: number };
    listeningGame: { played: number; bestScore: number };
    spellingBee: { played: number; bestScore: number };
  };
}

export interface CoinReward {
  action: string;
  amount: number;
  description: string;
}

export const COIN_REWARDS = {
  LEARN_WORD: 10,
  SKIP_WORD: 2,
  VIEW_WORD_DETAIL: 5,
  CORRECT_QUIZ_ANSWER: 15,
  COMPLETE_QUIZ: 25,
  COMPLETE_STORY: 20,
  COMPLETE_GAME: 30,
  PERFECT_GAME: 50,
} as const;

export const STORAGE_KEY = 'totoV2State';

export const DEFAULT_COIN_STATE: CoinState = {
  coins: 0,
  totalCoinsEarned: 0,
  learnedWords: [],
  completedStories: [],
  completedGames: [],
  streak: 0,
  lastActive: new Date().toISOString(),
  unlockedZones: ['words'],
  gameStats: {
    wordMatch: { played: 0, bestScore: 0 },
    pictureQuiz: { played: 0, bestScore: 0 },
    listeningGame: { played: 0, bestScore: 0 },
    spellingBee: { played: 0, bestScore: 0 },
  },
};
