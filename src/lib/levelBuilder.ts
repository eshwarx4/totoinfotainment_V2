// ==========================================
// LEVEL BUILDER - Maps words to levels dynamically
// ==========================================

import { WordItem } from '@/types/content';
import { WorldId } from '@/types/game';
import { getWorldConfig, getLevelConfig } from '@/config/worlds';
import { shuffle, pickRandom } from './gameUtils';

/**
 * Get all words for a specific world (by category)
 */
export function getWorldWords(allWords: WordItem[], worldId: WorldId): WordItem[] {
  const config = getWorldConfig(worldId);
  return allWords.filter(w => w.category === config.category);
}

/**
 * Build words for a specific level in a world.
 *
 * Distributes words across levels:
 * - Level 1: first 3 words
 * - Level 2: next 4 words
 * - Level 3: next 3 new + 2 review from levels 1-2
 * - Level 4: next 3 new + 2 review
 * - Level 5: all review (mixed from all previous)
 *
 * If not enough words exist, it recycles from available pool.
 */
export function buildLevelWords(
  allWords: WordItem[],
  worldId: WorldId,
  levelNum: number,
  learnedWordIds: string[] = []
): WordItem[] {
  const worldWords = getWorldWords(allWords, worldId);
  const levelConfig = getLevelConfig(levelNum);

  if (worldWords.length === 0) return [];

  // Calculate how many words previous levels consumed
  const wordOffsets = [0, 3, 7, 10, 13]; // cumulative: L1=3, L2=4, L3=3new, L4=3new, L5=0new
  const newWordsPerLevel = [3, 4, 3, 3, 0];

  const startIdx = wordOffsets[levelNum - 1] || 0;
  const newCount = newWordsPerLevel[levelNum - 1] || 0;

  // Get new words for this level (cycling if not enough)
  let newWords: WordItem[] = [];
  if (newCount > 0) {
    if (startIdx < worldWords.length) {
      const available = worldWords.slice(startIdx);
      if (available.length >= newCount) {
        newWords = available.slice(0, newCount);
      } else {
        // Not enough new words - use what's available + recycle
        newWords = [...available];
        const remaining = newCount - available.length;
        const recycled = pickRandom(worldWords.slice(0, startIdx), remaining);
        newWords = [...newWords, ...recycled];
      }
    } else {
      // All words used up, recycle
      newWords = pickRandom(worldWords, newCount);
    }
  }

  // Get review words from previously learned words in this world
  let reviewWords: WordItem[] = [];
  if (levelConfig.includeReview && levelConfig.reviewCount > 0) {
    const previousWords = worldWords.slice(0, startIdx);
    if (previousWords.length > 0) {
      reviewWords = pickRandom(previousWords, Math.min(levelConfig.reviewCount, previousWords.length));
    }
  }

  // Combine and ensure we hit target count
  let levelWords = [...newWords, ...reviewWords];

  // If still short, pad from world words
  while (levelWords.length < levelConfig.wordCount && worldWords.length > 0) {
    const unused = worldWords.filter(w => !levelWords.find(lw => lw.id === w.id));
    if (unused.length > 0) {
      levelWords.push(unused[0]);
    } else {
      // Use any word from the world
      const randomPick = worldWords[Math.floor(Math.random() * worldWords.length)];
      if (!levelWords.find(w => w.id === randomPick.id)) {
        levelWords.push(randomPick);
      } else {
        break; // prevent infinite loop
      }
    }
  }

  return levelWords.slice(0, levelConfig.wordCount);
}

/**
 * Get all words that should have been learned up to a given level
 */
export function getLearnedWordsUpToLevel(
  allWords: WordItem[],
  worldId: WorldId,
  upToLevel: number
): WordItem[] {
  const result: WordItem[] = [];
  for (let i = 1; i <= upToLevel; i++) {
    const levelWords = buildLevelWords(allWords, worldId, i);
    for (const w of levelWords) {
      if (!result.find(r => r.id === w.id)) {
        result.push(w);
      }
    }
  }
  return result;
}
