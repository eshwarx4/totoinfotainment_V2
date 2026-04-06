import { useState, useEffect, useCallback } from 'react';
import { GameHeader } from '@/components/games/GameHeader';
import { GameComplete } from '@/components/games/GameComplete';
import { CoinPopup } from '@/components/effects/CoinPopup';
import { useCoins } from '@/contexts/CoinContext';
import { WordItem } from '@/types/content';
import { fetchWords } from '@/lib/supabaseQueries';
import { transformWordRowToWordItem } from '@/lib/dataTransformers';
import { pickRandom, generateOptions } from '@/lib/gameUtils';
import { COIN_REWARDS } from '@/types/gamification';
import { Loader2 } from 'lucide-react';

const TOTAL_ROUNDS = 10;

export default function PictureQuiz() {
  const coinSystem = useCoins();
  const [allWords, setAllWords] = useState<WordItem[]>([]);
  const [gameWords, setGameWords] = useState<WordItem[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [options, setOptions] = useState<WordItem[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [coinPopup, setCoinPopup] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const initGame = useCallback(async () => {
    setLoading(true);
    setRound(0);
    setScore(0);
    setStreak(0);
    setSelected(null);
    setGameComplete(false);
    setCoinsEarned(0);
    setTotalEarned(0);

    try {
      const wordRows = await fetchWords();
      const words = wordRows.map(transformWordRowToWordItem);
      setAllWords(words);
      const selected = pickRandom(words, Math.min(TOTAL_ROUNDS, words.length));
      setGameWords(selected);
      if (selected.length > 0) {
        setOptions(generateOptions(selected[0], words, 4));
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

  const handleAnswer = (wordId: string) => {
    if (selected) return;
    setSelected(wordId);

    const isCorrect = wordId === currentWord.id;
    let earned = 0;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore((s) => s + 1);
      const multiplier = Math.min(newStreak, 3);
      earned = COIN_REWARDS.CORRECT_QUIZ_ANSWER * multiplier;
      coinSystem.addCoins(earned);
      setTotalEarned((t) => t + earned);
      setCoinPopup(earned);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (round + 1 >= gameWords.length) {
        const finalScore = isCorrect ? score + 1 : score;
        const bonus = isCorrect ? earned : 0;
        const completionCoins = COIN_REWARDS.COMPLETE_QUIZ;
        coinSystem.addCoins(completionCoins);
        const isPerfect = finalScore === gameWords.length;
        const totalCoins = totalEarned + bonus + completionCoins + (isPerfect ? COIN_REWARDS.PERFECT_GAME : 0);
        if (isPerfect) coinSystem.addCoins(COIN_REWARDS.PERFECT_GAME);
        setCoinsEarned(totalCoins);
        coinSystem.updateGameStats('pictureQuiz', finalScore, isPerfect);
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
        title="Picture Quiz Complete!"
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
        title="Picture Quiz"
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
          <div className="space-y-6 animate-fade-in">
            {/* Streak indicator */}
            {streak > 1 && (
              <div className="text-center text-sm font-semibold text-accent animate-bounce-subtle">
                {streak}x Streak!
              </div>
            )}

            {/* Image */}
            <div className="flex justify-center">
              <img
                src={currentWord.imageUrl}
                alt="What is this?"
                className="w-48 h-48 object-contain rounded-xl shadow-md"
              />
            </div>

            <p className="text-center text-lg text-muted-foreground">
              What is the Toto word for this?
            </p>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {options.map((option) => {
                const isCorrect = option.id === currentWord.id;
                const isSelected = selected === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id)}
                    disabled={!!selected}
                    className={`
                      p-4 rounded-xl border-2 text-center font-semibold transition-all
                      ${
                        selected
                          ? isCorrect
                            ? 'border-success bg-success/10 text-success'
                            : isSelected
                              ? 'border-destructive bg-destructive/10 text-destructive animate-shake'
                              : 'border-border opacity-50'
                          : 'border-border hover:border-primary hover:bg-primary/5'
                      }
                    `}
                  >
                    <span className="text-lg">{option.toto}</span>
                    <span className="block text-xs text-muted-foreground mt-1">
                      {option.english}
                    </span>
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
