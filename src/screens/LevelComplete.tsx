import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { useGame } from '@/state/GameContext';
import { WorldId, GameRoundResult } from '@/types/game';
import { getWorldConfig } from '@/config/worlds';
import { buildLevelResult } from '@/lib/scoring';
import { Confetti } from '@/components/effects/Confetti';
import { Star } from 'lucide-react';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Something went wrong...</p>
          <button onClick={() => navigate(`/world/${wid}`)} className="btn-game-primary mt-4">
            Back to World
          </button>
        </div>
      </div>
    );
  }

  const emoji = levelResult.stars === 3 ? '🏆' : levelResult.stars === 2 ? '🎉' : '💪';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 screen-enter">
      {showConfetti && <Confetti />}

      {/* Emoji */}
      <div className="text-7xl mb-4 animate-bounce-in">{emoji}</div>

      {/* Title */}
      <h1 className="text-3xl font-black mb-1">Level Complete!</h1>
      <p className="text-muted-foreground mb-6">
        {worldConfig.name} — Level {level}
      </p>

      {/* Star reveal */}
      <div className="flex gap-3 mb-6">
        {[1, 2, 3].map(s => (
          <Star
            key={s}
            className={`w-14 h-14 transition-all duration-500 ${s <= showStars && s <= levelResult.stars
              ? 'fill-game-star text-game-star animate-star-reveal'
              : 'fill-gray-200 text-gray-200'
              }`}
            style={{ animationDelay: `${s * 0.3}s` }}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="card-game w-full max-w-sm p-5 mb-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Accuracy</p>
            <p className="text-2xl font-bold text-game-primary">{levelResult.overallAccuracy}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Coins Earned</p>
            <p className="text-2xl font-bold text-amber-500">🪙 +{levelResult.coinsEarned}</p>
          </div>
          {levelResult.diamondsEarned > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Diamonds</p>
              <p className="text-2xl font-bold text-blue-500">💎 +{levelResult.diamondsEarned}</p>
            </div>
          )}
        </div>

        {/* Game breakdown */}
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tap the Image</span>
            <span className="font-bold">{levelResult.game1Accuracy}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Memory Match</span>
            <span className="font-bold">{levelResult.game2Accuracy}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Speed Challenge</span>
            <span className="font-bold">{levelResult.game3Accuracy}%</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={() => navigate(`/level/${wid}/${level}/intro`)}
          className="flex-1 btn-game-secondary text-base"
        >
          Replay 🔄
        </button>
        <button
          onClick={() => navigate(`/world/${wid}`)}
          className="flex-1 btn-game-primary text-base"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
