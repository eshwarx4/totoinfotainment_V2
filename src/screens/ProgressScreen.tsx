import { useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { WORLDS } from '@/config/worlds';
import { ArrowLeft, Star, Flame, BookOpen, Trophy, Target } from 'lucide-react';

export default function ProgressScreen() {
  const navigate = useNavigate();
  const game = useGame();
  const total = game.getTotalProgress();

  return (
    <div className="min-h-screen screen-enter">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-4 pt-4 pb-8">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold mb-1">Your Progress</h1>
          <p className="text-sm opacity-80">{game.playerName || 'Explorer'}'s Journey</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card-game-elevated p-4 text-center">
            <div className="text-2xl mb-1">🪙</div>
            <div className="text-2xl font-black text-amber-500">{total.totalCoins}</div>
            <div className="text-xs text-muted-foreground">Total Coins</div>
          </div>
          <div className="card-game-elevated p-4 text-center">
            <div className="text-2xl mb-1">💎</div>
            <div className="text-2xl font-black text-blue-500">{total.totalDiamonds}</div>
            <div className="text-xs text-muted-foreground">Diamonds</div>
          </div>
          <div className="card-game-elevated p-4 text-center">
            <Flame className="w-7 h-7 mx-auto mb-1 text-orange-500" />
            <div className="text-2xl font-black">{total.streak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
          <div className="card-game-elevated p-4 text-center">
            <BookOpen className="w-7 h-7 mx-auto mb-1 text-blue-500" />
            <div className="text-2xl font-black">{total.wordsLearned}</div>
            <div className="text-xs text-muted-foreground">Words Learned</div>
          </div>
        </div>

        {/* Level bar */}
        <div className="card-game p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm">Level {Math.floor(total.totalCoins / 200) + 1}</span>
            <span className="text-xs text-muted-foreground">{total.totalCoins % 200}/200 coins</span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${(total.totalCoins % 200) / 2}%` }} />
          </div>
        </div>

        {/* World progress */}
        <h2 className="font-bold text-lg mb-3">World Progress</h2>
        <div className="space-y-3 mb-6">
          {WORLDS.map(world => {
            const wp = game.getWorldProgress(world.id);
            return (
              <div key={world.id} className="card-game p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{world.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm">{world.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-game-star text-game-star" />
                        <span className="text-xs font-semibold">{wp.totalStars}/{wp.maxStars}</span>
                      </div>
                    </div>
                    <div className="progress-bar-game mt-1.5">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${wp.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-11">
                  <span className="text-xs text-muted-foreground">
                    {wp.completedLevels}/5 levels
                  </span>
                  {wp.isComplete && (
                    <span className="text-xs bg-game-primary/10 text-game-primary px-2 py-0.5 rounded-full font-semibold">
                      Complete ✅
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Achievements */}
        <h2 className="font-bold text-lg mb-3">Achievements</h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className={`card-game p-3 text-center ${total.totalCoins >= 100 ? '' : 'opacity-40'}`}>
            <Trophy className="w-8 h-8 mx-auto mb-1 text-game-star" />
            <p className="text-xs font-bold">Coin Master</p>
            <p className="text-[10px] text-muted-foreground">Earn 100 coins</p>
          </div>
          <div className={`card-game p-3 text-center ${total.completedWorlds >= 1 ? '' : 'opacity-40'}`}>
            <Target className="w-8 h-8 mx-auto mb-1 text-game-primary" />
            <p className="text-xs font-bold">World Explorer</p>
            <p className="text-[10px] text-muted-foreground">Complete 1 world</p>
          </div>
          <div className={`card-game p-3 text-center ${total.streak >= 3 ? '' : 'opacity-40'}`}>
            <Flame className="w-8 h-8 mx-auto mb-1 text-orange-500" />
            <p className="text-xs font-bold">On Fire</p>
            <p className="text-[10px] text-muted-foreground">3 day streak</p>
          </div>
        </div>
      </div>
    </div>
  );
}
