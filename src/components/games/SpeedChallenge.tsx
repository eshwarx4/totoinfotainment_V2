import { useState, useEffect, useRef, useCallback } from 'react';
import { WordItem } from '@/types/content';
import { GameRoundResult } from '@/types/game';
import { shuffle, generateOptions } from '@/lib/gameUtils';
import { getEmojiImageUrl } from '@/lib/emojiImages';
import { Timer, Zap } from 'lucide-react';

interface Props {
  words: WordItem[];
  allWords: WordItem[];
  onComplete: (result: GameRoundResult) => void;
}

const GAME_DURATION = 30; // seconds

export default function SpeedChallenge({ words, allWords, onComplete }: Props) {
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [options, setOptions] = useState<WordItem[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Build a shuffled question queue from words (repeat to fill time)
  const questionQueue = useRef<WordItem[]>([]);

  useEffect(() => {
    // Create repeating queue
    const repeated = [...words, ...words, ...words, ...words]; // enough for 30s
    questionQueue.current = shuffle(repeated);
  }, [words]);

  const currentWord = questionQueue.current[round];

  // Use allWords or fall back to words themselves for options
  const optionPool = allWords.length > 0 ? allWords : words;

  // Generate options when round changes OR when game starts OR when optionPool changes
  useEffect(() => {
    if (!currentWord || gameOver || !gameStarted) return;
    if (optionPool.length === 0) return;
    const optionCount = Math.min(4, optionPool.length);
    if (optionCount < 2) return; // need at least 2 options
    setOptions(generateOptions(currentWord, optionPool, optionCount));
    setFeedback(null);
  }, [round, gameOver, gameStarted, optionPool.length]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameStarted, gameOver]);

  // End game when time runs out
  useEffect(() => {
    if (gameOver && gameStarted) {
      setTimeout(() => {
        onComplete({
          correct,
          total,
          timeBonus: correct * 2,
        });
      }, 500);
    }
  }, [gameOver]);

  const handleSelect = useCallback((wordId: string) => {
    if (feedback || gameOver || !currentWord) return;

    setTotal(prev => prev + 1);
    const isCorrect = wordId === currentWord.id;

    if (isCorrect) {
      setCorrect(prev => prev + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    // Quick transition
    setTimeout(() => {
      if (round < questionQueue.current.length - 1) {
        setRound(prev => prev + 1);
      } else {
        setGameOver(true);
      }
    }, 400);
  }, [feedback, gameOver, round, currentWord]);

  // Start screen
  if (!gameStarted) {
    return (
      <div className="text-center animate-fade-in py-10">
        <Zap className="w-16 h-16 mx-auto mb-4 text-game-secondary" />
        <h2 className="text-2xl font-bold mb-2">Speed Challenge!</h2>
        <p className="text-muted-foreground mb-2">
          Answer as many as you can in {GAME_DURATION} seconds!
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Match the word to the correct image — fast!
        </p>
        <button
          onClick={() => setGameStarted(true)}
          className="btn-game-accent text-xl px-10"
        >
          GO! ⚡
        </button>
      </div>
    );
  }

  if (!currentWord) return null;

  const timerPercent = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timeLeft > 10 ? 'bg-game-primary' : timeLeft > 5 ? 'bg-game-secondary' : 'bg-game-wrong';

  return (
    <div className="animate-fade-in">
      {/* Timer bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'text-game-wrong animate-pulse' : 'text-muted-foreground'}`} />
            <span className={`text-sm font-bold ${timeLeft <= 5 ? 'text-game-wrong' : ''}`}>
              {timeLeft}s
            </span>
          </div>
          <span className="text-sm font-bold text-game-primary">
            {correct} correct
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-5">
        <div className="inline-block bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-100">
          <p className="text-lg font-bold">{currentWord.english}</p>
          <p className="text-xs text-muted-foreground">Which image?</p>
        </div>
      </div>

      {/* Options */}
      {options.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5">
          {options.map(option => {
            const isCorrectOption = option.id === currentWord.id;
            const showCorrect = feedback && isCorrectOption;

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={!!feedback}
                className={`rounded-xl overflow-hidden transition-all duration-150 ${showCorrect ? 'ring-3 ring-game-correct scale-105' :
                  'bg-white border border-gray-100 shadow-sm active:scale-95'
                  }`}
              >
                <div className="aspect-square bg-gray-50 relative">
                  <img
                    src={option.imageUrl}
                    alt={option.english}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = getEmojiImageUrl(option.english, option.category); }}
                  />
                  {showCorrect && (
                    <div className="absolute inset-0 bg-game-correct/20 flex items-center justify-center">
                      <span className="text-3xl">✅</span>
                    </div>
                  )}
                </div>
                <div className="py-1.5 px-2 bg-white">
                  <p className="text-xs font-bold truncate text-center">{option.english}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Loading options...</p>
        </div>
      )}
    </div>
  );
}
