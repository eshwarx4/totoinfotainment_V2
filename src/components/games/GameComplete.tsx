import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Trophy, RotateCcw, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Confetti } from '@/components/effects/Confetti';

interface GameCompleteProps {
  title: string;
  score: number;
  totalQuestions: number;
  coinsEarned: number;
  isPerfect: boolean;
  onPlayAgain: () => void;
}

export function GameComplete({
  title,
  score,
  totalQuestions,
  coinsEarned,
  isPerfect,
  onPlayAgain,
}: GameCompleteProps) {
  const navigate = useNavigate();
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <>
      {isPerfect && <Confetti />}
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full card-elevated animate-fade-in">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-6xl">
              {isPerfect ? '🏆' : percentage >= 70 ? '🎉' : '💪'}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary mb-1">{title}</h2>
              <p className="text-muted-foreground">
                {isPerfect
                  ? 'Perfect score!'
                  : percentage >= 70
                    ? 'Great job!'
                    : 'Keep practicing!'}
              </p>
            </div>

            <div className="flex justify-center gap-8">
              <div className="text-center">
                <Trophy className="h-8 w-8 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">
                  {score}/{totalQuestions}
                </p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
              <div className="text-center">
                <Coins className="h-8 w-8 text-yellow-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-yellow-600 animate-coin-pop">
                  +{coinsEarned}
                </p>
                <p className="text-xs text-muted-foreground">Coins earned</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={onPlayAgain} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Play Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/map')}
                className="gap-2"
              >
                <Map className="h-4 w-4" />
                Back to Map
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
