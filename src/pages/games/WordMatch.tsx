import { useState, useEffect } from 'react';
import { GameHeader } from '@/components/games/GameHeader';
import { GameComplete } from '@/components/games/GameComplete';
import { MemoryCard } from '@/components/games/MemoryCard';
import { useCoins } from '@/contexts/CoinContext';
import { WordItem } from '@/types/content';
import { fetchWords } from '@/lib/supabaseQueries';
import { transformWordRowToWordItem } from '@/lib/dataTransformers';
import { pickRandom, shuffle } from '@/lib/gameUtils';
import { Loader2 } from 'lucide-react';

interface Card {
  id: string;
  pairId: string;
  content: string;
  type: 'toto' | 'english';
}

export default function WordMatch() {
  const coinSystem = useCoins();
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalPairs, setTotalPairs] = useState(0);

  const initGame = async () => {
    setLoading(true);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameComplete(false);
    setCoinsEarned(0);

    try {
      const wordRows = await fetchWords();
      const allWords = wordRows.map(transformWordRowToWordItem);
      const gameWords = pickRandom(allWords, 6);
      setTotalPairs(gameWords.length);

      const cardPairs: Card[] = [];
      gameWords.forEach((word) => {
        cardPairs.push({
          id: `${word.id}-toto`,
          pairId: word.id,
          content: word.toto,
          type: 'toto',
        });
        cardPairs.push({
          id: `${word.id}-eng`,
          pairId: word.id,
          content: word.english,
          type: 'english',
        });
      });

      setCards(shuffle(cardPairs));
    } catch (error) {
      console.error('Failed to load words:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2) return;
    if (flipped.includes(index)) return;
    if (matched.includes(cards[index].pairId)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].pairId === cards[second].pairId && cards[first].type !== cards[second].type) {
        const newMatched = [...matched, cards[first].pairId];
        setMatched(newMatched);
        setFlipped([]);

        if (newMatched.length === totalPairs) {
          const moveBonus = Math.max(0, (totalPairs * 3 - moves) * 2);
          const isPerfect = moves + 1 <= totalPairs;
          const earned = isPerfect ? 50 : 30 + moveBonus;
          setCoinsEarned(earned);
          coinSystem.updateGameStats('wordMatch', newMatched.length, isPerfect);
          setGameComplete(true);
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  if (gameComplete) {
    return (
      <GameComplete
        title="Word Match Complete!"
        score={matched.length}
        totalQuestions={totalPairs}
        coinsEarned={coinsEarned}
        isPerfect={moves <= totalPairs}
        onPlayAgain={initGame}
      />
    );
  }

  return (
    <div>
      <GameHeader
        title="Word Match"
        score={matched.length}
        round={`Moves: ${moves}`}
      />
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <p className="text-center text-muted-foreground mb-4 text-sm">
              Match each Toto word with its English translation
            </p>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-lg mx-auto">
              {cards.map((card, index) => (
                <MemoryCard
                  key={card.id}
                  content={card.content}
                  isFlipped={flipped.includes(index)}
                  isMatched={matched.includes(card.pairId)}
                  onClick={() => handleCardClick(index)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
