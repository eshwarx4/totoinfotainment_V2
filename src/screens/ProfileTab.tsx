import { useGame } from '@/state/GameContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, BarChart3, Settings, Trophy } from 'lucide-react';

export default function ProfileTab() {
  const game = useGame();
  const navigate = useNavigate();
  const total = game.getTotalProgress();
  const playerLevel = Math.floor(total.totalCoins / 200) + 1;

  // Calculate rank among all users
  const allUsers = game.listUsers();
  const sortedByCoins = [...allUsers].sort((a, b) => b.totalCoins - a.totalCoins);
  const rank = sortedByCoins.findIndex(u => u.userId === game.userId) + 1;

  const handleLogout = () => {
    game.logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen screen-enter">
      {/* Profile header */}
      <div className="bg-gradient-to-br from-game-primary to-emerald-600 text-white px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
              {game.playerAvatar || '🦉'}
            </div>
            <div>
              <h1 className="text-xl font-bold">{game.playerName || 'Explorer'}</h1>
              <p className="text-sm opacity-80">
                Level {playerLevel} · {game.playerRole}
                {rank > 0 && <span className="ml-2 bg-white/20 rounded-full px-2 py-0.5 text-xs font-bold">🏆 Rank #{rank}</span>}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-lg font-black">🪙 {total.totalCoins}</div>
              <div className="text-[10px] opacity-70 font-medium">Coins</div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-lg font-black">💎 {total.totalDiamonds}</div>
              <div className="text-[10px] opacity-70 font-medium">Diamonds</div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-lg font-black">🔥 {total.streak}</div>
              <div className="text-[10px] opacity-70 font-medium">Streak</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        {/* Level progress */}
        <div className="card-game p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm">Level {playerLevel}</span>
            <span className="text-xs text-muted-foreground">{total.totalCoins % 200}/200 coins to next</span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${(total.totalCoins % 200) / 2}%` }} />
          </div>
        </div>

        {/* Quick stats */}
        <div className="card-game p-4 mb-4">
          <h3 className="font-bold text-sm mb-3">Your Progress</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <div>
                <p className="font-bold">{total.wordsLearned}</p>
                <p className="text-xs text-muted-foreground">Words Learned</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📖</span>
              <div>
                <p className="font-bold">{total.storiesCompleted}</p>
                <p className="text-xs text-muted-foreground">Stories Done</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <div>
                <p className="font-bold">{total.totalCompletedLevels}</p>
                <p className="text-xs text-muted-foreground">Levels Done</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🌍</span>
              <div>
                <p className="font-bold">{total.completedWorlds}/5</p>
                <p className="text-xs text-muted-foreground">Worlds Done</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-2 mb-4">
          <button
            onClick={() => navigate('/progress')}
            className="w-full card-game p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <BarChart3 className="w-5 h-5 text-game-primary" />
            <span className="flex-1 text-sm font-bold text-left">Detailed Progress</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full card-game p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <Settings className="w-5 h-5 text-game-secondary" />
            <span className="flex-1 text-sm font-bold text-left">Settings</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl
                   border-2 border-red-200 text-red-500 font-bold text-sm
                   hover:bg-red-50 transition-colors active:scale-[0.98] mb-8"
        >
          <LogOut className="w-4 h-4" />
          Switch Account / Logout
        </button>
      </div>
    </div>
  );
}
