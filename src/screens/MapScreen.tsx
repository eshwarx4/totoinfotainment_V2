import { useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { WORLDS, WorldConfig } from '@/config/worlds';
import { WorldId } from '@/types/game';
import { Star, Flame } from 'lucide-react';

function WorldCard({ world, progress, isUnlocked, onClick }: {
  world: WorldConfig;
  progress: { completedLevels: number; totalStars: number; maxStars: number; percentage: number };
  isUnlocked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!isUnlocked}
      className={`world-card w-full text-left ${!isUnlocked ? 'world-card-locked' : ''}`}
    >
      <div className={`bg-gradient-to-br ${world.bgGradient} p-5 text-white`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-4xl">{world.icon}</span>
          {!isUnlocked && (
            <span className="text-2xl">🔒</span>
          )}
          {isUnlocked && progress.completedLevels === 5 && (
            <span className="text-2xl">✅</span>
          )}
        </div>
        <h3 className="text-xl font-bold mb-1">{world.name}</h3>
        <p className="text-sm opacity-80">{world.description}</p>

        {isUnlocked && (
          <div className="mt-3">
            {/* Star progress */}
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${i < progress.completedLevels ? 'bg-white' : 'bg-white/30'
                    }`}
                />
              ))}
              <span className="text-xs ml-2 opacity-80">
                {progress.completedLevels}/5 levels
              </span>
            </div>
            {/* Stars earned */}
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
              <span className="text-xs font-semibold">{progress.totalStars}/{progress.maxStars}</span>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}

export default function MapScreen() {
  const navigate = useNavigate();
  const game = useGame();
  const totalProgress = game.getTotalProgress();

  // World unlock logic: first world always unlocked, others require previous world to have at least 3 levels done
  const isWorldUnlocked = (worldId: WorldId, index: number): boolean => {
    if (index === 0) return true;
    const prevWorldId = WORLDS[index - 1].id;
    const prevProgress = game.getWorldProgress(prevWorldId);
    return prevProgress.completedLevels >= 3;
  };

  return (
    <div className="min-h-screen screen-enter">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Hi, {game.playerName || 'Explorer'}! 👋</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                🪙 {totalProgress.totalCoins}
              </span>
              <span className="flex items-center gap-1 text-blue-500 font-semibold">
                💎 {totalProgress.totalDiamonds}
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                {totalProgress.streak}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-game-primary/10 rounded-full px-3 py-1.5">
            <span className="text-xs font-bold text-amber-500 px-2 py-0.5 rounded-full bg-amber-50">Lv.{Math.floor(totalProgress.totalCoins / 200) + 1}</span>
          </div>
        </div>
      </div>

      {/* XP Progress bar */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="text-amber-500">Level {Math.floor(totalProgress.totalCoins / 200) + 1}</span>
          <span className="text-muted-foreground">{totalProgress.totalCoins % 200}/200 coins</span>
        </div>
        <div className="xp-bar">
          <div
            className="xp-bar-fill"
            style={{ width: `${(totalProgress.totalCoins % 200) / 2}%` }}
          />
        </div>
      </div>

      {/* World Cards */}
      <div className="max-w-lg mx-auto px-4 mt-6">
        <h2 className="text-xl font-bold mb-4">Your Journey 🗺️</h2>
        <div className="grid gap-4">
          {WORLDS.map((world, index) => {
            const unlocked = isWorldUnlocked(world.id, index);
            const progress = game.getWorldProgress(world.id);
            return (
              <WorldCard
                key={world.id}
                world={world}
                progress={progress}
                isUnlocked={unlocked}
                onClick={() => unlocked && navigate(`/world/${world.id}`)}
              />
            );
          })}
        </div>
      </div>

      {/* Overall progress summary */}
      <div className="max-w-lg mx-auto px-4 mt-8 mb-4">
        <div className="card-game p-4 flex items-center justify-around text-center">
          <div>
            <div className="text-2xl font-bold text-game-primary">{totalProgress.completedWorlds}</div>
            <div className="text-xs text-muted-foreground">Worlds</div>
          </div>
          <div className="w-px h-10 bg-border"></div>
          <div>
            <div className="text-2xl font-bold text-amber-500">🪙 {totalProgress.totalCoins}</div>
            <div className="text-xs text-muted-foreground">Coins</div>
          </div>
          <div className="w-px h-10 bg-border"></div>
          <div>
            <div className="text-2xl font-bold text-blue-500">💎 {totalProgress.totalDiamonds}</div>
            <div className="text-xs text-muted-foreground">Diamonds</div>
          </div>
        </div>
      </div>
    </div>
  );
}
