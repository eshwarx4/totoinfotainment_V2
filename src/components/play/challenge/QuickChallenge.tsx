import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ALL_WORDS, WordItem } from '@/data/wordData';
import { shuffle, pickRandom, generateOptions } from '@/lib/gameUtils';
import { Confetti } from '@/components/effects/Confetti';
import Mascot from '@/components/mascot/Mascot';
import { useGameSFX } from '@/hooks/useGameSFX';

const TOTAL_TIME = 60; // 60 seconds challenge
const POINTS_CORRECT = 10;
const POINTS_WRONG = -3;
const STREAK_BONUS = 5;

interface Question {
    word: WordItem;
    options: WordItem[];
}

function generateQuestions(count: number): Question[] {
    const eligible = ALL_WORDS.filter(w => w.imageUrl);
    const picked = pickRandom(eligible, count);
    return picked.map(w => ({
        word: w,
        options: generateOptions(w, eligible, 3),
    }));
}

export default function QuickChallenge() {
    const sfx = useGameSFX();
    const [phase, setPhase] = useState<'menu' | 'playing' | 'results'>('menu');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
    const [score, setScore] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [wrong, setWrong] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startGame = useCallback(() => {
        setQuestions(generateQuestions(30)); // enough for 60s
        setCurrentQ(0);
        setTimeLeft(TOTAL_TIME);
        setScore(0);
        setCorrect(0);
        setWrong(0);
        setStreak(0);
        setBestStreak(0);
        setSelected(null);
        setFeedback(null);
        setPhase('playing');
    }, []);

    // Timer
    useEffect(() => {
        if (phase !== 'playing') return;
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current!);
                    setPhase('results');
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase]);

    const handleAnswer = useCallback((wordId: string) => {
        if (feedback || !questions[currentQ]) return;
        const q = questions[currentQ];
        const isCorrect = wordId === q.word.id;

        setSelected(wordId);
        setFeedback(isCorrect ? 'correct' : 'wrong');

        if (isCorrect) {
            sfx.playCorrect();
            const streakBonus = streak >= 2 ? STREAK_BONUS * (streak - 1) : 0;
            setScore(s => s + POINTS_CORRECT + streakBonus);
            setCorrect(c => c + 1);
            setStreak(s => {
                const next = s + 1;
                setBestStreak(b => Math.max(b, next));
                return next;
            });
        } else {
            sfx.playWrong();
            setScore(s => Math.max(0, s + POINTS_WRONG));
            setWrong(w => w + 1);
            setStreak(0);
        }

        // Quick advance
        setTimeout(() => {
            if (currentQ + 1 >= questions.length) {
                // Generate more questions
                setQuestions(prev => [...prev, ...generateQuestions(15)]);
            }
            setCurrentQ(c => c + 1);
            setSelected(null);
            setFeedback(null);
        }, isCorrect ? 400 : 600);
    }, [feedback, questions, currentQ, streak]);

    // ==========================================
    // SCREENS
    // ==========================================
    if (phase === 'menu') {
        return (
            <PlayGameShell title="Quick Challenge" icon="⚡" gradient="from-purple-400 to-pink-500">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center">
                    <Mascot mood="excited" size="md" message="How fast can you go? ⚡🧠" />
                    <h2 className="text-xl font-extrabold text-gray-800 mt-4 mb-2">Quick Challenge</h2>
                    <p className="text-sm text-muted-foreground mb-2 max-w-xs">
                        60 seconds! Match as many images to words as possible!
                    </p>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-6 text-xs text-purple-700 max-w-xs">
                        <p className="font-semibold">How to play:</p>
                        <p className="mt-1">• See an image, tap the correct word</p>
                        <p>• +{POINTS_CORRECT} for correct, {POINTS_WRONG} for wrong</p>
                        <p>• Build streaks for bonus points! 🔥</p>
                        <p>• Beat the clock — {TOTAL_TIME} seconds!</p>
                    </div>
                    <button onClick={startGame} className="btn-game bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-3 text-lg">
                        Start Challenge! ⚡
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'playing' && questions[currentQ]) {
        const q = questions[currentQ];
        const pct = Math.max(0, (timeLeft / TOTAL_TIME) * 100);
        const isLow = timeLeft <= 10;

        return (
            <PlayGameShell title="Quick Challenge" icon="⚡" gradient="from-purple-400 to-pink-500">
                <div className="px-4 py-3">
                    {/* Timer + score */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-xl font-extrabold ${isLow ? 'text-red-500 animate-pulse' : 'text-purple-600'}`}>
                                {timeLeft}s
                            </span>
                            {streak >= 3 && (
                                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full animate-pulse">
                                    🔥 x{streak}
                                </span>
                            )}
                        </div>
                        <span className="text-lg font-extrabold text-amber-500">🪙 {score}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                        <div className={`h-full rounded-full transition-all duration-1000 ${isLow ? 'bg-red-500' : pct > 50 ? 'bg-purple-500' : 'bg-amber-500'
                            }`} style={{ width: `${pct}%` }} />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-4 mb-3 text-xs">
                        <span className="text-green-600 font-bold">✅ {correct}</span>
                        <span className="text-red-500 font-bold">❌ {wrong}</span>
                    </div>

                    {/* Image */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 text-center">
                        <img
                            src={q.word.imageUrl}
                            alt=""
                            className="w-28 h-28 object-cover rounded-xl mx-auto shadow-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">What is this?</p>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-2">
                        {q.options.map(opt => {
                            const isSelected = selected === opt.id;
                            const isCorrectOpt = opt.id === q.word.id;
                            const showCorrect = feedback && isCorrectOpt;
                            const showWrong = isSelected && !isCorrectOpt;

                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handleAnswer(opt.id)}
                                    disabled={!!feedback}
                                    className={`px-3 py-3 rounded-xl font-bold text-sm transition-all duration-150 ${showCorrect ? 'bg-green-100 text-green-700 ring-2 ring-green-400 scale-[1.03]'
                                        : showWrong ? 'bg-red-100 text-red-700 ring-2 ring-red-400'
                                            : 'bg-white text-gray-700 shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-95'
                                        }`}
                                >
                                    {opt.english}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'results') {
        const total = correct + wrong;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        return (
            <PlayGameShell title="Quick Challenge" icon="⚡" gradient="from-purple-400 to-pink-500">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
                    <Confetti />
                    <span className="text-6xl mb-3">⚡</span>
                    <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Time's Up!</h2>
                    <p className="text-muted-foreground mb-4">{correct} correct in {TOTAL_TIME} seconds!</p>

                    <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="text-center">
                                <p className="text-3xl font-extrabold text-amber-500">{score}</p>
                                <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-extrabold text-purple-500">{accuracy}%</p>
                                <p className="text-xs text-muted-foreground">Accuracy</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                            <div className="text-center">
                                <p className="text-lg font-extrabold text-green-500">{correct}</p>
                                <p className="text-[10px] text-muted-foreground">Correct</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-extrabold text-red-400">{wrong}</p>
                                <p className="text-[10px] text-muted-foreground">Wrong</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-extrabold text-orange-500">{bestStreak}</p>
                                <p className="text-[10px] text-muted-foreground">Best Streak</p>
                            </div>
                        </div>
                    </div>

                    <Mascot
                        mood={correct >= 10 ? 'happy' : 'thinking'}
                        size="sm"
                        message={correct >= 10 ? 'Lightning fast! ⚡⭐' : 'Practice makes perfect! 💪'}
                        className="mt-4"
                    />

                    <div className="mt-5 flex gap-3">
                        <button onClick={startGame} className="btn-game bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3">
                            Try Again ⚡
                        </button>
                        <button onClick={() => window.history.back()} className="btn-game bg-white text-gray-700 border-2 border-gray-200 px-6 py-3">
                            Back
                        </button>
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    return null;
}
