// ==========================================
// SCORING & COIN CALCULATION
// ==========================================

import { LevelResult, GameRoundResult, COINS_PER_LEVEL, COINS_THREE_STAR_BONUS, DIAMONDS_PER_PERFECT_LEVEL } from '@/types/game';

/**
 * Calculate stars from accuracy percentage
 * 3 stars: >= 90%
 * 2 stars: >= 60%
 * 1 star:  < 60%
 */
export function calculateStars(accuracy: number): number {
  if (accuracy >= 90) return 3;
  if (accuracy >= 60) return 2;
  return 1;
}

/**
 * Calculate overall accuracy from 3 game rounds
 */
export function calculateOverallAccuracy(
  game1: GameRoundResult,
  game2: GameRoundResult,
  game3: GameRoundResult
): number {
  const totalCorrect = game1.correct + game2.correct + game3.correct;
  const totalQuestions = game1.total + game2.total + game3.total;
  if (totalQuestions === 0) return 0;
  return Math.round((totalCorrect / totalQuestions) * 100);
}

/**
 * Calculate coins earned for a level
 * Base: 50 coins
 * Bonus: +20 for 3 stars
 */
export function calculateCoins(stars: number): number {
  return COINS_PER_LEVEL + (stars === 3 ? COINS_THREE_STAR_BONUS : 0);
}

/**
 * Calculate diamonds earned
 * 1 diamond for a perfect level (3 stars)
 */
export function calculateDiamonds(stars: number): number {
  return stars === 3 ? DIAMONDS_PER_PERFECT_LEVEL : 0;
}

/**
 * Build full level result from 3 game rounds
 */
export function buildLevelResult(
  game1: GameRoundResult,
  game2: GameRoundResult,
  game3: GameRoundResult
): LevelResult {
  const g1Acc = game1.total > 0 ? Math.round((game1.correct / game1.total) * 100) : 0;
  const g2Acc = game2.total > 0 ? Math.round((game2.correct / game2.total) * 100) : 0;
  const g3Acc = game3.total > 0 ? Math.round((game3.correct / game3.total) * 100) : 0;

  const overallAccuracy = calculateOverallAccuracy(game1, game2, game3);
  const stars = calculateStars(overallAccuracy);
  const coinsEarned = calculateCoins(stars);
  const diamondsEarned = calculateDiamonds(stars);

  return {
    game1Accuracy: g1Acc,
    game2Accuracy: g2Acc,
    game3Accuracy: g3Acc,
    game3Speed: game3.timeBonus,
    overallAccuracy,
    stars,
    coinsEarned,
    diamondsEarned,
  };
}
