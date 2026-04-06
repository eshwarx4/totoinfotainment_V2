import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Coins } from 'lucide-react';

interface GameHeaderProps {
  title: string;
  score?: number;
  coins?: number;
  round?: string;
}

export function GameHeader({ title, score, coins, round }: GameHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card border-b sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="font-bold text-lg text-primary">{title}</h1>
          <div className="flex items-center gap-3 text-sm font-semibold">
            {round && <span className="text-muted-foreground">{round}</span>}
            {score !== undefined && <span>Score: {score}</span>}
            {coins !== undefined && (
              <span className="flex items-center gap-1 text-yellow-600">
                <Coins className="h-4 w-4" />
                {coins}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
