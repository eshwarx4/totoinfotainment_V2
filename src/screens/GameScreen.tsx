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

const GAME_NAMES = ['', 'Tap the Image', 'Memory Match', 'Speed Challenge'];

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 mascot-bounce">🎮</div>
          <p className="text-muted-foreground font-semibold">Preparing game...</p>
        </div>
      </div>
    );
  }

  if (levelWords.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">😞</div>
          <h2 className="text-xl font-bold mb-2">No Words Available</h2>
          <p className="text-muted-foreground mb-4">
            There aren't enough words in the "{worldConfig.category}" category yet.
          </p>
          <button
            onClick={() => navigate(`/world/${wid}`)}
            className="btn-game-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white screen-enter">
      {/* Game progress bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(`/world/${wid}`)}
              className="text-sm text-muted-foreground font-semibold hover:text-foreground"
            >
              ✕ Quit
            </button>
            <span className="text-sm font-bold">
              Game {gameIndex}/3: {GAME_NAMES[gameIndex]}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${worldConfig.bgGradient} text-white`}>
              Lv.{level}
            </span>
          </div>
          {/* 3-step progress */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map(g => (
              <div
                key={g}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${g < gameIndex ? 'bg-game-primary' :
                    g === gameIndex ? 'bg-game-primary/60' :
                      'bg-muted'
                  }`}
              />
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
