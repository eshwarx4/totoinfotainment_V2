import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ALL_WORDS, WordItem } from '@/data/wordData';
import { shuffle, pickRandom } from '@/lib/gameUtils';
import { Confetti } from '@/components/effects/Confetti';
import Mascot from '@/components/mascot/Mascot';

const ROUNDS = 6;
const GRID_SIZE = 4; // 4 images per round
const TIME_PER_ROUND = 12;

interface RoundData {
    images: WordItem[];
    targetWord: WordItem;
}

function generateRound(): RoundData {
    const eligible = ALL_WORDS.filter(w => w.imageUrl);
    const images = pickRandom(eligible, GRID_SIZE);
    const targetWord = images[Math.floor(Math.random() * images.length)];
    return { images: shuffle(images), targetWord };
}

export default function WordFinder() {
    const [phase, setPhase] = useState<'menu' | 'playing' | 'roundDone' | 'results'>('menu');
    const [round, setRound] = useState(0);
    const [roundData, setRoundData] = useState<RoundData | null>(null);
    const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
    const [selected, setSelected] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [score, setScore] = useState(0);
    const [totalXP, setTotalXP] = useState(0);
    const [roundXP, setRoundXP] = useState(0);
    const [streak, setStreak] = useState(0);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startRound = useCallback(() => {
        setRoundData(generateRound());
        setTimeLeft(TIME_PER_ROUND);
        setSelected(null);
        setFeedback(null);
        setPhase('playing');
    }, []);

    const startGame = useCallback(() => {
        setRound(0);
        setScore(0);
        setTotalXP(0);
        setStreak(0);
        startRound();
    }, [startRound]);

    // Timer
    useEffect(() => {
        if (phase !== 'playing') return;
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current!);
                    setStreak(0);
                    setPhase('roundDone');
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase]);

    const handleSelect = useCallback((word: WordItem) => {
        if (!roundData || feedback === 'correct') return;
        setSelected(word.id);

        if (word.id === roundData.targetWord.id) {
            setFeedback('correct');
            if (timerRef.current) clearInterval(timerRef.current);
            const timeBonus = Math.round(timeLeft * 3);
            const streakBonus = streak * 5;
            const xp = 25 + timeBonus + streakBonus;
            setRoundXP(xp);
            setTotalXP(x => x + xp);
            setScore(s => s + 1);
            setStreak(s => s + 1);

            if (word.audioTotoUrl) {
                try { new Audio(word.audioTotoUrl).play().catch(() => { }); } catch { }
            }
            setTimeout(() => setPhase('roundDone'), 1000);
        } else {
            setFeedback('wrong');
            setStreak(0);
            setTimeout(() => { setSelected(null); setFeedback(null); }, 500);
        }
    }, [roundData, feedback, timeLeft, streak]);

    const handleNext = useCallback(() => {
        if (round + 1 >= ROUNDS) {
            setPhase('results');
        } else {
            setRound(r => r + 1);
            startRound();
        }
    }, [round, startRound]);

    // ==========================================
    // SCREENS
    // ==========================================
    if (phase === 'menu') {
        return (
            <PlayGameShell title="Word Finder" icon="🔤" gradient="from-teal-400 to-cyan-500">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center">
                    <Mascot mood="excited" size="md" message="Find the right word! 🔤🔍" />
                    <h2 className="text-xl font-extrabold text-gray-800 mt-4 mb-2">Word Finder</h2>
                    <p className="text-sm text-muted-foreground mb-2 max-w-xs">
                        See the word — find the matching image before time runs out!
                    </p>
                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-6 text-xs text-teal-700 max-w-xs">
                        <p className="font-semibold">How to play:</p>
                        <p className="mt-1">• Read the word at the top</p>
                        <p>• Tap the matching image from the grid</p>
                        <p>• Build streaks for bonus XP! 🔥</p>
                        <p>• {ROUNDS} rounds to prove yourself!</p>
                    </div>
                    <button onClick={startGame} className="btn-game bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-12 py-3 text-lg">
                        Start Finding! 🔤
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'playing' && roundData) {
        const pct = Math.max(0, (timeLeft / TIME_PER_ROUND) * 100);
        const isLow = timeLeft <= 4;

        return (
            <PlayGameShell title="Word Finder" icon="🔤" gradient="from-teal-400 to-cyan-500">
                <div className="px-4 py-4">
                    {/* Progress + timer */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                            {round + 1}/{ROUNDS}
                        </span>
                        {streak > 1 && (
                            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full animate-pulse">
                                🔥 {streak} streak!
                            </span>
                        )}
                        <span className="text-xs font-bold text-muted-foreground">{timeLeft}s</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                        <div className={`h-full rounded-full transition-all duration-1000 ${isLow ? 'bg-red-500 animate-pulse' : pct > 50 ? 'bg-teal-500' : 'bg-amber-500'
                            }`} style={{ width: `${pct}%` }} />
                    </div>

                    {/* Target word */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Find the image for:</p>
                        <h3 className="text-2xl font-extrabold text-teal-700">{roundData.targetWord.english}</h3>
                        <button onClick={() => {
                            if (roundData.targetWord.audioTotoUrl) {
                                try { new Audio(roundData.targetWord.audioTotoUrl).play().catch(() => { }); } catch { }
                            }
                        }} className="mt-1 text-sm bg-teal-100 rounded-full px-3 py-0.5 text-teal-600 active:scale-95 transition-transform">
                            🔊
                        </button>
                    </div>

                    {/* Image grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {roundData.images.map(img => {
                            const isSelected = selected === img.id;
                            const isCorrectImg = img.id === roundData.targetWord.id;
                            const showCorrect = feedback === 'correct' && isCorrectImg;
                            const showWrong = isSelected && feedback === 'wrong';

                            return (
                                <button
                                    key={img.id}
                                    onClick={() => handleSelect(img)}
                                    disabled={feedback === 'correct'}
                                    className={`relative rounded-2xl overflow-hidden shadow-md transition-all duration-200 aspect-square ${showCorrect ? 'ring-4 ring-green-400 scale-[1.03]'
                                            : showWrong ? 'ring-4 ring-red-400 animate-shake opacity-70'
                                                : 'hover:scale-[1.02] active:scale-95 ring-2 ring-gray-100'
                                        }`}
                                >
                                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                                    {showCorrect && (
                                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                            <span className="text-4xl">✅</span>
                                        </div>
                                    )}
                                    {showWrong && (
                                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                            <span className="text-3xl">❌</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'roundDone' && roundData) {
        const wasCorrect = feedback === 'correct';
        return (
            <PlayGameShell title="Word Finder" icon="🔤" gradient="from-teal-400 to-cyan-500">
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center animate-fade-in">
                    <Mascot mood={wasCorrect ? 'excited' : 'sad'} size="sm"
                        message={wasCorrect ? 'Sharp eyes! 👁️✨' : 'Time\'s up! Keep trying! ⏰'} />
                    <div className="mt-3 bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                        <img src={roundData.targetWord.imageUrl} alt="" className="w-20 h-20 object-cover rounded-xl mx-auto mb-2 shadow-sm" />
                        <h3 className="text-xl font-extrabold text-gray-800">{roundData.targetWord.english}</h3>
                        <button onClick={() => {
                            if (roundData.targetWord.audioTotoUrl) try { new Audio(roundData.targetWord.audioTotoUrl).play().catch(() => { }); } catch { }
                        }} className="mt-1.5 inline-flex items-center gap-1 bg-teal-100 text-teal-700 rounded-full px-3 py-1 text-xs font-semibold active:scale-95 transition-transform">
                            🔊 Listen in Toto
                        </button>
                        {wasCorrect && <p className="mt-2 text-amber-500 font-bold">+{roundXP} XP</p>}
                        {!wasCorrect && <p className="mt-2 text-xs text-red-500 font-semibold">⏰ Time ran out!</p>}
                    </div>
                    <button onClick={handleNext} className="mt-5 btn-game bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-10 py-3 text-lg">
                        {round + 1 < ROUNDS ? 'Next Word →' : 'See Results! 🏆'}
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'results') {
        return (
            <PlayGameShell title="Word Finder" icon="🔤" gradient="from-teal-400 to-cyan-500">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
                    <Confetti />
                    <span className="text-6xl mb-3">🏆</span>
                    <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Words Found!</h2>
                    <p className="text-muted-foreground mb-4">{score}/{ROUNDS} correct matches!</p>
                    <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-3xl font-extrabold text-amber-500">{totalXP}</p>
                                <p className="text-xs text-muted-foreground">Total XP</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-extrabold text-teal-500">{score}/{ROUNDS}</p>
                                <p className="text-xs text-muted-foreground">Correct</p>
                            </div>
                        </div>
                    </div>
                    <Mascot mood="happy" size="sm" message="You found them all! 🔤⭐" className="mt-4" />
                    <div className="mt-5 flex gap-3">
                        <button onClick={startGame} className="btn-game bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3">Play Again 🔄</button>
                        <button onClick={() => window.history.back()} className="btn-game bg-white text-gray-700 border-2 border-gray-200 px-6 py-3">Back</button>
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    return null;
}
