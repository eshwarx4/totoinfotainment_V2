import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ALL_WORDS, WordItem } from '@/data/wordData';
import { shuffle, pickRandom } from '@/lib/gameUtils';
import { Confetti } from '@/components/effects/Confetti';
import Mascot from '@/components/mascot/Mascot';
import { useGameSFX } from '@/hooks/useGameSFX';

// ==========================================
// GAME CONFIG
// ==========================================
const ROUNDS_PER_GAME = 6;
const BASE_TIME = 15; // seconds for first round
const TIME_PER_ROUND_DECREASE = 0.5; // less time each round
const MIN_DISTRACTORS = 3;
const MAX_DISTRACTORS = 8;

interface SceneItem {
    word: WordItem;
    x: number; // percent 0-100
    y: number;
    rotation: number;
    scale: number;
    isTarget: boolean;
    found: boolean;
}

interface RoundData {
    target: WordItem;
    items: SceneItem[];
    timeLimit: number;
}

function generateRound(roundNum: number): RoundData {
    const withImages = ALL_WORDS.filter(w => w.imageUrl);
    const target = pickRandom(withImages, 1)[0];
    const distractorCount = Math.min(MAX_DISTRACTORS, MIN_DISTRACTORS + roundNum);
    const distractors = pickRandom(
        withImages.filter(w => w.id !== target.id),
        distractorCount
    );

    // Place items in a grid-ish layout with randomness to feel natural
    const allWords = shuffle([target, ...distractors]);
    const items: SceneItem[] = allWords.map((w, i) => {
        const cols = Math.ceil(Math.sqrt(allWords.length + 1));
        const row = Math.floor(i / cols);
        const col = i % cols;
        const cellW = 80 / cols;
        const cellH = 70 / Math.ceil(allWords.length / cols);

        return {
            word: w,
            x: 10 + col * cellW + (Math.random() - 0.5) * cellW * 0.4,
            y: 8 + row * cellH + (Math.random() - 0.5) * cellH * 0.3,
            rotation: (Math.random() - 0.5) * 12,
            scale: 0.85 + Math.random() * 0.3,
            isTarget: w.id === target.id,
            found: false,
        };
    });

    const timeLimit = Math.max(8, BASE_TIME - roundNum * TIME_PER_ROUND_DECREASE);

    return { target, items, timeLimit };
}

// ==========================================
// SCENE ITEM COMPONENT
// ==========================================
function SceneItemCard({
    item,
    onTap,
    showResult,
}: {
    item: SceneItem;
    onTap: () => void;
    showResult: 'correct' | 'wrong' | null;
}) {
    return (
        <button
            onClick={onTap}
            className={`absolute transition-all duration-300 rounded-xl overflow-hidden shadow-md
        ${showResult === 'correct' ? 'ring-4 ring-green-400 scale-110 z-20' : ''}
        ${showResult === 'wrong' ? 'ring-4 ring-red-400 animate-shake opacity-60' : ''}
        ${item.found ? 'opacity-30 pointer-events-none scale-90' : 'hover:scale-105 active:scale-95'}
      `}
            style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
                width: '60px',
                height: '60px',
            }}
        >
            <img
                src={item.word.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
            />
            {item.found && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <span className="text-green-500 text-2xl">✓</span>
                </div>
            )}
        </button>
    );
}

