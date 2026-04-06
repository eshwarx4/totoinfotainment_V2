import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Coins, Download, Gamepad2, MapPin } from "lucide-react";
import { useCoins } from "@/contexts/CoinContext";

export default function Progress() {
  const navigate = useNavigate();
  const coinState = useCoins();

  const exportProgress = () => {
    const data = {
      coins: coinState.coins,
      totalCoinsEarned: coinState.totalCoinsEarned,
      learnedWords: coinState.learnedWords,
      completedStories: coinState.completedStories,
      streak: coinState.streak,
      unlockedZones: coinState.unlockedZones,
      gameStats: coinState.gameStats,
      exportDate: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'toto-progress.json';
    link.click();
  };

  const totalGamesPlayed = Object.values(coinState.gameStats).reduce(
    (sum, s) => sum + s.played,
    0
  );

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Your Progress</h1>
        <p className="text-muted-foreground">Track your learning journey</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <Coins className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{coinState.coins}</p>
            <p className="text-xs text-muted-foreground">Coins</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <Trophy className="h-10 w-10 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{coinState.learnedWords.length}</p>
            <p className="text-xs text-muted-foreground">Words Learned</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <Flame className="h-10 w-10 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold">{coinState.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <MapPin className="h-10 w-10 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{coinState.unlockedZones.length}/6</p>
            <p className="text-xs text-muted-foreground">Zones Unlocked</p>
          </CardContent>
        </Card>
      </div>

      {/* Game Stats */}
      <Card className="card-elevated mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Game Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(coinState.gameStats).map(([game, stats]) => {
              const label = game === 'wordMatch' ? 'Word Match'
                : game === 'pictureQuiz' ? 'Picture Quiz'
                : game === 'listeningGame' ? 'Listening Game'
                : 'Spelling Bee';
              return (
                <div key={game} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{label}</span>
                  <div className="text-right text-sm">
                    <p>{stats.played} games</p>
                    {stats.bestScore > 0 && (
                      <p className="text-primary text-xs">Best: {stats.bestScore}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {totalGamesPlayed === 0 && (
            <p className="text-center text-muted-foreground text-sm mt-4">
              No games played yet. Visit Game Grove to start!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Learning Progress */}
      <Card className="card-elevated mb-6">
        <CardHeader>
          <CardTitle>Learning Tree</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-end gap-2 h-48">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`w-8 rounded-t-lg transition-all ${
                  i < coinState.learnedWords.length
                    ? 'bg-secondary'
                    : 'bg-muted'
                }`}
                style={{ height: `${(i + 1) * 10 + 20}%` }}
              />
            ))}
          </div>
          <div className="progress-bar mt-6">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min((coinState.learnedWords.length / 20) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="text-center mt-2 text-sm text-muted-foreground">
            {coinState.learnedWords.length} / 20 words mastered
          </p>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Export Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Download your progress data for teacher records
          </p>
          <Button onClick={exportProgress} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Export as JSON
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
