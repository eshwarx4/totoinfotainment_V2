import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useGame } from '@/state/GameContext';
import { WorldId, GameRoundResult } from '@/types/game';
import { WordItem } from '@/types/content';
import { getWorldConfig } from '@/config/worlds';
import { fetchWords } from '@/lib/supabaseQueries';
import { transformWordRowToWordItem } from '@/lib/dataTransformers';
import { buildLevelWords } from '@/lib/levelBuilder';
import { ALL_WORDS as LOCAL_WORDS } from '@/data/wordData';
import TapTheImage from '@/components/games/TapTheImage';
import MemoryMatch from '@/components/games/MemoryMatch';
import SpeedChallenge from '@/components/games/SpeedChallenge';
import { X } from 'lucide-react';

const GAME_NAMES = ['', 'Tap the Image', 'Memory Match', 'Speed Challenge'];
const GAME_EMOJIS = ['', '👆', '🧠', '⚡'];

/**
 * Convert local wordData items to the content WordItem format used by game components
 */
function localWordsToContentFormat(localWords: typeof LOCAL_WORDS): WordItem[] {
  return localWords.map(w => ({
    id: w.id,
    english: w.english,
    toto: w.english, // use English as placeholder for Toto text
    transliteration: '',
    imageUrl: w.imageUrl,
    audioToto: w.audioTotoUrl,
    audioEnglish: w.audioEnglishUrl,
    category: w.category,
  }));
}

export default function GameScreen() {
  const { worldId, levelNum, gameNum } = useParams<{
    worldId: string;
    levelNum: string;
    gameNum: string;
  }>();
  const navigate = useNavigate();
  const game = useGame();

  const wid = worldId as WorldId;
  const level = parseInt(levelNum || '1');
  const gameIndex = parseInt(gameNum || '1');
  const worldConfig = getWorldConfig(wid);

  const [allWords, setAllWords] = useState<WordItem[]>([]);
  const [levelWords, setLevelWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Store results from each game
  const [gameResults, setGameResults] = useState<Record<number, GameRoundResult>>({});

  useEffect(() => {
    async function loadWords() {
      try {
        // Try Supabase first
        const rows = await fetchWords();
        if (rows && rows.length > 0) {
          const words = rows.map(transformWordRowToWordItem);
          setAllWords(words);
          const lw = buildLevelWords(words, wid, level, game.learnedWords);
          if (lw.length > 0) {
            setLevelWords(lw);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Supabase fetch failed, using local data:', e);
      }

      // Fallback: use local wordData.ts
      const localFormatted = localWordsToContentFormat(LOCAL_WORDS);
      setAllWords(localFormatted);
      const lw = buildLevelWords(localFormatted, wid, level, game.learnedWords);
      setLevelWords(lw);
      setLoading(false);
    }
    loadWords();
  }, [wid, level]);

  const handleGameComplete = useCallback((result: GameRoundResult) => {
    // Store this game's result
    const updatedResults = { ...gameResults, [gameIndex]: result };
    setGameResults(updatedResults);

    // Mark words as learned
    levelWords.forEach(w => game.markWordLearned(w.id));

    if (gameIndex < 3) {
      // Move to next game
      navigate(`/level/${wid}/${level}/game/${gameIndex + 1}`, { replace: true });
    } else {
      // All 3 games done — navigate to level complete with results
      const resultsParam = encodeURIComponent(JSON.stringify(updatedResults));
      navigate(`/level/${wid}/${level}/complete?results=${resultsParam}`, { replace: true });
    }
  }, [gameIndex, gameResults, wid, level, navigate, levelWords, game]);

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${worldConfig.bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-5xl mb-4 mascot-bounce">🎮</div>
          <p className="text-white/80 font-bold text-lg drop-shadow">Preparing game...</p>
        </div>
      </div>
    );
  }

  if (levelWords.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${worldConfig.bgGradient} flex items-center justify-center px-6`}>
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl max-w-sm border border-white/50">
          <div className="text-5xl mb-4">😞</div>
          <h2 className="text-xl font-bold mb-2 text-gray-800">No Words Available</h2>
          <p className="text-gray-500 mb-4 text-sm">
            There aren't enough words in the "{worldConfig.category}" category yet.
          </p>
          <button
            onClick={() => navigate(`/world/${wid}`)}
            className="bg-gray-800 text-white font-bold px-6 py-3 rounded-xl active:scale-95 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen screen-enter"
      style={{
        background: `linear-gradient(180deg, #f8fafc 0%, #f1f5f9 40%, #e2e8f0 100%)`
      }}
    >
      {/* Game header bar */}
      <div className="sticky top-0 z-30 backdrop-blur-xl border-b border-gray-200/60"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.92), rgba(248,250,252,0.95))`
        }}
      >
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2.5">
            <button
              onClick={() => navigate(`/world/${wid}`)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                         transition-all active:scale-90"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg">{GAME_EMOJIS[gameIndex]}</span>
              <span className="text-sm font-bold text-gray-700">
                {GAME_NAMES[gameIndex]}
              </span>
            </div>
            <div className={`text-[11px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${worldConfig.bgGradient} text-white shadow-sm`}>
              {worldConfig.icon} Lv.{level}
            </div>
          </div>
          {/* 3-step progress */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map(g => (
              <div key={g} className="h-2 flex-1 rounded-full overflow-hidden bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${g < gameIndex ? `bg-gradient-to-r ${worldConfig.bgGradient}`
                      : g === gameIndex ? `bg-gradient-to-r ${worldConfig.bgGradient} opacity-70`
                        : ''
                    }`}
                  style={{ width: g <= gameIndex ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {[1, 2, 3].map(g => (
              <span key={g} className={`text-[10px] font-medium ${g <= gameIndex ? 'text-gray-600' : 'text-gray-400'
                }`}>
                {GAME_NAMES[g]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Game area */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {gameIndex === 1 && (
          <TapTheImage
            words={levelWords}
            allWords={allWords}
            onComplete={handleGameComplete}
          />
        )}
        {gameIndex === 2 && (
          <MemoryMatch
            words={levelWords}
            onComplete={handleGameComplete}
          />
        )}
        {gameIndex === 3 && (
          <SpeedChallenge
            words={levelWords}
            allWords={allWords}
            onComplete={handleGameComplete}
          />
        )}
      </div>
    </div>
  );
}
