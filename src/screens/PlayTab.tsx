import { useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import Mascot from '@/components/mascot/Mascot';
import { Sparkles, Trophy, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';

const GAMES = [
    {
        id: 'puzzle',
        icon: '🧩',
        title: 'Puzzle Builder',
        desc: 'Piece together images!',
        gradient: 'from-violet-500 to-purple-600',
        shadow: 'rgba(139, 92, 246, 0.4)',
        route: '/play/puzzle',
        delay: 0,
    },
    {
        id: 'runner',
        icon: '🏃',
        title: 'Toto Runner',
        desc: 'Run, jump & learn!',
        gradient: 'from-emerald-400 to-green-600',
        shadow: 'rgba(16, 185, 129, 0.4)',
        route: '/play/runner',
        delay: 80,
    },
    {
        id: 'treasure',
        icon: '🗺️',
        title: 'Treasure Hunt',
        desc: 'Find hidden objects!',
        gradient: 'from-amber-400 to-orange-500',
        shadow: 'rgba(245, 158, 11, 0.4)',
        route: '/play/treasure',
        delay: 160,
    },
    {
        id: 'blocks',
        icon: '🏗️',
        title: 'Block Builder',
        desc: 'Build shapes & learn!',
        gradient: 'from-sky-400 to-blue-600',
        shadow: 'rgba(56, 189, 248, 0.4)',
        route: '/play/blocks',
        delay: 240,
    },
    {
        id: 'wordfinder',
        icon: '🔍',
        title: 'Word Finder',
        desc: 'Spot words in scenes!',
        gradient: 'from-pink-400 to-rose-500',
        shadow: 'rgba(244, 114, 182, 0.4)',
        route: '/play/wordfinder',
        delay: 320,
    },
    {
        id: 'challenge',
        icon: '⚡',
        title: 'Quick Challenge',
        desc: 'Race against time!',
        gradient: 'from-red-400 to-orange-500',
        shadow: 'rgba(248, 113, 113, 0.4)',
        route: '/play/challenge',
        delay: 400,
    },
];

const MASCOT_MESSAGES = [
    "Let's play & learn! 🎮",
    "Pick a game, have fun! 🎯",
    "Ready for adventure? ✨",
    "Let's go, champion! 🏆",
    "Time to play! 🎉",
];

export default function PlayTab() {
    const navigate = useNavigate();
    const game = useGame();
    const totalProgress = game.getTotalProgress();
    const [mascotMsg, setMascotMsg] = useState('');
    const [cardsVisible, setCardsVisible] = useState(false);

    useEffect(() => {
        setMascotMsg(MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)]);
        const timer = setTimeout(() => setCardsVisible(true), 200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="play-zone-bg" />

            {/* Floating particles */}
            <div className="play-zone-particles">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="play-zone-particle"
                        style={{
                            left: `${8 + (i * 8) % 90}%`,
                            animationDelay: `${i * 0.7}s`,
                            animationDuration: `${4 + (i % 3) * 2}s`,
                            fontSize: `${10 + (i % 4) * 4}px`,
                            opacity: 0.15 + (i % 3) * 0.1,
                        }}
                    >
                        {['✨', '⭐', '🌟', '💫', '🎯', '🎮'][i % 6]}
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-white/30">
                    <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-game-primary to-emerald-600 flex items-center justify-center shadow-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-extrabold bg-gradient-to-r from-game-primary to-emerald-600 bg-clip-text text-transparent">
                                    Play Zone
                                </h1>
                                <p className="text-[10px] text-muted-foreground -mt-0.5">Choose a game!</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                                <span className="text-sm">🪙</span>
                                <span className="text-xs font-bold text-amber-600">{totalProgress.totalCoins}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
                                <Trophy className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-xs font-bold text-blue-600">{totalProgress.totalDiamonds}</span>
                            </div>
                            {totalProgress.streak > 0 && (
                                <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1">
                                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                                    <span className="text-xs font-bold text-orange-600">{totalProgress.streak}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mascot section */}
                <div className="max-w-lg mx-auto px-4 pt-5 pb-2">
                    <div className="flex items-end gap-3">
                        <Mascot mood="happy" size="md" message={mascotMsg} showMessage={true} />
                    </div>
                </div>

                {/* Game cards grid */}
                <div className="max-w-lg mx-auto px-4 pb-28 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        {GAMES.map((g) => (
                            <button
                                key={g.id}
                                onClick={() => navigate(g.route)}
                                className={`game-select-card group ${cardsVisible ? 'game-card-visible' : 'game-card-hidden'}`}
                                style={{
                                    transitionDelay: `${g.delay}ms`,
                                }}
                            >
                                <div
                                    className={`relative bg-gradient-to-br ${g.gradient} rounded-2xl p-4 overflow-hidden transition-all duration-200 active:scale-[0.95]`}
                                    style={{
                                        boxShadow: `0 8px 24px -4px ${g.shadow}`,
                                    }}
                                >
                                    {/* Decorative circles */}
                                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
                                    <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/5 rounded-full" />

                                    {/* Icon */}
                                    <div className="relative z-10 game-card-icon-float">
                                        <span className="text-4xl block drop-shadow-lg">{g.icon}</span>
                                    </div>

                                    {/* Text */}
                                    <div className="relative z-10 mt-2">
                                        <h3 className="text-white font-extrabold text-sm leading-tight drop-shadow-sm">
                                            {g.title}
                                        </h3>
                                        <p className="text-white/75 text-[11px] mt-0.5 leading-tight">
                                            {g.desc}
                                        </p>
                                    </div>

                                    {/* Play indicator */}
                                    <div className="absolute bottom-2 right-2 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                        <span className="text-white text-xs font-bold">▶</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
