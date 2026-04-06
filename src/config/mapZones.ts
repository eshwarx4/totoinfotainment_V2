export interface MapZone {
  id: string;
  name: string;
  description: string;
  cost: number;
  route: string;
  icon: string;
  position: { top: string; left: string };
  color: string;
}

export const MAP_ZONES: MapZone[] = [
  {
    id: 'words',
    name: 'Words Village',
    description: 'Browse and learn Toto words',
    cost: 0,
    route: '/words',
    icon: '🏘️',
    position: { top: '60%', left: '15%' },
    color: 'from-orange-400 to-orange-500',
  },
  {
    id: 'stories',
    name: 'Story Hut',
    description: 'Read fun educational stories',
    cost: 50,
    route: '/stories',
    icon: '📖',
    position: { top: '35%', left: '30%' },
    color: 'from-blue-400 to-blue-500',
  },
  {
    id: 'quizzes',
    name: 'Quiz Arena',
    description: 'Test your knowledge',
    cost: 75,
    route: '/quizzes',
    icon: '🏟️',
    position: { top: '20%', left: '55%' },
    color: 'from-purple-400 to-purple-500',
  },
  {
    id: 'games',
    name: 'Game Grove',
    description: 'Play fun learning games',
    cost: 100,
    route: '/games',
    icon: '🌳',
    position: { top: '45%', left: '70%' },
    color: 'from-green-400 to-green-500',
  },
  {
    id: 'cultural',
    name: 'Cultural Center',
    description: 'Explore Toto folk stories and songs',
    cost: 150,
    route: '/cultural',
    icon: '🏛️',
    position: { top: '65%', left: '55%' },
    color: 'from-amber-400 to-amber-500',
  },
  {
    id: 'spelling',
    name: 'Spelling Cave',
    description: 'Master Toto spelling',
    cost: 200,
    route: '/games/spelling',
    icon: '🕳️',
    position: { top: '25%', left: '85%' },
    color: 'from-red-400 to-red-500',
  },
];
