import { useState, useEffect, useCallback } from 'react';
import { GameHeader } from '@/components/games/GameHeader';
import { GameComplete } from '@/components/games/GameComplete';
import { LetterTile } from '@/components/games/LetterTile';
import { CoinPopup } from '@/components/effects/CoinPopup';
import { useCoins } from '@/contexts/CoinContext';
import { Button } from '@/components/ui/button';
import { WordItem } from '@/types/content';
import { fetchWords } from '@/lib/supabaseQueries';
import { transformWordRowToWordItem } from '@/lib/dataTransformers';
import { pickRandom, scrambleLetters } from '@/lib/gameUtils';
import { COIN_REWARDS } from '@/types/gamification';
import { Loader2, RotateCcw, Check } from 'lucide-react';

const TOTAL_ROUNDS = 8;

export default function SpellingBee() {
  const coinSystem = useCoins();
  const [gameWords, setGameWords] = useState<WordItem[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [answer, setAnswer] = useState<number[]>([]);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [coinPopup, setCoinPopup] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const initGame = useCallback(async () => {
    setLoading(true);
    setRound(0);
    setScore(0);
    setAnswer([]);
    setUsedIndices(new Set());
    setFeedback(null);
    setGameComplete(false);
    setCoinsEarned(0);
    setTotalEarned(0);

    try {
      const wordRows = await fetchWords();
      const words = wordRows.map(transformWordRowToWordItem);
      const selected = pickRandom(words, Math.min(TOTAL_ROUNDS, words.length));
      setGameWords(selected);
      if (selected.length > 0) {
        setScrambled(scrambleLetters(selected[0].toto));
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

  const handleLetterClick = (index: number) => {
    if (usedIndices.has(index) || feedback) return;
    setAnswer((prev) => [...prev, index]);
    setUsedIndices((prev) => new Set(prev).add(index));
  };

  const handleRemoveLetter = (answerIndex: number) => {
    if (feedback) return;
    const letterIdx = answer[answerIndex];
    setAnswer((prev) => prev.filter((_, i) => i !== answerIndex));
    setUsedIndices((prev) => {
      const next = new Set(prev);
      next.delete(letterIdx);
      return next;
    });
  };

  const handleClear = () => {
    setAnswer([]);
    setUsedIndices(new Set());
  };

  const handleSubmit = () => {
    const spelled = answer.map((i) => scrambled[i]).join('');
    const isCorrect = spelled.toLowerCase() === currentWord.toto.toLowerCase();

    setFeedback(isCorrect ? 'correct' : 'wrong');

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
        coinSystem.updateGameStats('spellingBee', finalScore, isPerfect);
        setGameComplete(true);
      } else {
        const nextRound = round + 1;
        setRound(nextRound);
        setAnswer([]);
        setUsedIndices(new Set());
        setFeedback(null);
        setScrambled(scrambleLetters(gameWords[nextRound].toto));
      }
    }, 1200);
  };

  if (gameComplete) {
    return (
      <GameComplete
        title="Spelling Bee Complete!"
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
        title="Spelling Bee"
        score={score}
        round={`${round + 1}/${gameWords.length}`}
      />
      {coinPopup !== null && (
        <CoinPopup amount={coinPopup} onDone={() => setCoinPopup(null)} />
      )}
      <main className="container mx-auto px-4 py-6 max-w-lg">
        {loading || !currentWord ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Clue */}
            <div className="text-center space-y-3">
              <img
                src={currentWord.imageUrl}
                alt={currentWord.english}
                className="w-32 h-32 object-contain mx-auto rounded-xl"
              />
              <p className="text-xl font-semibold text-muted-foreground">
                {currentWord.english}
              </p>
              <p className="text-sm text-muted-foreground">
                Spell the Toto word
              </p>
            </div>

            {/* Answer boxes */}
            <div className="flex justify-center gap-2 flex-wrap min-h-[56px]">
              {currentWord.toto.split('').map((_, i) => {
                const letterIdx = answer[i];
                const letter = letterIdx !== undefined ? scrambled[letterIdx] : '';

                return (
                  <button
                    key={i}
                    onClick={() => letterIdx !== undefined && handleRemoveLetter(i)}
                    className={`
                      w-10 h-12 md:w-12 md:h-14 rounded-lg border-2 flex items-center justify-center
                      text-lg font-bold transition-all
                      ${
                        feedback === 'correct'
                          ? 'border-success bg-success/10 text-success'
                          : feedback === 'wrong'
                            ? 'border-destructive bg-destructive/10 text-destructive animate-shake'
                            : letter
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-muted bg-muted/30'
                      }
                    `}
                  >
                    {letter?.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Scrambled letters */}
            <div className="flex justify-center gap-2 flex-wrap">
              {scrambled.map((letter, index) => (
                <LetterTile
                  key={index}
                  letter={letter}
                  isUsed={usedIndices.has(index)}
                  onClick={() => handleLetterClick(index)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={answer.length === 0 || !!feedback}
                className="gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={answer.length !== currentWord.toto.length || !!feedback}
                className="gap-1"
              >
                <Check className="h-4 w-4" />
                Submit
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
