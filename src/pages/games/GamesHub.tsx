import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCoins } from '@/contexts/CoinContext';

const GAMES = [
  {
    id: 'word-match',
    title: 'Word Match',
    description: 'Match Toto words with their English translations',
    icon: '🃏',
    route: '/games/word-match',
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'picture-quiz',
    title: 'Picture Quiz',
    description: 'Identify Toto words from images',
    icon: '🖼️',
    route: '/games/picture-quiz',
    color: 'from-purple-400 to-purple-600',
  },
  {
    id: 'listening',
    title: 'Listening Game',
    description: 'Listen to Toto audio and pick the meaning',
    icon: '🎧',
    route: '/games/listening',
    color: 'from-green-400 to-green-600',
  },
  {
    id: 'spelling',
    title: 'Spelling Bee',
    description: 'Spell Toto words from scrambled letters',
    icon: '🐝',
    route: '/games/spelling',
    color: 'from-amber-400 to-amber-600',
  },
];

export default function GamesHub() {
  const navigate = useNavigate();
  const { gameStats } = useCoins();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Game Grove</h1>
        <p className="text-muted-foreground">Pick a game and start earning coins!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {GAMES.map((game) => {
          const statsKey = game.id === 'word-match' ? 'wordMatch'
            : game.id === 'picture-quiz' ? 'pictureQuiz'
            : game.id === 'listening' ? 'listeningGame'
            : 'spellingBee';
          const stats = gameStats[statsKey as keyof typeof gameStats];

          return (
            <Card
              key={game.id}
              className="card-elevated cursor-pointer hover:scale-105 transition-transform animate-slide-in overflow-hidden"
              onClick={() => navigate(game.route)}
            >
              <CardContent className="p-0">
                <div
                  className={`bg-gradient-to-br ${game.color} p-6 text-white text-center`}
                >
                  <span className="text-5xl block mb-2">{game.icon}</span>
                  <h3 className="text-xl font-bold">{game.title}</h3>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">{game.description}</p>
                  {stats.played > 0 && (
                    <p className="text-xs text-primary font-medium">
                      Played {stats.played}x | Best: {stats.bestScore}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
