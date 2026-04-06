import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Coins } from "lucide-react";
import { WordItem } from "@/types/content";
import { useCoins } from "@/contexts/CoinContext";
import { COIN_REWARDS } from "@/types/gamification";
import { GameComplete } from "@/components/games/GameComplete";
import { CoinPopup } from "@/components/effects/CoinPopup";
import { fetchWords } from "@/lib/supabaseQueries";
import { transformWordRowToWordItem } from "@/lib/dataTransformers";
import { pickRandom } from "@/lib/gameUtils";

export default function Quizzes() {
  const coinSystem = useCoins();
  const [ageGroup, setAgeGroup] = useState<'6-9' | '10-14'>('6-9');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizWords, setQuizWords] = useState<WordItem[]>([]);
  const [allWords, setAllWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [coinPopup, setCoinPopup] = useState<number | null>(null);

  const initQuiz = async () => {
    try {
      setLoading(true);
      setCurrentQuestion(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setGameComplete(false);
      setCoinsEarned(0);
      const wordRows = await fetchWords();
      const transformedWords = wordRows.map(transformWordRowToWordItem);
      setAllWords(transformedWords);
      const quizSelection = pickRandom(transformedWords, Math.min(5, transformedWords.length));
      setQuizWords(quizSelection);
    } catch (error) {
      console.error('Failed to load words:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initQuiz();
  }, []);

  const correctWord = quizWords[currentQuestion];

  // Generate 3 options from allWords for current question
  const getOptions = () => {
    if (!correctWord || allWords.length < 3) return quizWords;
    const others = allWords.filter(w => w.id !== correctWord.id);
    const wrongOptions = pickRandom(others, 2);
    const options = [correctWord, ...wrongOptions];
    // Deterministic shuffle based on current question
    return options.sort((a, b) => a.id.localeCompare(b.id));
  };

  const handleAnswer = (wordId: string) => {
    setSelectedAnswer(wordId);

    if (wordId === correctWord.id) {
      setScore(score + 1);
      setShowResult(true);
      const earned = COIN_REWARDS.CORRECT_QUIZ_ANSWER;
      coinSystem.addCoins(earned);
      setCoinsEarned(prev => prev + earned);
      setCoinPopup(earned);

      setTimeout(() => {
        if (currentQuestion < quizWords.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        } else {
          const completionCoins = COIN_REWARDS.COMPLETE_QUIZ;
          coinSystem.addCoins(completionCoins);
          const isPerfect = score + 1 === quizWords.length;
          if (isPerfect) coinSystem.addCoins(COIN_REWARDS.PERFECT_GAME);
          setCoinsEarned(prev => prev + completionCoins + (isPerfect ? COIN_REWARDS.PERFECT_GAME : 0));
          setGameComplete(true);
        }
      }, 1500);
    }
  };

  if (gameComplete) {
    return (
      <GameComplete
        title="Quiz Complete!"
        score={score}
        totalQuestions={quizWords.length}
        coinsEarned={coinsEarned}
        isPerfect={score === quizWords.length}
        onPlayAgain={initQuiz}
      />
    );
  }

  return (
    <>
      {coinPopup !== null && (
        <CoinPopup amount={coinPopup} onDone={() => setCoinPopup(null)} />
      )}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Quiz Time!</h1>
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant={ageGroup === '6-9' ? 'default' : 'outline'}
              onClick={() => setAgeGroup('6-9')}
            >
              Ages 6-9
            </Button>
            <Button
              variant={ageGroup === '10-14' ? 'default' : 'outline'}
              onClick={() => setAgeGroup('10-14')}
            >
              Ages 10-14
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="text-xl font-semibold">Score: {score}</span>
          </div>
        </div>

        {loading || !correctWord ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="card-elevated animate-fade-in">
            <CardHeader>
              <CardTitle className="text-center">
                Question {currentQuestion + 1} of {quizWords.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-xl text-muted-foreground">Which image shows:</p>
                <h2 className="text-3xl font-bold text-primary">{correctWord.toto}</h2>
                <p className="text-xl">{correctWord.english}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {getOptions().map((word) => (
                  <button
                    key={word.id}
                    onClick={() => handleAnswer(word.id)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedAnswer === word.id
                        ? word.id === correctWord.id
                          ? 'border-success bg-success/10'
                          : 'border-destructive bg-destructive/10'
                        : 'border-border hover:border-primary hover:scale-105'
                    }`}
                  >
                    <img
                      src={word.imageUrl}
                      alt="Quiz option"
                      className="w-full aspect-square object-contain rounded"
                    />
                  </button>
                ))}
              </div>

              {showResult && (
                <div className="text-center animate-celebration">
                  <Coins className="h-16 w-16 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-success">
                    Correct! +{COIN_REWARDS.CORRECT_QUIZ_ANSWER} coins
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