// ==========================================
// TIMER BAR
// ==========================================
function TimerBar({ timeLeft, timeLimit }: { timeLeft: number; timeLimit: number }) {
    const pct = Math.max(0, (timeLeft / timeLimit) * 100);
    const isLow = timeLeft <= 5;

    return (
        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${isLow ? 'bg-red-500 animate-pulse' : pct > 50 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function TreasureHunt() {
    const sfx = useGameSFX();
    const [phase, setPhase] = useState<'menu' | 'playing' | 'roundComplete' | 'results'>('menu');
    const [round, setRound] = useState(0);
    const [roundData, setRoundData] = useState<RoundData | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState(0);
    const [totalXP, setTotalXP] = useState(0);
    const [foundCount, setFoundCount] = useState(0);
    const [tappedId, setTappedId] = useState<string | null>(null);
    const [tapResult, setTapResult] = useState<'correct' | 'wrong' | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [roundXP, setRoundXP] = useState(0);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Start a new round
    const startRound = useCallback((roundNum: number) => {
        const data = generateRound(roundNum);
        setRoundData(data);
        setTimeLeft(data.timeLimit);
        setTappedId(null);
        setTapResult(null);
        setPhase('playing');

        // Auto-play Toto audio for the target word
        if (data.target.audioTotoUrl) {
            setTimeout(() => {
                try { new Audio(data.target.audioTotoUrl).play().catch(() => { }); } catch { }
            }, 400);
        }
    }, []);

    // Start game
    const startGame = useCallback(() => {
        setRound(0);
        setScore(0);
        setTotalXP(0);
        setFoundCount(0);
        setShowConfetti(false);
        startRound(0);
    }, [startRound]);

    // Timer
    useEffect(() => {
        if (phase !== 'playing' || !roundData) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Time's up — treat as wrong, move to next round
                    clearInterval(timerRef.current!);
                    handleRoundEnd(false, 0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [phase, roundData]);

    // Handle tapping an item
    const handleTap = useCallback((item: SceneItem) => {
        if (!roundData || tappedId) return;

        setTappedId(item.word.id);

        if (item.isTarget) {
            setTapResult('correct');
            sfx.playCorrect();
            // Play English audio on correct answer
            if (item.word.audioEnglishUrl) {
                try { new Audio(item.word.audioEnglishUrl).play().catch(() => { }); } catch { }
            }
            const timeBonus = Math.round(timeLeft * 2);
            const xp = 30 + timeBonus;
            setRoundXP(xp);
            setTimeout(() => handleRoundEnd(true, xp), 1200);
        } else {
            setTapResult('wrong');
            sfx.playWrong();
            setTimeout(() => {
                setTappedId(null);
                setTapResult(null);
            }, 600);
        }
    }, [roundData, tappedId, timeLeft, sfx]);

    // End round
    const handleRoundEnd = useCallback((correct: boolean, xp: number) => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (correct) {
            setScore(s => s + 1);
            setTotalXP(x => x + xp);
            setFoundCount(f => f + 1);
        }
        setPhase('roundComplete');
    }, []);

    // Next round
    const handleNext = useCallback(() => {
        if (round + 1 >= ROUNDS_PER_GAME) {
            setShowConfetti(true);
            sfx.playVictory();
            setPhase('results');
        } else {
            const nextRound = round + 1;
            setRound(nextRound);
            startRound(nextRound);
        }
    }, [round, startRound]);

    // Memoize scene background decorations
    const bgDecorations = useMemo(() => {
        const items: { emoji: string; x: number; y: number; size: number; opacity: number }[] = [];
        const emojis = ['🌿', '🍃', '🌾', '🪨', '🌸', '🍂', '🌺'];
        for (let i = 0; i < 10; i++) {
            items.push({
                emoji: emojis[i % emojis.length],
                x: Math.random() * 90 + 5,
                y: Math.random() * 85 + 5,
                size: 14 + Math.random() * 10,
                opacity: 0.15 + Math.random() * 0.15,
            });
        }
        return items;
    }, []);

    // ==========================================
    // SCREENS
    // ==========================================

    if (phase === 'menu') {
        return (
            <PlayGameShell title="Treasure Hunt" icon="🗺️" gradient="from-amber-400 to-orange-500">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center">
                    <Mascot mood="excited" size="md" message="Find hidden treasures! 🔍✨" />
                    <h2 className="text-xl font-extrabold text-gray-800 mt-4 mb-2">Totopara Treasure Hunt</h2>
                    <p className="text-sm text-muted-foreground mb-2 max-w-xs">
                        Find the correct word hidden among others before time runs out!
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-xs text-amber-700 max-w-xs">
                        <p className="font-semibold">How to play:</p>
                        <p className="mt-1">• Look at the target word at the top</p>
                        <p>• Find and tap the matching image</p>
                        <p>• Faster finds = more XP! ⚡</p>
                        <p>• {ROUNDS_PER_GAME} rounds, each harder than the last</p>
                    </div>
                    <button
                        onClick={startGame}
                        className="btn-game bg-gradient-to-r from-amber-500 to-orange-500 text-white px-12 py-3 text-lg"
                    >
                        Start Hunting! 🔍
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    // Playing
    if (phase === 'playing' && roundData) {
        return (
            <PlayGameShell title="Treasure Hunt" icon="🗺️" gradient="from-amber-400 to-orange-500">
                <div className="flex flex-col h-full">
                    {/* Top bar */}
                    <div className="px-4 pt-3 pb-2 bg-white/70 backdrop-blur-sm shrink-0">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                Round {round + 1}/{ROUNDS_PER_GAME}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                🪙 {totalXP} XP
                            </span>
                        </div>
                        <TimerBar timeLeft={timeLeft} timeLimit={roundData.timeLimit} />

                        {/* Target word */}
                        <div className="mt-2 flex items-center justify-center gap-2 bg-amber-50 rounded-xl p-2.5 border border-amber-200">
                            <span className="text-lg">🔍</span>
                            <p className="text-sm font-extrabold text-amber-800">
                                Find: <span className="text-amber-600 text-base">{roundData.target.english}</span>
                            </p>
                            <button
                                onClick={() => {
                                    if (roundData.target.audioTotoUrl) {
                                        try { new Audio(roundData.target.audioTotoUrl).play().catch(() => { }); } catch { }
                                    }
                                }}
                                className="text-sm bg-amber-200 rounded-full w-7 h-7 flex items-center justify-center active:scale-90 transition-transform"
                            >
                                🔊
                            </button>
                        </div>
                    </div>

                    {/* Scene */}
                    <div className="flex-1 relative overflow-hidden" style={{
                        background: 'linear-gradient(170deg, #E8F5E9 0%, #FFF8E1 40%, #F1F8E9 100%)',
                        minHeight: '350px',
                    }}>
                        {/* Background decorations */}
                        {bgDecorations.map((d, i) => (
                            <span
                                key={i}
                                className="absolute pointer-events-none select-none"
                                style={{
                                    left: `${d.x}%`,
                                    top: `${d.y}%`,
                                    fontSize: `${d.size}px`,
                                    opacity: d.opacity,
                                    transform: `rotate(${Math.random() * 30 - 15}deg)`,
                                }}
                            >
                                {d.emoji}
                            </span>
                        ))}

                        {/* Scattered items */}
                        {roundData.items.map((item) => (
                            <SceneItemCard
                                key={item.word.id}
                                item={item}
                                onTap={() => handleTap(item)}
                                showResult={tappedId === item.word.id ? tapResult : null}
                            />
                        ))}

                        {/* Feedback overlay */}
                        {tapResult === 'correct' && (
                            <div className="absolute inset-0 bg-green-500/10 pointer-events-none flex items-center justify-center z-30 animate-fade-in">
                                <div className="bg-white rounded-2xl shadow-xl px-6 py-4 text-center">
                                    <span className="text-4xl">🎉</span>
                                    <p className="text-lg font-extrabold text-green-600 mt-1">Found it!</p>
                                    <p className="text-xs text-muted-foreground">+{roundXP} XP</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    // Round complete
    if (phase === 'roundComplete' && roundData) {
        const wasCorrect = tappedId === roundData.target.id;

        return (
            <PlayGameShell title="Treasure Hunt" icon="🗺️" gradient="from-amber-400 to-orange-500">
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center animate-fade-in">
                    <Mascot
                        mood={wasCorrect ? 'excited' : 'sad'}
                        size="sm"
                        message={wasCorrect ? 'Great eye! 👀✨' : 'Keep looking next time! 🔍'}
                    />

                    <div className="mt-3 bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                        <img
                            src={roundData.target.imageUrl}
                            alt={roundData.target.english}
                            className="w-20 h-20 object-cover rounded-xl mx-auto mb-2 shadow-sm"
                        />
                        <h3 className="text-xl font-extrabold text-gray-800">{roundData.target.english}</h3>
                        <button
                            onClick={() => {
                                if (roundData.target.audioTotoUrl) {
                                    try { new Audio(roundData.target.audioTotoUrl).play().catch(() => { }); } catch { }
                                }
                            }}
                            className="mt-1.5 inline-flex items-center gap-1 bg-amber-100 text-amber-700 rounded-full px-3 py-1 text-xs font-semibold active:scale-95 transition-transform"
                        >
                            🔊 Listen in Toto
                        </button>

                        {wasCorrect && (
                            <div className="mt-3 text-center">
                                <p className="text-amber-500 font-bold text-lg">+{roundXP} XP</p>
                                <p className="text-xs text-muted-foreground">Speed bonus included!</p>
                            </div>
                        )}
                        {!wasCorrect && (
                            <p className="mt-3 text-xs text-red-500 font-semibold">⏰ Time ran out!</p>
                        )}
                    </div>

                    {/* Progress dots */}
                    <div className="mt-3 flex items-center gap-1.5">
                        {Array.from({ length: ROUNDS_PER_GAME }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${i < round + 1 ? (i <= round ? 'bg-amber-500' : 'bg-amber-300') : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="mt-5 btn-game bg-gradient-to-r from-amber-500 to-orange-500 text-white px-10 py-3 text-lg"
                    >
                        {round + 1 < ROUNDS_PER_GAME ? 'Next Round →' : 'See Results! 🏆'}
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    // Results
    if (phase === 'results') {
        return (
            <PlayGameShell title="Treasure Hunt" icon="🗺️" gradient="from-amber-400 to-orange-500">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
                    {showConfetti && <Confetti />}
                    <span className="text-6xl mb-3">🏆</span>
                    <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Hunt Complete!</h2>
                    <p className="text-muted-foreground mb-4">
                        You found {foundCount} out of {ROUNDS_PER_GAME} treasures!
                    </p>

                    <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-3xl font-extrabold text-amber-500">{totalXP}</p>
                                <p className="text-xs text-muted-foreground">Total XP</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-extrabold text-emerald-500">{foundCount}/{ROUNDS_PER_GAME}</p>
                                <p className="text-xs text-muted-foreground">Found</p>
                            </div>
                        </div>
                    </div>

                    <Mascot
                        mood={foundCount >= ROUNDS_PER_GAME / 2 ? 'happy' : 'thinking'}
                        size="sm"
                        message={foundCount >= ROUNDS_PER_GAME / 2 ? 'Amazing treasure hunter! 🗺️✨' : 'Keep exploring! You\'ll find them all! 🔍'}
                        className="mt-4"
                    />

                    <div className="mt-5 flex gap-3">
                        <button
                            onClick={startGame}
                            className="btn-game bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3"
                        >
                            Play Again 🔄
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="btn-game bg-white text-gray-700 border-2 border-gray-200 px-6 py-3"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    return null;
}
