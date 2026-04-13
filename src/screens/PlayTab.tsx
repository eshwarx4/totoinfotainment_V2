import { useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Mascot from '@/components/mascot/Mascot';
import { CurrencyPair } from '@/components/ui/CurrencyDisplay';
import { Sparkles, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';

const GAMES = [
    {
        id: 'puzzle',
        icon: '🧩',
        titleKey: 'play.puzzle',
        descKey: 'play.puzzleDesc',
        gradient: 'from-violet-500 to-purple-600',
        shadow: 'rgba(139, 92, 246, 0.4)',
        route: '/play/puzzle',
        delay: 0,
    },
    {
        id: 'runner',
        icon: '🏃',
        titleKey: 'play.runner',
        descKey: 'play.runnerDesc',
        gradient: 'from-emerald-400 to-green-600',
        shadow: 'rgba(16, 185, 129, 0.4)',
        route: '/play/runner',
        delay: 80,
    },
    {
        id: 'treasure',
        icon: '🗺️',
        titleKey: 'play.treasure',
        descKey: 'play.treasureDesc',
        gradient: 'from-amber-400 to-orange-500',
        shadow: 'rgba(245, 158, 11, 0.4)',
        route: '/play/treasure',
        delay: 160,
    },
    {
        id: 'blocks',
        icon: '🏗️',
        titleKey: 'play.blocks',
        descKey: 'play.blocksDesc',
        gradient: 'from-sky-400 to-blue-600',
        shadow: 'rgba(56, 189, 248, 0.4)',
        route: '/play/blocks',
        delay: 240,
    },
    {
        id: 'wordfinder',
        icon: '🔍',
        titleKey: 'play.wordfinder',
        descKey: 'play.wordfinderDesc',
        gradient: 'from-pink-400 to-rose-500',
        shadow: 'rgba(244, 114, 182, 0.4)',
        route: '/play/wordfinder',
        delay: 320,
    },
    {
        id: 'challenge',
        icon: '⚡',
        titleKey: 'play.challenge',
        descKey: 'play.challengeDesc',
        gradient: 'from-red-400 to-orange-500',
        shadow: 'rgba(248, 113, 113, 0.4)',
        route: '/play/challenge',
        delay: 400,
    },
    {
        id: 'monkey',
        icon: '🐒',
        titleKey: 'play.monkey',
        descKey: 'play.monkeyDesc',
        gradient: 'from-lime-400 to-emerald-500',
        shadow: 'rgba(132, 204, 22, 0.4)',
        route: '/play/monkey',
        delay: 480,
    },
];

const MASCOT_MESSAGE_KEYS = [
    'play.mascot.1',
    'play.mascot.2',
    'play.mascot.3',
    'play.mascot.4',
    'play.mascot.5',
];

export default function PlayTab() {
    const navigate = useNavigate();
    const game = useGame();
    const { t } = useLanguage();
    const totalProgress = game.getTotalProgress();
    const [mascotMsgKey, setMascotMsgKey] = useState('');
    const [cardsVisible, setCardsVisible] = useState(false);

    useEffect(() => {
        setMascotMsgKey(MASCOT_MESSAGE_KEYS[Math.floor(Math.random() * MASCOT_MESSAGE_KEYS.length)]);
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
                                    {t('play.playZone')}
                                </h1>
                                <p className="text-[10px] text-muted-foreground -mt-0.5">{t('play.chooseGame')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <CurrencyPair
                                coins={totalProgress.totalCoins}
                                diamonds={totalProgress.totalDiamonds}
                            />
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
                        <Mascot mood="happy" size="md" message={mascotMsgKey ? t(mascotMsgKey) : ''} showMessage={true} />
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
                                            {t(g.titleKey)}
                                        </h3>
                                        <p className="text-white/75 text-[11px] mt-0.5 leading-tight">
                                            {t(g.descKey)}
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
