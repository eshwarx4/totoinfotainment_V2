import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ALL_WORDS, WordItem } from '@/data/wordData';
import { shuffle, pickRandom } from '@/lib/gameUtils';
import { Confetti } from '@/components/effects/Confetti';
import Mascot from '@/components/mascot/Mascot';

const ROUNDS = 6;

function getRoundWords(): WordItem[] {
    // Pick words with short-ish names (≤8 chars) for easier spelling
    const eligible = ALL_WORDS.filter(w => w.imageUrl && w.english.length <= 8);
    return pickRandom(eligible, ROUNDS);
}

export default function BlockBuilder() {
    const [phase, setPhase] = useState<'menu' | 'playing' | 'roundDone' | 'results'>('menu');
    const [words, setWords] = useState<WordItem[]>([]);
    const [round, setRound] = useState(0);
    const [scrambled, setScrambled] = useState<string[]>([]);
    const [placed, setPlaced] = useState<(string | null)[]>([]);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [totalXP, setTotalXP] = useState(0);
    const [roundXP, setRoundXP] = useState(0);
    const [perfectRounds, setPerfectRounds] = useState(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const currentWord = words[round];

    const setupRound = useCallback((word: WordItem) => {
        const letters = word.english.toUpperCase().split('');
        setScrambled(shuffle([...letters]));
        setPlaced(Array(letters.length).fill(null));
        setSelectedIdx(null);
        setIsCorrect(false);
        setAttempts(0);
    }, []);

    const startGame = useCallback(() => {
        const w = getRoundWords();
        setWords(w);
        setRound(0);
        setTotalXP(0);
        setPerfectRounds(0);
        setupRound(w[0]);
        setPhase('playing');
    }, [setupRound]);

    // Handle tapping a scrambled letter
    const handleLetterTap = useCallback((idx: number) => {
        if (isCorrect) return;

        if (selectedIdx === idx) {
            setSelectedIdx(null);
            return;
        }

        // Find first empty slot
        const emptySlot = placed.findIndex(p => p === null);
        if (emptySlot === -1) return;

        const letter = scrambled[idx];
        const newPlaced = [...placed];
        newPlaced[emptySlot] = letter;
        setPlaced(newPlaced);

        // Remove from scrambled (mark as used)
        const newScrambled = [...scrambled];
        newScrambled[idx] = '';
        setScrambled(newScrambled);

        // Check if all slots filled
        if (newPlaced.every(p => p !== null)) {
            const attempt = newPlaced.join('');
            const target = currentWord.english.toUpperCase();
            setAttempts(a => a + 1);

            if (attempt === target) {
                setIsCorrect(true);
                const xp = Math.max(10, 40 - (attempts * 10));
                setRoundXP(xp);
                setTotalXP(x => x + xp);
                if (attempts === 0) setPerfectRounds(p => p + 1);

                if (currentWord.audioTotoUrl) {
                    try {
                        const a = new Audio(currentWord.audioTotoUrl);
                        audioRef.current = a;
                        a.play().catch(() => { });
                    } catch { }
                }
                setTimeout(() => setPhase('roundDone'), 1200);
            } else {
                // Wrong — shake and reset
                setTimeout(() => {
                    const letters = currentWord.english.toUpperCase().split('');
                    setScrambled(shuffle([...letters]));
                    setPlaced(Array(letters.length).fill(null));
                }, 500);
            }
        }

        setSelectedIdx(null);
    }, [isCorrect, selectedIdx, placed, scrambled, currentWord, attempts]);

    // Remove placed letter (tap on slot to remove)
    const handleSlotTap = useCallback((slotIdx: number) => {
        if (isCorrect) return;
        const letter = placed[slotIdx];
        if (!letter) return;

        const newPlaced = [...placed];
        newPlaced[slotIdx] = null;
        setPlaced(newPlaced);

        // Add back to scrambled
        const emptyIdx = scrambled.findIndex(s => s === '');
        if (emptyIdx !== -1) {
            const newScrambled = [...scrambled];
            newScrambled[emptyIdx] = letter;
            setScrambled(newScrambled);
        }
    }, [isCorrect, placed, scrambled]);

    const handleNext = useCallback(() => {
        if (round + 1 >= ROUNDS) {
            setPhase('results');
        } else {
            const next = round + 1;
            setRound(next);
            setupRound(words[next]);
            setPhase('playing');
        }
    }, [round, words, setupRound]);

    // Cleanup
    useEffect(() => {
        return () => { if (audioRef.current) audioRef.current.pause(); };
    }, []);

    // ==========================================
    // SCREENS
    // ==========================================
    if (phase === 'menu') {
        return (
            <PlayGameShell title="Block Builder" icon="🧱" gradient="from-blue-400 to-indigo-500">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center">
                    <Mascot mood="excited" size="md" message="Build words with blocks! 🧱✨" />
                    <h2 className="text-xl font-extrabold text-gray-800 mt-4 mb-2">Block Builder</h2>
                    <p className="text-sm text-muted-foreground mb-2 max-w-xs">
                        See an image, arrange the letter blocks to spell the word!
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-xs text-blue-700 max-w-xs">
                        <p className="font-semibold">How to play:</p>
                        <p className="mt-1">• Look at the image clue</p>
                        <p>• Tap letters to place them in order</p>
                        <p>• Tap placed letters to remove them</p>
                        <p>• Spell {ROUNDS} words correctly!</p>
                    </div>
                    <button onClick={startGame} className="btn-game bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-12 py-3 text-lg">
                        Start Building! 🧱
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'playing' && currentWord) {
        const wordLen = currentWord.english.length;
        const blockSize = Math.min(48, Math.floor((280) / wordLen));

        return (
            <PlayGameShell title="Block Builder" icon="🧱" gradient="from-blue-400 to-indigo-500">
                <div className="flex flex-col items-center px-4 py-4">
                    {/* Progress */}
                    <div className="flex items-center justify-between w-full mb-3">
                        <div className="flex items-center gap-1">
                            {Array.from({ length: ROUNDS }).map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all ${i < round ? 'w-4 bg-blue-500' : i === round ? 'w-8 bg-blue-400' : 'w-4 bg-gray-200'
                                    }`} />
                            ))}
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">{round + 1}/{ROUNDS}</span>
                    </div>

                    {/* Image clue */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 w-full max-w-xs">
                        <img
                            src={currentWord.imageUrl}
                            alt=""
                            className="w-24 h-24 object-cover rounded-xl mx-auto shadow-sm"
                        />
                        <p className="text-xs text-muted-foreground text-center mt-2">What is this? Spell it!</p>
                    </div>

                    {/* Answer slots */}
                    <div className="flex gap-1.5 mb-5 justify-center flex-wrap">
                        {placed.map((letter, i) => (
                            <button
                                key={i}
                                onClick={() => handleSlotTap(i)}
                                className={`flex items-center justify-center rounded-lg font-extrabold text-lg transition-all duration-200 border-2 ${letter
                                        ? isCorrect
                                            ? 'bg-green-100 border-green-400 text-green-700 scale-105'
                                            : 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 active:scale-95'
                                        : 'bg-gray-50 border-dashed border-gray-300 text-gray-300'
                                    }`}
                                style={{ width: blockSize, height: blockSize }}
                            >
                                {letter || '·'}
                            </button>
                        ))}
                    </div>

                    {isCorrect && (
                        <div className="mb-3 text-center animate-fade-in">
                            <p className="text-green-600 font-extrabold text-lg">✅ Correct!</p>
                            <p className="text-xs text-muted-foreground">+{roundXP} XP</p>
                        </div>
                    )}

                    {/* Scrambled letters */}
                    <div className="flex gap-2 justify-center flex-wrap">
                        {scrambled.map((letter, i) => (
                            letter ? (
                                <button
                                    key={i}
                                    onClick={() => handleLetterTap(i)}
                                    className="flex items-center justify-center w-11 h-11 rounded-xl font-extrabold text-lg
                    bg-white border-2 border-gray-200 text-gray-800 shadow-sm
                    hover:border-blue-400 hover:bg-blue-50 active:scale-90 transition-all duration-150"
                                >
                                    {letter}
                                </button>
                            ) : (
                                <div key={i} className="w-11 h-11 rounded-xl border-2 border-transparent" />
                            )
                        ))}
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'roundDone' && currentWord) {
        return (
            <PlayGameShell title="Block Builder" icon="🧱" gradient="from-blue-400 to-indigo-500">
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center animate-fade-in">
                    <Mascot mood="excited" size="sm" message="Great spelling! 🧱✨" />
                    <div className="mt-3 bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                        <img src={currentWord.imageUrl} alt="" className="w-20 h-20 object-cover rounded-xl mx-auto mb-2 shadow-sm" />
                        <h3 className="text-xl font-extrabold text-gray-800">{currentWord.english}</h3>
                        <button onClick={() => {
                            if (currentWord.audioTotoUrl) try { new Audio(currentWord.audioTotoUrl).play().catch(() => { }); } catch { }
                        }} className="mt-1.5 inline-flex items-center gap-1 bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold active:scale-95 transition-transform">
                            🔊 Listen in Toto
                        </button>
                        <p className="mt-2 text-amber-500 font-bold">+{roundXP} XP</p>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                        {Array.from({ length: ROUNDS }).map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full ${i <= round ? 'bg-blue-500' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                    <button onClick={handleNext} className="mt-5 btn-game bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-10 py-3 text-lg">
                        {round + 1 < ROUNDS ? 'Next Word →' : 'See Results! 🏆'}
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'results') {
        return (
            <PlayGameShell title="Block Builder" icon="🧱" gradient="from-blue-400 to-indigo-500">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
                    <Confetti />
                    <span className="text-6xl mb-3">🏆</span>
                    <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Words Built!</h2>
                    <p className="text-muted-foreground mb-4">You spelled {ROUNDS} Toto words!</p>
                    <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-3xl font-extrabold text-amber-500">{totalXP}</p>
                                <p className="text-xs text-muted-foreground">Total XP</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-extrabold text-blue-500">{perfectRounds}</p>
                                <p className="text-xs text-muted-foreground">Perfect</p>
                            </div>
                        </div>
                    </div>
                    <Mascot mood="happy" size="sm" message="You're a word builder! 🧱⭐" className="mt-4" />
                    <div className="mt-5 flex gap-3">
                        <button onClick={startGame} className="btn-game bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3">Play Again 🔄</button>
                        <button onClick={() => window.history.back()} className="btn-game bg-white text-gray-700 border-2 border-gray-200 px-6 py-3">Back</button>
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    return null;
}
