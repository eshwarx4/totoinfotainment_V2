import { useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { WORLDS, WorldConfig } from '@/config/worlds';
import { WorldId } from '@/types/game';
import { CandyMapLevel } from './CandyMapLevel';
import { ChevronDown, Sparkles } from 'lucide-react';

interface WorldSectionProps {
  world: WorldConfig;
  worldIndex: number;
  isUnlocked: boolean;
  levels: {
    levelNum: number;
    stars: number;
    unlocked: boolean;
    completed: boolean;
  }[];
  currentLevel: number | null;
  onLevelClick: (levelNum: number) => void;
}

// Candy Crush style positions - zigzag pattern
const LEVEL_POSITIONS = [
  { x: 25, y: 85 },
  { x: 50, y: 70 },
  { x: 75, y: 55 },
  { x: 50, y: 40 },
  { x: 25, y: 25 },
];

function WorldSection({ world, worldIndex, isUnlocked, levels, currentLevel, onLevelClick }: WorldSectionProps) {
  // Generate path points for the winding trail
  const pathPoints = LEVEL_POSITIONS.map((pos, i) => `${pos.x},${100 - pos.y}`).join(' ');

  return (
    <div className={`candy-world-section ${!isUnlocked ? 'candy-world-locked' : ''}`}>
      {/* World background with themed gradient */}
      <div className={`candy-world-bg bg-gradient-to-b ${world.bgGradient}`}>
        {/* Decorative elements */}
        <div className="candy-world-decorations">
          {/* Floating particles */}
          {isUnlocked && (
            <>
              <div className="candy-particle candy-particle-1" />
              <div className="candy-particle candy-particle-2" />
              <div className="candy-particle candy-particle-3" />
            </>
          )}

          {/* World icon */}
          <div className="absolute top-4 left-4 text-4xl opacity-30">
            {world.icon}
          </div>
          <div className="absolute bottom-4 right-4 text-4xl opacity-20">
            {world.icon}
          </div>
        </div>

        {/* World title banner */}
        <div className="candy-world-banner">
          <span className="text-2xl mr-2">{world.icon}</span>
          <div>
            <h3 className="font-bold text-white text-lg">{world.name}</h3>
            <p className="text-white/70 text-xs">{world.description}</p>
          </div>
          {!isUnlocked && (
            <div className="ml-auto bg-black/30 px-3 py-1 rounded-full text-sm">
              🔒 Locked
            </div>
          )}
        </div>

        {/* SVG Path connecting levels */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Trail shadow */}
          <path
            d={`M 25,15 Q 35,25 50,30 Q 65,35 75,45 Q 65,55 50,60 Q 35,65 25,75 Q 35,85 50,90`}
            fill="none"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Main trail */}
          <path
            d={`M 25,15 Q 35,25 50,30 Q 65,35 75,45 Q 65,55 50,60 Q 35,65 25,75 Q 35,85 50,90`}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={isUnlocked ? "none" : "8 4"}
          />
          {/* Dotted center line */}
          <path
            d={`M 25,15 Q 35,25 50,30 Q 65,35 75,45 Q 65,55 50,60 Q 35,65 25,75 Q 35,85 50,90`}
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="4 6"
          />
        </svg>

        {/* Level nodes */}
        <div className="relative w-full h-full">
          {levels.map((level, i) => (
            <CandyMapLevel
              key={level.levelNum}
              levelNum={level.levelNum}
              worldConfig={world}
              stars={level.stars}
              isUnlocked={level.unlocked && isUnlocked}
              isCompleted={level.completed}
              isCurrent={level.levelNum === currentLevel}
              position={LEVEL_POSITIONS[i]}
              onClick={() => onLevelClick(level.levelNum)}
            />
          ))}
        </div>
      </div>

      {/* Connection arrow to next world */}
      {worldIndex < WORLDS.length - 1 && (
        <div className="candy-world-connector">
          <div className="candy-connector-arrow">
            <ChevronDown className="w-6 h-6 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}

export function CandyMap() {
  const navigate = useNavigate();
  const game = useGame();
  const totalProgress = game.getTotalProgress();

  const isWorldUnlocked = (worldId: WorldId, index: number): boolean => {
    if (index === 0) return true;
    const prevWorldId = WORLDS[index - 1].id;
    const prevProgress = game.getWorldProgress(prevWorldId);
    return prevProgress.completedLevels >= 3;
  };

  const getCurrentLevel = (worldId: WorldId): number | null => {
    const worldState = game.worlds[worldId];
    if (!worldState) return null;
    for (let i = 1; i <= 5; i++) {
      if (worldState.levels[i].unlocked && !worldState.levels[i].completed) {
        return i;
      }
    }
    return null;
  };

  const handleLevelClick = (worldId: WorldId, levelNum: number) => {
    navigate(`/level/${worldId}/${levelNum}/intro`);
  };

  return (
    <div className="candy-map-container">
      {/* Fixed header */}
      <div className="candy-map-header">
        <div className="flex items-center gap-3">
          <div className="candy-avatar">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">
              {game.playerName || 'Explorer'}
            </h1>
            <p className="text-white/70 text-xs">
              Level {Math.floor(totalProgress.totalCoins / 200) + 1}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="candy-currency">
            <span className="text-lg">🪙</span>
            <span className="font-bold">{totalProgress.totalCoins}</span>
          </div>
          <div className="candy-currency">
            <span className="text-lg">💎</span>
            <span className="font-bold">{totalProgress.totalDiamonds}</span>
          </div>
        </div>
      </div>

      {/* Scrollable map area */}
      <div className="candy-map-scroll">
        {WORLDS.map((world, index) => {
          const worldState = game.worlds[world.id];
          const unlocked = isWorldUnlocked(world.id, index);
          const currentLevel = getCurrentLevel(world.id);

          const levels = [1, 2, 3, 4, 5].map((levelNum) => ({
            levelNum,
            stars: worldState?.levels[levelNum]?.stars || 0,
            unlocked: worldState?.levels[levelNum]?.unlocked || false,
            completed: worldState?.levels[levelNum]?.completed || false,
          }));

          return (
            <WorldSection
              key={world.id}
              world={world}
              worldIndex={index}
              isUnlocked={unlocked}
              levels={levels}
              currentLevel={currentLevel}
              onLevelClick={(levelNum) => handleLevelClick(world.id, levelNum)}
            />
          );
        })}

        {/* End celebration */}
        <div className="candy-map-end">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-white/80 font-semibold">Master the Toto Language!</p>
        </div>
      </div>
    </div>
  );
}
