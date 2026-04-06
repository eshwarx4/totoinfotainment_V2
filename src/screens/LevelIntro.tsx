import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useGame } from '@/state/GameContext';
import { getWorldConfig, getLevelConfig } from '@/config/worlds';
import { WorldId } from '@/types/game';
import { WordItem } from '@/types/content';
import { fetchWords } from '@/lib/supabaseQueries';
import { transformWordRowToWordItem } from '@/lib/dataTransformers';
import { buildLevelWords } from '@/lib/levelBuilder';

export default function LevelIntro() {
  const { worldId, levelNum } = useParams<{ worldId: string; levelNum: string }>();
  const navigate = useNavigate();
  const game = useGame();
  const [levelWords, setLevelWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);

  const wid = worldId as WorldId;
  const level = parseInt(levelNum || '1');
  const worldConfig = getWorldConfig(wid);
  const levelConfig = getLevelConfig(level);

  useEffect(() => {
    async function loadWords() {
      try {
        const rows = await fetchWords();
        const allWords = rows.map(transformWordRowToWordItem);
        const words = buildLevelWords(allWords, wid, level, game.learnedWords);
        setLevelWords(words);
      } catch (e) {
        console.error('Failed to load level words:', e);
      } finally {
        setLoading(false);
      }
    }
    loadWords();
  }, [wid, level]);

  const handleStart = () => {
    navigate(`/level/${wid}/${level}/game/1`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 mascot-bounce">🦉</div>
          <p className="text-muted-foreground font-semibold">Loading level...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 screen-enter">
      {/* Mascot */}
      <div className="speech-bubble max-w-xs mb-4">
        <p className="text-sm font-semibold text-center">
          {worldConfig.mascotMessage.replace('Welcome to', `Level ${level} in`)}
        </p>
      </div>
      <div className="text-6xl mb-6 mascot-bounce">🦉</div>

      {/* Level info */}
      <div className={`text-center mb-6`}>
        <div className={`inline-block bg-gradient-to-br ${worldConfig.bgGradient} text-white px-4 py-1.5 rounded-full text-sm font-bold mb-3`}>
          {worldConfig.name} — Level {level}
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {levelWords.length} words to learn!
        </h2>
        <p className="text-muted-foreground text-sm">
          3 games: Tap the Image → Memory Match → Speed Challenge
        </p>
      </div>

      {/* Word preview */}
      <div className="w-full max-w-sm mb-8">
        <h3 className="text-sm font-bold text-muted-foreground mb-3 text-center">WORDS IN THIS LEVEL</h3>
        <div className="grid grid-cols-3 gap-3">
          {levelWords.map(word => (
            <div key={word.id} className="card-game p-3 text-center">
              <div className="w-full aspect-square rounded-xl bg-muted mb-2 overflow-hidden">
                <img
                  src={word.imageUrl}
                  alt={word.english}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
              </div>
              <p className="text-xs font-bold truncate">{word.english}</p>
              <p className="text-xs text-muted-foreground truncate">{word.toto}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button onClick={handleStart} className="btn-game-primary text-xl px-12">
        Start! 🎮
      </button>

      {/* Back link */}
      <button
        onClick={() => navigate(`/world/${wid}`)}
        className="mt-4 text-muted-foreground font-semibold hover:text-foreground transition-colors"
      >
        ← Back to {worldConfig.name}
      </button>
    </div>
  );
}
