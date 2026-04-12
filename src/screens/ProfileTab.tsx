import { useState } from 'react';
import { useGame } from '@/state/GameContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogOut, ChevronRight, BarChart3, Settings, Globe, X } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function ProfileTab() {
  const game = useGame();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const total = game.getTotalProgress();
  const playerLevel = Math.floor(total.totalCoins / 200) + 1;
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Calculate rank among all users
  const allUsers = game.listUsers();
  const sortedByCoins = [...allUsers].sort((a, b) => b.totalCoins - a.totalCoins);
  const rank = sortedByCoins.findIndex(u => u.userId === game.userId) + 1;

  const handleLogout = () => {
    game.logout();
    navigate('/', { replace: true });
  };

  const languageLabel = language === 'bn' ? 'বাংলা' : 'English';

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
                {t('profileTab.level')} {playerLevel} · {game.playerRole}
                {rank > 0 && <span className="ml-2 bg-white/20 rounded-full px-2 py-0.5 text-xs font-bold">🏆 {t('profileTab.rank')} #{rank}</span>}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-lg font-black">🪙 {total.totalCoins}</div>
              <div className="text-[10px] opacity-70 font-medium">{t('profileTab.coins')}</div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-lg font-black">💎 {total.totalDiamonds}</div>
              <div className="text-[10px] opacity-70 font-medium">{t('profileTab.diamonds')}</div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-lg font-black">🔥 {total.streak}</div>
              <div className="text-[10px] opacity-70 font-medium">{t('profileTab.streak')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        {/* Level progress */}
        <div className="card-game p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm">{t('profileTab.level')} {playerLevel}</span>
            <span className="text-xs text-muted-foreground">{total.totalCoins % 200}/200 {t('common.coinsToNext')}</span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${(total.totalCoins % 200) / 2}%` }} />
          </div>
        </div>

        {/* Quick stats */}
        <div className="card-game p-4 mb-4">
          <h3 className="font-bold text-sm mb-3">{t('profileTab.yourProgress')}</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <div>
                <p className="font-bold">{total.wordsLearned}</p>
                <p className="text-xs text-muted-foreground">{t('profileTab.wordsLearned')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📖</span>
              <div>
                <p className="font-bold">{total.storiesCompleted}</p>
                <p className="text-xs text-muted-foreground">{t('profileTab.storiesDone')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <div>
                <p className="font-bold">{total.totalCompletedLevels}</p>
                <p className="text-xs text-muted-foreground">{t('profileTab.levelsDone')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🌍</span>
              <div>
                <p className="font-bold">{total.completedWorlds}/5</p>
                <p className="text-xs text-muted-foreground">{t('profileTab.worldsDone')}</p>
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
            <span className="flex-1 text-sm font-bold text-left">{t('profileTab.detailedProgress')}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Language selector */}
          <button
            onClick={() => setShowLanguageModal(true)}
            className="w-full card-game p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <Globe className="w-5 h-5 text-blue-500" />
            <span className="flex-1 text-sm font-bold text-left">{t('profileTab.language')}</span>
            <span className="text-sm text-muted-foreground">{languageLabel}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="w-full card-game p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <Settings className="w-5 h-5 text-game-secondary" />
            <span className="flex-1 text-sm font-bold text-left">{t('profileTab.settings')}</span>
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
          {t('profileTab.switchAccount')}
        </button>
      </div>

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-fade-in-scale shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{t('settings.appLanguage')}</h2>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <LanguageSelector
              variant="card"
              showTitle={false}
              onSelect={() => setShowLanguageModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
