import { useState, useEffect } from 'react';
import { WordItem } from '@/types/content';
import { GameRoundResult } from '@/types/game';
import { shuffle } from '@/lib/gameUtils';
import { getEmojiImageUrl } from '@/lib/emojiImages';
import { useGameSFX } from '@/hooks/useGameSFX';
import { useTotoLabel } from '@/hooks/useTotoLabel';


interface Card {
  id: string;
  pairId: string;
  type: 'image' | 'word';
  content: string;
  imageUrl?: string;
  category?: string;
}

interface Props {
  words: WordItem[];
  onComplete: (result: GameRoundResult) => void;
}

export default function MemoryMatch({ words, onComplete }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [canFlip, setCanFlip] = useState(true);
  const sfx = useGameSFX();
  const { getTotoLabel } = useTotoLabel();


  // Use up to 4 pairs (all level words, max 4)
  const pairWords = words.slice(0, 4);
  const totalPairs = pairWords.length;

  useEffect(() => {
    const cardPairs: Card[] = [];
    pairWords.forEach((word) => {
      cardPairs.push({ id: `${word.id}-img`, pairId: word.id, type: 'image', content: word.english, imageUrl: word.imageUrl, category: word.category });
      cardPairs.push({ id: `${word.id}-word`, pairId: word.id, type: 'word', content: getTotoLabel(word) });

    });
    setCards(shuffle(cardPairs));
  }, []);

  const handleFlip = (index: number) => {
    if (!canFlip || flipped.includes(index) || matched.includes(cards[index].pairId)) return;

    sfx.playSnap(); // flip sound

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setCanFlip(false);

      const [first, second] = newFlipped;
      const card1 = cards[first];
      const card2 = cards[second];

      if (card1.pairId === card2.pairId && card1.type !== card2.type) {
        // Match found!
        sfx.playCorrect();
        const newMatched = [...matched, card1.pairId];
        setMatched(newMatched);
        setFlipped([]);
        setCanFlip(true);

        if (newMatched.length === totalPairs) {
          setTimeout(() => {
            const perfectMoves = totalPairs;
            const maxMoves = totalPairs * 3;
            const efficiency = Math.max(0, 1 - (moves + 1 - perfectMoves) / (maxMoves - perfectMoves));
            const correctEquivalent = Math.round(efficiency * totalPairs);
            onComplete({ correct: Math.max(1, correctEquivalent), total: totalPairs });
          }, 600);
        }
      } else {
        // Mismatch
        sfx.playWrong();
        setTimeout(() => { setFlipped([]); setCanFlip(true); }, 500); // reduced from 800ms → 500ms
      }
    }
  };

  // Determine grid columns based on card count
  const gridCols = pairWords.length <= 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold mb-1">Memory Match!</h2>
        <p className="text-xs text-muted-foreground">Match images with their words</p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <div className="bg-white rounded-full px-3.5 py-1.5 shadow-sm border border-gray-100 text-sm font-semibold">
          Moves: <span className="text-game-primary">{moves}</span>
        </div>
        <div className="bg-white rounded-full px-3.5 py-1.5 shadow-sm border border-gray-100 text-sm font-semibold">
          Pairs: <span className="text-game-primary">{matched.length}/{totalPairs}</span>
        </div>
      </div>

      {/* Pair progress */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {pairWords.map((w) => (
          <div
            key={w.id}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${matched.includes(w.id) ? 'bg-game-primary scale-125' : 'bg-gray-200'
              }`}
          />
        ))}
      </div>

      {/* Card grid */}
      <div className={`grid ${gridCols} gap-3`}>
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index);
          const isMatched = matched.includes(card.pairId);
          const showFace = isFlipped || isMatched;

          return (
            <button
              key={card.id}
              onClick={() => handleFlip(index)}
              disabled={showFace || !canFlip}
              className="aspect-square rounded-2xl overflow-hidden transition-all duration-200 active:scale-95"
            >
              {!showFace ? (
                /* Card back */
                <div className={`w-full h-full flex items-center justify-center rounded-2xl ${isMatched
                  ? 'bg-green-50 border-2 border-green-400'
                  : 'bg-gradient-to-br from-game-primary to-emerald-600 shadow-md'
                  }`}>
                  {isMatched
                    ? <span className="text-3xl">✅</span>
                    : <span className="text-3xl text-white font-bold">?</span>
                  }
                </div>
              ) : (
                /* Card face */
                <div className={`w-full h-full rounded-2xl border-2 ${isMatched ? 'border-green-400 bg-green-50' : 'border-game-primary bg-white'
                  } flex items-center justify-center overflow-hidden`}>
                  {card.type === 'image' ? (
                    <img
                      src={card.imageUrl}
                      alt={card.content}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getEmojiImageUrl(card.content, card.category);
                      }}
                    />
                  ) : (
                    <div className="text-center p-2">
                      <p className="text-sm font-bold text-foreground">{card.content}</p>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
