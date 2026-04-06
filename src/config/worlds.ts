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
  { levelNum: 1, wordCount: 3, includeReview: false, reviewCount: 0 },
  { levelNum: 2, wordCount: 4, includeReview: false, reviewCount: 0 },
  { levelNum: 3, wordCount: 5, includeReview: true, reviewCount: 2 },
  { levelNum: 4, wordCount: 5, includeReview: true, reviewCount: 2 },
  { levelNum: 5, wordCount: 5, includeReview: true, reviewCount: 3 },
];

// Story unlock points
export const CONCEPT_STORY_UNLOCK_AFTER = 2; // after level 2
export const FOLK_STORY_UNLOCK_AFTER = 4;    // after level 4

// World definitions
export const WORLDS: WorldConfig[] = [
  {
    id: 'forest',
    name: 'Forest',
    description: 'Learn animal names in Toto!',
    category: 'Animals',
    icon: '🌲',
    color: 'forest',
    bgGradient: 'from-green-600 to-green-800',
    mascotMessage: 'Welcome to the Forest! Let\'s meet the animals!',
    position: { x: 20, y: 70 },
  },
  {
    id: 'farm',
    name: 'Farm',
    description: 'Discover food words in Toto!',
    category: 'Food',
    icon: '🌾',
    color: 'farm',
    bgGradient: 'from-amber-500 to-amber-700',
    mascotMessage: 'Welcome to the Farm! Let\'s learn about food!',
    position: { x: 40, y: 50 },
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Explore the natural world in Toto!',
    category: 'Nature',
    icon: '🌊',
    color: 'nature',
    bgGradient: 'from-sky-500 to-sky-700',
    mascotMessage: 'Welcome to Nature! Sun, water, and more!',
    position: { x: 60, y: 30 },
  },
  {
    id: 'village',
    name: 'Village',
    description: 'Learn everyday object names!',
    category: 'Places',
    icon: '🏘️',
    color: 'village',
    bgGradient: 'from-amber-700 to-amber-900',
    mascotMessage: 'Welcome to the Village! Let\'s name things around us!',
    position: { x: 75, y: 55 },
  },
  {
    id: 'bodyLand',
    name: 'Body Land',
    description: 'Learn body part names in Toto!',
    category: 'Body Parts',
    icon: '🫶',
    color: 'bodyLand',
    bgGradient: 'from-pink-500 to-pink-700',
    mascotMessage: 'Welcome to Body Land! Let\'s learn about our body!',
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
