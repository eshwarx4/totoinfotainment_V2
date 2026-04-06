import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { WordCard } from "@/components/WordCard";
import { WordItem } from "@/types/content";
import { useCoins } from "@/contexts/CoinContext";
import { COIN_REWARDS } from "@/types/gamification";
import { fetchWords } from "@/lib/supabaseQueries";
import { transformWordRowToWordItem } from "@/lib/dataTransformers";

export default function Words() {
  const navigate = useNavigate();
  const { addCoins } = useCoins();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showTransliteration] = useState(true);
  const [words, setWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Food", "Animals", "Plants", "Objects", "Nature", "Body"];

  useEffect(() => {
    const loadWords = async () => {
      try {
        setLoading(true);
        const wordRows = await fetchWords(selectedCategory);
        const transformedWords = wordRows.map(transformWordRowToWordItem);
        setWords(transformedWords);
      } catch (error) {
        console.error('Failed to load words:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, [selectedCategory]);

  const handleWordClick = (word: WordItem) => {
    addCoins(COIN_REWARDS.VIEW_WORD_DETAIL);
    navigate(`/word/${word.id}`);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Browse Words</h1>
        <p className="text-lg text-muted-foreground">
          Explore words by category
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="min-w-[100px]"
          >
            {category}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {words.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                showTransliteration={showTransliteration}
                onClick={() => handleWordClick(word)}
              />
            ))}
          </div>

          {words.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No words found in this category yet.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
