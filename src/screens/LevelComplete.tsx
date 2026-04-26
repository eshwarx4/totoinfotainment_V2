import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { useGame } from '@/state/GameContext';
import { WorldId, GameRoundResult } from '@/types/game';
import { getWorldConfig } from '@/config/worlds';
import { buildLevelResult } from '@/lib/scoring';
import { Confetti } from '@/components/effects/Confetti';
import { Star, RotateCcw, ArrowRight } from 'lucide-react';

export default function LevelComplete() {
  const { worldId, levelNum } = useParams<{ worldId: string; levelNum: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const game = useGame();

  const wid = worldId as WorldId;
  const level = parseInt(levelNum || '1');
  const worldConfig = getWorldConfig(wid);

  const [showStars, setShowStars] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [saved, setSaved] = useState(false);

  // Parse results from URL params
  const results = useMemo(() => {
    try {
      const raw = searchParams.get('results');
      if (!raw) return null;
      return JSON.parse(decodeURIComponent(raw)) as Record<number, GameRoundResult>;
    } catch {
      return null;
    }
  }, [searchParams]);

  const levelResult = useMemo(() => {
    if (!results) return null;
    const g1 = results[1] || { correct: 0, total: 1 };
    const g2 = results[2] || { correct: 0, total: 1 };
    const g3 = results[3] || { correct: 0, total: 1 };
    return buildLevelResult(g1, g2, g3);
  }, [results]);

  // Save results once
  useEffect(() => {
    if (levelResult && !saved) {
      game.completeLevel(wid, level, levelResult);
      game.updateStreak();
      setSaved(true);
    }
  }, [levelResult, saved]);

  // Animate stars reveal
  useEffect(() => {
    if (!levelResult) return;
    const timers = [
      setTimeout(() => setShowStars(1), 400),
      setTimeout(() => setShowStars(2), 800),
      setTimeout(() => setShowStars(3), 1200),
    ];
    if (levelResult.stars === 3) {
      timers.push(setTimeout(() => setShowConfetti(true), 1300));
    }
    return () => timers.forEach(clearTimeout);
  }, [levelResult]);

  if (!levelResult) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${worldConfig.bgGradient} flex items-center justify-center`}>
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl max-w-sm border border-white/50">
          <p className="text-gray-500 mb-3">Something went wrong...</p>
          <button onClick={() => navigate(`/world/${wid}`)}
            className="bg-gray-800 text-white font-bold px-6 py-3 rounded-xl active:scale-95 transition-all">
            Back to World
          </button>
        </div>
      </div>
    );
  }

  const emoji = levelResult.stars === 3 ? '🏆' : levelResult.stars === 2 ? '🎉' : '💪';
  const title = levelResult.stars === 3 ? 'Perfect!' : levelResult.stars === 2 ? 'Great Job!' : 'Level Complete!';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${worldConfig.bgGradient} flex flex-col items-center justify-center px-6 screen-enter`}>
      {showConfetti && <Confetti />}

      {/* Radial glow behind emoji */}
      <div className="relative mb-2">
        <div className="absolute inset-0 w-32 h-32 -ml-6 -mt-6 rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.5) 0%, transparent 70%)' }} />
        <div className="text-7xl animate-bounce-in relative z-10">{emoji}</div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-black text-white drop-shadow-lg mb-1">{title}</h1>
      <div className="bg-black/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-white/80 text-sm font-bold mb-5 shadow-sm">
        {worldConfig.icon} {worldConfig.name} — Level {level}
      </div>

      {/* Star reveal */}
      <div className="flex gap-4 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="relative">
            <Star
              className={`w-16 h-16 transition-all duration-500 drop-shadow-lg ${s <= showStars && s <= levelResult.stars
                ? 'fill-yellow-400 text-yellow-500'
                : 'fill-white/20 text-white/30'
                }`}
              style={{
                animationDelay: `${s * 0.3}s`,
                transform: s <= showStars && s <= levelResult.stars ? 'scale(1)' : 'scale(0.8)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Stats card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl w-full max-w-sm p-6 mb-6 shadow-xl border border-white/50">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Accuracy</p>
            <p className="text-2xl font-black text-emerald-600">{levelResult.overallAccuracy}%</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Coins</p>
            <p className="text-2xl font-black text-amber-500">🪙 +{levelResult.coinsEarned}</p>
          </div>
          {levelResult.diamondsEarned > 0 && (
            <div className="col-span-2 bg-blue-50 rounded-2xl p-3">
              <p className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">Diamonds</p>
              <p className="text-2xl font-black text-blue-500">💎 +{levelResult.diamondsEarned}</p>
            </div>
          )}
        </div>

        {/* Game breakdown */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
          {[
            { name: '👆 Tap the Image', acc: levelResult.game1Accuracy },
            { name: '🧠 Memory Match', acc: levelResult.game2Accuracy },
            { name: '⚡ Speed Challenge', acc: levelResult.game3Accuracy },
          ].map(g => (
            <div key={g.name} className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">{g.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${g.acc}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-700 w-10 text-right">{g.acc}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={() => navigate(`/level/${wid}/${level}/intro`)}
          className="flex-1 bg-white/30 backdrop-blur-sm text-white font-bold py-3.5 rounded-2xl
                     border border-white/30 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Replay
        </button>
        <button
          onClick={() => navigate(`/world/${wid}`)}
          className="flex-1 bg-white text-gray-800 font-bold py-3.5 rounded-2xl shadow-lg
                     active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
