import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VillageMapView } from '@/components/map/VillageMapView';
import { UnlockDialog } from '@/components/map/UnlockDialog';
import { SwipeableWordCard } from '@/components/SwipeableWordCard';
import { Confetti } from '@/components/effects/Confetti';
import { CoinPopup } from '@/components/effects/CoinPopup';
import { useCoins } from '@/contexts/CoinContext';
import { MAP_ZONES } from '@/config/mapZones';
import { COIN_REWARDS } from '@/types/gamification';
import { WordItem } from '@/types/content';
import { fetchWords } from '@/lib/supabaseQueries';
import { transformWordRowToWordItem } from '@/lib/dataTransformers';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function VillageMap() {
  const navigate = useNavigate();
  const coinSystem = useCoins();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [coinPopup, setCoinPopup] = useState<number | null>(null);
  const [words, setWords] = useState<WordItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWords = async () => {
      try {
        setLoading(true);
        const wordRows = await fetchWords();
        const transformedWords = wordRows.map(transformWordRowToWordItem);
        setWords(transformedWords);
        const savedIndex = parseInt(localStorage.getItem('currentWordIndex') || '0');
        setCurrentWordIndex(savedIndex % (transformedWords.length || 1));
      } catch (error) {
        console.error('Failed to load words:', error);
      } finally {
        setLoading(false);
      }
    };
    loadWords();
  }, []);

  const currentWord = words[currentWordIndex];

  const nextWord = () => {
    const nextIndex = (currentWordIndex + 1) % words.length;
    setCurrentWordIndex(nextIndex);
    localStorage.setItem('currentWordIndex', nextIndex.toString());
  };

  const handleZoneClick = (zoneId: string) => {
    const zone = MAP_ZONES.find((z) => z.id === zoneId);
    if (!zone) return;

    if (coinSystem.isZoneUnlocked(zoneId)) {
      navigate(zone.route);
    } else {
      setSelectedZone(zoneId);
      setShowUnlockDialog(true);
    }
  };

  const handleUnlock = () => {
    if (!selectedZone) return;
    const zone = MAP_ZONES.find((z) => z.id === selectedZone);
    if (!zone) return;

    const success = coinSystem.unlockZone(zone.id, zone.cost);
    if (success) {
      setShowUnlockDialog(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast({
        title: `${zone.name} Unlocked!`,
        description: `You can now access ${zone.name}`,
      });
    }
  };

  const handleSwipeRight = () => {
    if (!currentWord) return;
    coinSystem.learnWord(currentWord.id);
    setCoinPopup(COIN_REWARDS.LEARN_WORD);
    toast({ title: 'Word Saved!', description: `+${COIN_REWARDS.LEARN_WORD} coins` });
    nextWord();
  };

  const handleSwipeLeft = () => {
    coinSystem.addCoins(COIN_REWARDS.SKIP_WORD);
    setCoinPopup(COIN_REWARDS.SKIP_WORD);
    toast({ title: 'Skipped!', description: `+${COIN_REWARDS.SKIP_WORD} coins` });
    nextWord();
  };

  const handleSwipeUp = () => {
    if (!currentWord) return;
    coinSystem.addCoins(COIN_REWARDS.VIEW_WORD_DETAIL);
    navigate(`/word/${currentWord.id}`);
  };

  return (
    <>
      {showConfetti && <Confetti />}
      {coinPopup !== null && (
        <CoinPopup amount={coinPopup} onDone={() => setCoinPopup(null)} />
      )}

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Village Map */}
        <section>
          <h2 className="text-2xl font-bold text-center mb-4">
            Totopara Village
          </h2>
          <VillageMapView
            unlockedZones={coinSystem.unlockedZones}
            onZoneClick={handleZoneClick}
          />
        </section>

        {/* Word of the Day */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-center">Word of the Day</h2>
          <p className="text-center text-muted-foreground mb-4 text-sm">
            Swipe left to skip, right to save, up to learn more
          </p>
          {loading || !currentWord ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <SwipeableWordCard
              word={currentWord}
              showTransliteration
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onSwipeUp={handleSwipeUp}
            />
          )}
        </section>
      </main>

      <UnlockDialog
        zone={MAP_ZONES.find((z) => z.id === selectedZone) || null}
        open={showUnlockDialog}
        onOpenChange={setShowUnlockDialog}
        currentCoins={coinSystem.coins}
        onUnlock={handleUnlock}
      />
    </>
  );
}
