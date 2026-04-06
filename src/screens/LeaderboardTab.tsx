import { useGame } from '@/state/GameContext';
import { Trophy, Medal, Crown } from 'lucide-react';
import { useMemo } from 'react';

interface UserRankData {
    userId: string;
    name: string;
    avatar: string;
    coins: number;
    diamonds: number;
    wordsLearned: number;
}

export default function LeaderboardTab() {
    const game = useGame();

    // Build leaderboard from all users
    const rankings = useMemo((): UserRankData[] => {
        const users = game.listUsers();
        return users
            .map(u => ({
                userId: u.userId,
                name: u.playerName,
                avatar: u.playerAvatar || '🦉',
                coins: u.totalCoins || 0,
                diamonds: u.totalDiamonds || 0,
                wordsLearned: 0, // We only have coins for ranking from listUsers
            }))
            .sort((a, b) => b.coins - a.coins);
    }, [game]);

    const currentUserRank = rankings.findIndex(u => u.userId === game.userId) + 1;

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-amber-400" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
    };

    const getRankBg = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200';
        if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
        if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
        return '';
    };

    return (
        <div className="min-h-screen screen-enter pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white px-4 pt-5 pb-8">
                <div className="max-w-lg mx-auto text-center">
                    <Trophy className="w-12 h-12 mx-auto mb-2 text-white" />
                    <h1 className="text-2xl font-bold">Leaderboard</h1>
                    <p className="text-sm opacity-80">Who's learning the most?</p>
                    {currentUserRank > 0 && (
                        <div className="mt-3 inline-block bg-white/20 rounded-full px-4 py-1.5">
                            <span className="text-sm font-bold">Your Rank: #{currentUserRank}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 -mt-4">
                {rankings.length === 0 ? (
                    <div className="card-game p-8 text-center">
                        <span className="text-5xl mb-4 block">🏆</span>
                        <h3 className="font-bold text-lg mb-2">No rankings yet!</h3>
                        <p className="text-sm text-muted-foreground">
                            Create an account and start learning to appear on the leaderboard.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {rankings.map((user, i) => {
                            const rank = i + 1;
                            const isMe = user.userId === game.userId;
                            return (
                                <div
                                    key={user.userId}
                                    className={`card-game p-3 flex items-center gap-3 transition-all
                    ${getRankBg(rank)}
                    ${isMe ? 'ring-2 ring-game-primary ring-offset-1' : ''}`}
                                >
                                    {/* Rank */}
                                    <div className="flex-shrink-0 w-8 flex items-center justify-center">
                                        {getRankIcon(rank)}
                                    </div>
                                    {/* Avatar */}
                                    <span className="text-2xl flex-shrink-0">{user.avatar}</span>
                                    {/* Name + stats */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-sm truncate">{user.name}</p>
                                            {isMe && (
                                                <span className="text-[10px] bg-game-primary text-white px-1.5 py-0.5 rounded-full font-bold">
                                                    YOU
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            🪙 {user.coins} · 💎 {user.diamonds}
                                        </p>
                                    </div>
                                    {/* Coin count (big) */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-lg font-black text-amber-500">{user.coins}</p>
                                        <p className="text-[10px] text-muted-foreground">coins</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* How rankings work */}
                <div className="card-game p-4 mt-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="font-bold text-sm mb-2">📊 How Rankings Work</h3>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Learn words to earn 🪙 5 coins each</li>
                        <li>• Complete concepts for 🪙 20 coins</li>
                        <li>• Win games for 🪙 50+ coins</li>
                        <li>• Perfect levels earn 💎 diamonds</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
