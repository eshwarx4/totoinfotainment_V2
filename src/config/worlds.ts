// ==========================================
// WORLD & LEVEL CONFIGURATION
// ==========================================

import { WorldId } from '@/types/game';

export interface WorldConfig {
  id: WorldId;
  name: string;
  description: string;
  category: string; // maps to word category in DB
  icon: string;
  color: string; // tailwind color class
  bgGradient: string;
  mascotMessage: string;
  position: { x: number; y: number }; // on world map (percentage)
}

export interface LevelConfig {
  levelNum: number;
  wordCount: number;
  includeReview: boolean; // include previously learned words
  reviewCount: number;
}

// Word counts per level
export const LEVEL_CONFIGS: LevelConfig[] = [
  { levelNum: 1, wordCount: 4, includeReview: false, reviewCount: 0 },
  { levelNum: 2, wordCount: 4, includeReview: false, reviewCount: 0 },
  { levelNum: 3, wordCount: 4, includeReview: true, reviewCount: 2 },
  { levelNum: 4, wordCount: 4, includeReview: true, reviewCount: 2 },
  { levelNum: 5, wordCount: 5, includeReview: true, reviewCount: 5 },
];

// Story unlock points
export const CONCEPT_STORY_UNLOCK_AFTER = 2; // after level 2
export const FOLK_STORY_UNLOCK_AFTER = 4;    // after level 4

// World definitions - Totopara Village Locations
export const WORLDS: WorldConfig[] = [
  {
    id: 'forest',
    name: 'Toto Village',
    description: 'Explore Totopara & learn place names!',
    category: 'Places',
    icon: '🏘️',
    color: 'forest',
    bgGradient: 'from-amber-200 via-orange-100 to-amber-300',
    mascotMessage: 'Welcome to Totopara! Let\'s explore our village!',
    position: { x: 20, y: 70 },
  },
  {
    id: 'farm',
    name: 'Torsha River',
    description: 'Learn nature words by the river!',
    category: 'Nature',
    icon: '🏞️',
    color: 'farm',
    bgGradient: 'from-sky-300 via-cyan-200 to-blue-300',
    mascotMessage: 'Welcome to Torsha River! Water, sky, and more!',
    position: { x: 40, y: 50 },
  },
  {
    id: 'nature',
    name: 'Toto Forest',
    description: 'Meet the animals of the forest!',
    category: 'Animals',
    icon: '🌳',
    color: 'nature',
    bgGradient: 'from-emerald-400 via-green-300 to-emerald-400',
    mascotMessage: 'Welcome to the Forest! Let\'s meet the animals!',
    position: { x: 60, y: 30 },
  },
  {
    id: 'village',
    name: 'Hill Fields',
    description: 'Discover food & farming words!',
    category: 'Food',
    icon: '🌾',
    color: 'village',
    bgGradient: 'from-lime-200 via-yellow-100 to-green-200',
    mascotMessage: 'Welcome to the Fields! Let\'s learn about food!',
    position: { x: 75, y: 55 },
  },
  {
    id: 'bodyLand',
    name: 'Sacred Grove',
    description: 'Learn body & self words!',
    category: 'Body Parts',
    icon: '🙏',
    color: 'bodyLand',
    bgGradient: 'from-violet-300 via-purple-200 to-indigo-300',
    mascotMessage: 'Welcome to the Sacred Grove! Know yourself!',
    position: { x: 85, y: 35 },
  },
];

export function getWorldConfig(worldId: WorldId): WorldConfig {
  return WORLDS.find(w => w.id === worldId)!;
}

export function getLevelConfig(levelNum: number): LevelConfig {
  return LEVEL_CONFIGS.find(l => l.levelNum === levelNum) || LEVEL_CONFIGS[0];
}

export function getWorldOrder(): WorldId[] {
  return WORLDS.map(w => w.id);
}

export function getNextWorld(worldId: WorldId): WorldId | null {
  const order = getWorldOrder();
  const idx = order.indexOf(worldId);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

export function getPrevWorld(worldId: WorldId): WorldId | null {
  const order = getWorldOrder();
  const idx = order.indexOf(worldId);
  return idx > 0 ? order[idx - 1] : null;
}
