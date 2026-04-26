import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useGame } from '@/state/GameContext';
import { getWorldConfig, getLevelConfig } from '@/config/worlds';
import { WorldId } from '@/types/game';
import { WordItem } from '@/types/content';
import { fetchWords } from '@/lib/supabaseQueries';
import { transformWordRowToWordItem } from '@/lib/dataTransformers';
import { buildLevelWords } from '@/lib/levelBuilder';
import { ArrowLeft, Zap } from 'lucide-react';

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
      <div className={`min-h-screen bg-gradient-to-br ${worldConfig.bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-6xl mb-4 mascot-bounce">🦉</div>
          <p className="text-white/80 font-bold text-lg drop-shadow">Loading level...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${worldConfig.bgGradient} flex flex-col screen-enter`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(`/world/${wid}`)}
            className="flex items-center gap-1.5 text-white/80 hover:text-white font-semibold text-sm
                       bg-black/15 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="bg-black/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-1.5">
            <span className="text-base">{worldConfig.icon}</span>
            {worldConfig.name}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Mascot speech */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-3 mb-3 shadow-lg max-w-xs border border-white/50">
          <p className="text-sm font-semibold text-center text-gray-700">
            {worldConfig.mascotMessage.replace('Welcome to', `Level ${level} in`)}
          </p>
        </div>
        {/* Mascot arrow */}
        <div className="w-3 h-3 bg-white/90 rotate-45 -mt-2 mb-2 shadow-sm" />
        <div className="text-6xl mb-5 mascot-bounce drop-shadow-lg">🦉</div>

        {/* Level badge */}
        <div className="bg-black/20 backdrop-blur-sm text-white px-5 py-2 rounded-full text-sm font-extrabold mb-3
                        shadow-lg border border-white/15 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          {worldConfig.name} — Level {level}
        </div>

        {/* Word count */}
        <h2 className="text-3xl font-black text-white drop-shadow-md mb-1">
          {levelWords.length} words to learn!
        </h2>
        <p className="text-gray-600 text-sm font-medium mb-6">
          3 games: Tap the Image → Memory Match → Speed Challenge
        </p>

        {/* Word preview cards */}
        <div className="w-full max-w-sm mb-8">
          <h3 className="text-xs font-bold text-gray-500 mb-3 text-center tracking-widest uppercase">
            Words in this level
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {levelWords.map(word => (
              <div key={word.id}
                className="bg-white/85 backdrop-blur-sm rounded-2xl p-3 text-center
                           shadow-md border border-white/50 transition-transform active:scale-95">
                <div className="w-full aspect-square rounded-xl bg-gray-100 mb-2 overflow-hidden">
                  <img
                    src={word.imageUrl}
                    alt={word.english}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                </div>
                <p className="text-xs font-bold text-gray-800 truncate">{word.english}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          className="bg-white text-gray-800 font-extrabold text-xl px-14 py-4 rounded-2xl
                     shadow-xl active:scale-95 transition-all duration-150 hover:shadow-2xl
                     border-2 border-white/80"
        >
          Start! 🎮
        </button>
      </div>
    </div>
  );
}
