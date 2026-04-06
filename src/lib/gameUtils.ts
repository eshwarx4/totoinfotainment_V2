import { WordItem } from '@/types/content';

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickRandom<T>(array: T[], count: number): T[] {
  return shuffle(array).slice(0, count);
}

export function scrambleLetters(word: string): string[] {
  return shuffle(word.split(''));
}

export function calculateGameScore(
  correct: number,
  total: number,
  bonusPoints: number = 0
): { score: number; percentage: number; isPerfect: boolean } {
  const percentage = Math.round((correct / total) * 100);
  const score = correct * 10 + bonusPoints;
  return { score, percentage, isPerfect: correct === total };
}

export function generateOptions(
  correctWord: WordItem,
  allWords: WordItem[],
  optionCount: number = 4
): WordItem[] {
  const others = allWords.filter((w) => w.id !== correctWord.id);
  const wrongOptions = pickRandom(others, optionCount - 1);
  return shuffle([correctWord, ...wrongOptions]);
}
