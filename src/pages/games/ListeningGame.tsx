import { useState, useEffect, useCallback, useRef } from 'react';
import { GameHeader } from '@/components/games/GameHeader';
import { GameComplete } from '@/components/games/GameComplete';
import { CoinPopup } from '@/components/effects/CoinPopup';
import { useCoins } from '@/contexts/CoinContext';
import { Button } from '@/components/ui/button';
import { WordItem } from '@/types/content';
import { fetchWords } from '@/lib/supabaseQueries';
import { transformWordRowToWordItem } from '@/lib/dataTransformers';
import { pickRandom, generateOptions } from '@/lib/gameUtils';
import { COIN_REWARDS } from '@/types/gamification';
import { Loader2, Volume2 } from 'lucide-react';

const TOTAL_ROUNDS = 8;

export default function ListeningGame() {
  const coinSystem = useCoins();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [allWords, setAllWords] = useState<WordItem[]>([]);
  const [gameWords, setGameWords] = useState<WordItem[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [options, setOptions] = useState<WordItem[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [coinPopup, setCoinPopup] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const initGame = useCallback(async () => {
    setLoading(true);
    setRound(0);
    setScore(0);
    setSelected(null);
    setGameComplete(false);
    setCoinsEarned(0);
    setTotalEarned(0);

    try {
      const wordRows = await fetchWords();
      const words = wordRows.map(transformWordRowToWordItem);
      // Only use words that have audio
      const wordsWithAudio = words.filter(
        (w) => w.audioToto && (w.audioToto.startsWith('http') || w.audioToto.startsWith('/'))
      );
      setAllWords(wordsWithAudio.length >= 4 ? wordsWithAudio : words);
      const pool = wordsWithAudio.length >= 4 ? wordsWithAudio : words;
      const selected = pickRandom(pool, Math.min(TOTAL_ROUNDS, pool.length));
      setGameWords(selected);
      if (selected.length > 0) {
        setOptions(generateOptions(selected[0], pool, 4));
      }
    } catch (error) {
      console.error('Failed to load words:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const currentWord = gameWords[round];

  const playAudio = () => {
    if (!currentWord?.audioToto) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(currentWord.audioToto);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.play().catch(() => setIsPlaying(false));
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
  };

  const handleAnswer = (wordId: string) => {
    if (selected) return;
    setSelected(wordId);

    const isCorrect = wordId === currentWord.id;
    let earned = 0;

    if (isCorrect) {
      setScore((s) => s + 1);
      earned = COIN_REWARDS.CORRECT_QUIZ_ANSWER;
      coinSystem.addCoins(earned);
      setTotalEarned((t) => t + earned);
      setCoinPopup(earned);
    }

    setTimeout(() => {
      if (round + 1 >= gameWords.length) {
        const finalScore = isCorrect ? score + 1 : score;
        const completionCoins = COIN_REWARDS.COMPLETE_GAME;
        coinSystem.addCoins(completionCoins);
        const isPerfect = finalScore === gameWords.length;
        const total = totalEarned + (isCorrect ? earned : 0) + completionCoins + (isPerfect ? COIN_REWARDS.PERFECT_GAME : 0);
        if (isPerfect) coinSystem.addCoins(COIN_REWARDS.PERFECT_GAME);
        setCoinsEarned(total);
        coinSystem.updateGameStats('listeningGame', finalScore, isPerfect);
        setGameComplete(true);
      } else {
        const nextRound = round + 1;
        setRound(nextRound);
        setSelected(null);
        setOptions(generateOptions(gameWords[nextRound], allWords, 4));
      }
    }, 1200);
  };

  if (gameComplete) {
    return (
      <GameComplete
        title="Listening Game Complete!"
        score={score}
        totalQuestions={gameWords.length}
        coinsEarned={coinsEarned}
        isPerfect={score === gameWords.length}
        onPlayAgain={initGame}
      />
    );
  }

  return (
    <div>
      <GameHeader
        title="Listening Game"
        score={score}
        round={`${round + 1}/${gameWords.length}`}
      />
      {coinPopup !== null && (
        <CoinPopup amount={coinPopup} onDone={() => setCoinPopup(null)} />
      )}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {loading || !currentWord ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">
                Listen to the Toto word and pick the correct English meaning
              </p>
              <Button
                size="lg"
                onClick={playAudio}
                className="gap-2 px-8 py-6 text-lg rounded-full"
                disabled={isPlaying}
              >
                <Volume2 className={`h-6 w-6 ${isPlaying ? 'animate-pulse' : ''}`} />
                {isPlaying ? 'Playing...' : 'Play Audio'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((option) => {
                const isCorrect = option.id === currentWord.id;
                const isSelected = selected === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id)}
                    disabled={!!selected}
                    className={`
                      p-5 rounded-xl border-2 text-center transition-all
                      ${
                        selected
                          ? isCorrect
                            ? 'border-success bg-success/10'
                            : isSelected
                              ? 'border-destructive bg-destructive/10 animate-shake'
                              : 'border-border opacity-50'
                          : 'border-border hover:border-primary hover:bg-primary/5'
                      }
                    `}
                  >
                    <span className="text-xl font-semibold">{option.english}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
