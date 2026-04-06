import { useState, useEffect, useRef } from 'react';
import { WordItem } from '@/types/content';
import { GameRoundResult } from '@/types/game';
import { shuffle, generateOptions } from '@/lib/gameUtils';
import { getEmojiImageUrl } from '@/lib/emojiImages';
import { Volume2 } from 'lucide-react';

interface Props {
  words: WordItem[];
  allWords: WordItem[];
  onComplete: (result: GameRoundResult) => void;
}

export default function TapTheImage({ words, allWords, onComplete }: Props) {
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<WordItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentWord = words[round];
  const totalRounds = words.length;

  // Use allWords or fall back to words themselves for options
  const optionPool = allWords.length > 0 ? allWords : words;

  useEffect(() => {
    if (!currentWord) return;
    if (optionPool.length === 0) return;
    const optionCount = Math.min(4, optionPool.length);
    if (optionCount < 2) return;
    const opts = generateOptions(currentWord, optionPool, optionCount);
    setOptions(opts);
    setSelected(null);
    setFeedback(null);

    if (currentWord.audioToto) {
      try {
        const audio = new Audio(currentWord.audioToto);
        audioRef.current = audio;
        audio.play().catch(() => { });
      } catch { }
    }
  }, [round, currentWord, optionPool.length]);

  const playAudio = () => {
    if (currentWord?.audioToto) {
      try {
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(currentWord.audioToto);
        audioRef.current = audio;
        audio.play().catch(() => { });
      } catch { }
    }
  };

  const handleSelect = (wordId: string) => {
    if (selected) return;
    setSelected(wordId);
    const isCorrect = wordId === currentWord.id;

    if (isCorrect) {
      setCorrect(prev => prev + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      if (round < totalRounds - 1) {
        setRound(round + 1);
      } else {
        const finalCorrect = isCorrect ? correct + 1 : correct;
        onComplete({ correct: finalCorrect, total: totalRounds });
      }
    }, 1200);
  };

  if (!currentWord) return null;

  return (
    <div className="animate-fade-in">

      {/* Round progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        {words.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i < round ? 'w-1.5 bg-game-primary' :
              i === round ? 'w-6 bg-game-primary' :
                'w-1.5 bg-gray-200'
              }`}
          />
        ))}
      </div>

      {/* Question */}
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold mb-3">Tap the correct image!</h2>
        <div className="inline-flex items-center gap-2.5 bg-white rounded-2xl px-5 py-3 shadow-game">
          <button
            onClick={playAudio}
            className="w-11 h-11 rounded-full bg-game-primary/10 flex items-center justify-center
                       hover:bg-game-primary/20 active:scale-90 transition-all"
          >
            <Volume2 className="w-5 h-5 text-game-primary" />
          </button>
          <div className="text-left">
            <span className="text-lg font-bold block leading-tight">{currentWord.toto}</span>
            <span className="text-xs text-muted-foreground">{currentWord.english}</span>
          </div>
        </div>
      </div>

      {/* Image options grid */}
      <div className="grid grid-cols-2 gap-3">
        {options.map(option => {
          const isSelected = selected === option.id;
          const isCorrectOption = option.id === currentWord.id;
          const showCorrect = selected && isCorrectOption;
          const showWrong = isSelected && !isCorrectOption;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={!!selected}
              className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${showCorrect ? 'ring-4 ring-game-correct scale-[1.03]' :
                showWrong ? 'ring-4 ring-game-wrong animate-shake' :
                  'card-game active:scale-95'
                }`}
            >
              <div className="aspect-square bg-muted">
                <img
                  src={option.imageUrl}
                  alt={option.english}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = getEmojiImageUrl(option.english, option.category); }}
                />
              </div>
              <div className="p-2 text-center bg-white">
                <p className="text-sm font-bold truncate">{option.english}</p>
              </div>
              {showCorrect && (
                <div className="absolute inset-0 bg-game-correct/20 flex items-center justify-center">
                  <span className="text-4xl animate-bounce-in">✅</span>
                </div>
              )}
              {showWrong && (
                <div className="absolute inset-0 bg-game-wrong/20 flex items-center justify-center">
                  <span className="text-4xl animate-bounce-in">❌</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Score */}
      <div className="text-center mt-4">
        <span className="text-sm font-semibold text-muted-foreground">
          Score: <span className="text-game-primary">{correct}</span>/{round + (selected ? 1 : 0)}
        </span>
      </div>
    </div>
  );
}
