import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Loader2 } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useState, useEffect } from "react";
import { WordItem } from "@/types/content";
import { useCoins } from "@/contexts/CoinContext";
import { COIN_REWARDS } from "@/types/gamification";
import { CoinPopup } from "@/components/effects/CoinPopup";
import { fetchWordById } from "@/lib/supabaseQueries";
import { transformWordRowToWordItem } from "@/lib/dataTransformers";

export default function WordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const coinSystem = useCoins();
  const [word, setWord] = useState<WordItem | null>(null);
  const [isLearned, setIsLearned] = useState(false);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [loading, setLoading] = useState(true);
  const [coinPopup, setCoinPopup] = useState<number | null>(null);

  useEffect(() => {
    const loadWord = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const wordRow = await fetchWordById(id);
        if (wordRow) {
          const transformedWord = transformWordRowToWordItem(wordRow);
          setWord(transformedWord);
          setIsLearned(coinSystem.learnedWords.includes(id));
        }
      } catch (error) {
        console.error('Failed to load word:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWord();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!word) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Word not found</p>
      </div>
    );
  }

  const handleMarkLearned = () => {
    coinSystem.learnWord(word.id);
    setIsLearned(true);
    setCoinPopup(COIN_REWARDS.LEARN_WORD);
  };

  return (
    <>
      {coinPopup !== null && (
        <CoinPopup amount={coinPopup} onDone={() => setCoinPopup(null)} />
      )}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="card-elevated animate-fade-in">
          <CardHeader>
            <CardTitle className="text-center text-3xl">Learn Word</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex justify-center">
              <img
                src={word.imageUrl}
                alt={word.english}
                className="w-64 h-64 object-contain rounded-lg"
              />
            </div>

            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold text-primary">{word.toto}</h2>
              {showTransliteration && word.transliteration && word.transliteration.trim() !== '' && (
                <p className="text-xl text-muted-foreground italic">({word.transliteration})</p>
              )}
              {word.toto !== word.english && (
                <p className="text-2xl text-foreground">{word.english}</p>
              )}
            </div>

            <div className="flex justify-center gap-8">
              <AudioPlayer
                audioUrl={word.audioToto}
                label="Toto pronunciation"
                variant="toto"
              />
              <AudioPlayer
                audioUrl={word.audioEnglish}
                label="English pronunciation"
                variant="english"
              />
            </div>

            {word.usageSentenceToto && (
              <Card className="bg-muted/50">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold text-lg">Usage Example</h3>
                  <div className="space-y-2">
                    <p className="text-lg text-primary">{word.usageSentenceToto}</p>
                    {showTransliteration && (
                      <p className="text-sm text-muted-foreground italic">
                        (Transliteration would go here)
                      </p>
                    )}
                    <p className="text-lg text-foreground">{word.usageSentenceEnglish}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleMarkLearned}
                disabled={isLearned}
                size="lg"
                className="gap-2"
              >
                {isLearned ? (
                  <>
                    <Check className="h-5 w-5" />
                    Learned!
                  </>
                ) : (
                  <>
                    <Star className="h-5 w-5" />
                    Mark as Learned (+{COIN_REWARDS.LEARN_WORD} coins)
                  </>
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowTransliteration(!showTransliteration)}
              className="w-full"
            >
              {showTransliteration ? 'Hide' : 'Show'} Transliteration
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
