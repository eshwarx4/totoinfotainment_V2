import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ALL_WORDS, WordItem } from '@/data/wordData';
import { shuffle, pickRandom } from '@/lib/gameUtils';
import { Confetti } from '@/components/effects/Confetti';
import Mascot from '@/components/mascot/Mascot';
import { useGameSFX } from '@/hooks/useGameSFX';

const ROUNDS = 5;
const HINT_DELAY = 12; // seconds before offering ONE hint
const MAX_HINTS_PER_ROUND = 1; // only 1 hint per round

function getRoundWords(): WordItem[] {
    // Start easy (short words) → get harder (longer words)
    const eligible = ALL_WORDS.filter(w => w.imageUrl && w.english.length >= 3 && w.english.length <= 10);
    const sorted = [...eligible].sort((a, b) => a.english.length - b.english.length);
    // Pick a mix: first few easy, last few hard
    const easy = sorted.slice(0, Math.floor(sorted.length * 0.4));
    const hard = sorted.slice(Math.floor(sorted.length * 0.4));
    const easyPick = pickRandom(easy, Math.min(4, easy.length));
    const hardPick = pickRandom(hard, Math.min(4, hard.length));
    return [...easyPick, ...hardPick].slice(0, ROUNDS);
}

export default function SpellingLearner() {
    const sfx = useGameSFX();
    const [phase, setPhase] = useState<'menu' | 'playing' | 'roundDone' | 'results'>('menu');
    const [words, setWords] = useState<WordItem[]>([]);
    const [round, setRound] = useState(0);
    const [scrambled, setScrambled] = useState<string[]>([]);
    const [placed, setPlaced] = useState<(string | null)[]>([]);
    const [hintRevealed, setHintRevealed] = useState<Set<number>>(new Set());
    const [isCorrect, setIsCorrect] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [totalXP, setTotalXP] = useState(0);
    const [roundXP, setRoundXP] = useState(0);
    const [perfectRounds, setPerfectRounds] = useState(0);
    const [timeOnRound, setTimeOnRound] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [totalHints, setTotalHints] = useState(0);
    const [shakeSlots, setShakeSlots] = useState(false);
    const [wrongSlots, setWrongSlots] = useState<Set<number>>(new Set());

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const currentWord = words[round];

    const setupRound = useCallback((word: WordItem) => {
        const letters = word.english.toUpperCase().split('');
        // Add 2-3 extra distractor letters for harder rounds
        const extras = round >= 4 ? shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')).slice(0, Math.min(3, Math.max(1, round - 3))) : [];
        setScrambled(shuffle([...letters, ...extras]));
        setPlaced(Array(letters.length).fill(null));
        setHintRevealed(new Set());
        setIsCorrect(false);
        setAttempts(0);
        setTimeOnRound(0);
        setHintsUsed(0);
        setShakeSlots(false);
        setWrongSlots(new Set());
    }, [round]);

    const startGame = useCallback(() => {
        sfx.playClick();
        const w = getRoundWords();
        setWords(w);
        setRound(0);
        setTotalXP(0);
        setPerfectRounds(0);
        setTotalHints(0);
        setupRound(w[0]);
        setPhase('playing');
    }, [setupRound, sfx]);

    // Timer for hints
    useEffect(() => {
        if (phase !== 'playing' || isCorrect) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }
        timerRef.current = setInterval(() => {
            setTimeOnRound(t => t + 1);
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase, isCorrect]);

    // Auto-hint: after HINT_DELAY seconds, auto-give ONE hint (only if none used yet)
    useEffect(() => {
        if (phase !== 'playing' || isCorrect || !currentWord) return;
        if (hintsUsed >= MAX_HINTS_PER_ROUND) return; // already used the 1 hint

        if (timeOnRound === HINT_DELAY) {
            // Auto-reveal ONE letter as a hint
            const target = currentWord.english.toUpperCase();
            setHintRevealed(prev => {
                if (prev.size >= MAX_HINTS_PER_ROUND) return prev;
                for (let i = 0; i < target.length; i++) {
                    if (!prev.has(i) && placed[i] === null) {
                        const next = new Set(prev);
                        next.add(i);
                        setPlaced(p => { const np = [...p]; np[i] = target[i]; return np; });
                        setScrambled(s => { const ns = [...s]; const idx = ns.findIndex(l => l === target[i]); if (idx >= 0) ns[idx] = ''; return ns; });
                        setHintsUsed(1);
                        setTotalHints(h => h + 1);
                        sfx.playClick();
                        return next;
                    }
                }
                return prev;
            });
        }
    }, [timeOnRound, phase, isCorrect, currentWord, sfx, hintsUsed, placed]);

    // Handle tapping a scrambled letter
    const handleLetterTap = useCallback((idx: number) => {
        if (isCorrect || !currentWord) return;

        const letter = scrambled[idx];
        if (!letter) return;

        // Find first empty slot (that isn't hint-revealed)
        const emptySlot = placed.findIndex((p, i) => p === null && !hintRevealed.has(i));
        if (emptySlot === -1) return;

        const target = currentWord.english.toUpperCase();
        const newPlaced = [...placed];
        newPlaced[emptySlot] = letter;
        setPlaced(newPlaced);

        const newScrambled = [...scrambled];
        newScrambled[idx] = '';
        setScrambled(newScrambled);

        // Instant per-letter check: if wrong position, flash red + wrong SFX
        if (letter !== target[emptySlot]) {
            sfx.playWrong();
            setWrongSlots(prev => new Set(prev).add(emptySlot));
            // Auto-remove after short delay
            setTimeout(() => {
                setWrongSlots(prev => { const n = new Set(prev); n.delete(emptySlot); return n; });
                setPlaced(p => { const np = [...p]; np[emptySlot] = null; return np; });
                setScrambled(s => { const ns = [...s]; const empty = ns.findIndex(l => l === ''); if (empty >= 0) ns[empty] = letter; else ns.push(letter); return ns; });
            }, 500);
            setAttempts(a => a + 1);
            return;
        }

        // Correct letter placement
        sfx.playClick();

        // Check if all slots filled
        if (newPlaced.every(p => p !== null)) {
            const attempt = newPlaced.join('');
            if (attempt === target) {
                setIsCorrect(true);
                const xp = Math.max(10, 50 - (attempts * 5) - (hintsUsed * 8));
                setRoundXP(xp);
                setTotalXP(x => x + xp);
                if (attempts === 0 && hintsUsed === 0) setPerfectRounds(p => p + 1);
                sfx.playCorrect();
                // Play the real English audio from CSV
                try { const a = new Audio(currentWord.audioEnglishUrl); audioRef.current = a; a.play().catch(() => { }); } catch { }
                setTimeout(() => setPhase('roundDone'), 1500);
            }
        }
    }, [isCorrect, scrambled, placed, currentWord, attempts, hintsUsed, hintRevealed, sfx]);

    // Remove placed letter (tap on slot to remove) — only non-hinted slots
    const handleSlotTap = useCallback((slotIdx: number) => {
        if (isCorrect || hintRevealed.has(slotIdx)) return;
        const letter = placed[slotIdx];
        if (!letter) return;
        sfx.playClick();
        const newPlaced = [...placed];
        newPlaced[slotIdx] = null;
        setPlaced(newPlaced);
        const emptyIdx = scrambled.findIndex(s => s === '');
        if (emptyIdx !== -1) {
            const newScrambled = [...scrambled];
            newScrambled[emptyIdx] = letter;
            setScrambled(newScrambled);
        }
    }, [isCorrect, placed, scrambled, hintRevealed, sfx]);

    // Manual hint button — limited to 1 per round
    const giveHint = useCallback(() => {
        if (!currentWord || isCorrect || hintsUsed >= MAX_HINTS_PER_ROUND) return;
        const target = currentWord.english.toUpperCase();
        sfx.playClick();
        setHintRevealed(prev => {
            if (prev.size >= MAX_HINTS_PER_ROUND) return prev;
            for (let i = 0; i < target.length; i++) {
                if (!prev.has(i) && placed[i] === null) {
                    const next = new Set(prev);
                    next.add(i);
                    setPlaced(p => { const np = [...p]; np[i] = target[i]; return np; });
                    setScrambled(s => { const ns = [...s]; const idx = ns.findIndex(l => l === target[i]); if (idx >= 0) ns[idx] = ''; return ns; });
                    setHintsUsed(1);
                    setTotalHints(h => h + 1);
                    return next;
                }
            }
            return prev;
        });
    }, [currentWord, isCorrect, placed, sfx, hintsUsed]);

    const handleNext = useCallback(() => {
        sfx.playClick();
        if (round + 1 >= ROUNDS) {
            sfx.playVictory();
            setPhase('results');
        } else {
            const next = round + 1;
            setRound(next);
            setupRound(words[next]);
            setPhase('playing');
        }
    }, [round, words, setupRound, sfx]);

    useEffect(() => { return () => { if (audioRef.current) audioRef.current.pause(); }; }, []);

    // ==========================================
    // SCREENS
    // ==========================================
    if (phase === 'menu') {
        return (
            <PlayGameShell title="Spelling Learner" icon="📝" gradient="from-indigo-400 to-blue-600">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center">
                    <Mascot mood="excited" size="md" message="Learn to spell Toto words! 📝✨" />
                    <h2 className="text-xl font-extrabold text-gray-800 mt-4 mb-2">Spelling Learner</h2>
                    <p className="text-sm text-muted-foreground mb-2 max-w-xs">
                        See the image, build the spelling letter by letter!
                    </p>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-6 text-xs text-indigo-700 max-w-xs">
                        <p className="font-semibold">How to play:</p>
                        <p className="mt-1">• Look at the image clue 🖼️</p>
                        <p>• Tap letters to build the spelling</p>
                        <p>• Tap placed letters to remove them</p>
                        <p>• Hints appear if you take too long 💡</p>
                        <p>• Fewer hints = more XP! ⭐</p>
                    </div>
                    <button onClick={startGame} className="btn-game bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-12 py-3 text-lg">
                        Start Spelling! 📝
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'playing' && currentWord) {
        const wordLen = currentWord.english.length;
        const blockSize = Math.min(44, Math.floor(300 / wordLen));
        const target = currentWord.english.toUpperCase();
        const hintProgress = hintsUsed >= MAX_HINTS_PER_ROUND ? 100 : Math.min(100, (timeOnRound / HINT_DELAY) * 100);

        return (
            <PlayGameShell title="Spelling Learner" icon="📝" gradient="from-indigo-400 to-blue-600">
                <div className="flex flex-col items-center px-4 py-4">
                    {/* Progress */}
                    <div className="flex items-center justify-between w-full mb-3">
                        <div className="flex items-center gap-1">
                            {Array.from({ length: ROUNDS }).map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all ${i < round ? 'w-4 bg-indigo-500' : i === round ? 'w-8 bg-indigo-400' : 'w-4 bg-gray-200'}`} />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-600">🪙 {totalXP}</span>
                            <span className="text-xs font-bold text-muted-foreground">{round + 1}/{ROUNDS}</span>
                        </div>
                    </div>

                    {/* Hint timer bar */}
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${timeOnRound >= HINT_DELAY ? 'bg-amber-400' : 'bg-indigo-200'}`}
                            style={{ width: `${hintProgress}%` }}
                        />
                    </div>
                    {timeOnRound >= HINT_DELAY - 2 && timeOnRound < HINT_DELAY && (
                        <p className="text-xs text-amber-600 mb-2 animate-pulse">💡 Hint coming soon...</p>
                    )}

                    {/* Image clue */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 w-full max-w-xs">
                        <img src={currentWord.imageUrl} alt="" className="w-28 h-28 object-cover rounded-xl mx-auto shadow-sm" />
                        <p className="text-xs text-muted-foreground text-center mt-2">Spell this word!</p>
                        <button onClick={() => {
                            try { const a = new Audio(currentWord.audioEnglishUrl); a.play().catch(() => { }); } catch { }
                        }} className="mt-1 mx-auto flex items-center gap-1 bg-indigo-100 text-indigo-600 rounded-full px-3 py-0.5 text-xs active:scale-95 transition-transform">
                            🔊 Listen
                        </button>
                    </div>

                    {/* Answer slots */}
                    <div className={`flex gap-1.5 mb-4 justify-center flex-wrap ${shakeSlots ? 'animate-shake' : ''}`}>
                        {placed.map((letter, i) => {
                            const isHinted = hintRevealed.has(i);
                            const isWrong = wrongSlots.has(i);
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleSlotTap(i)}
                                    className={`flex items-center justify-center rounded-lg font-extrabold text-lg transition-all duration-200 border-2 relative ${isWrong
                                        ? 'bg-red-100 border-red-400 text-red-600 animate-shake'
                                        : letter
                                            ? isCorrect
                                                ? 'bg-green-100 border-green-400 text-green-700 scale-105'
                                                : isHinted
                                                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                                                    : 'bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100 active:scale-95'
                                            : 'bg-gray-50 border-dashed border-gray-300'
                                        }`}
                                    style={{ width: blockSize, height: blockSize }}
                                    disabled={isHinted || isCorrect}
                                >
                                    {letter || (isHinted ? target[i] : null)}
                                    {/* Ghost hint: show correct letter at low flickering opacity when slot is empty */}
                                    {!letter && !isHinted && (
                                        <span
                                            className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none"
                                            style={{ opacity: 0.2 + Math.sin(Date.now() * 0.002 + i) * 0.1, animation: 'pulse 2s ease-in-out infinite' }}
                                        >
                                            {target[i]}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {isCorrect && (
                        <div className="mb-3 text-center animate-fade-in">
                            <p className="text-green-600 font-extrabold text-lg">✅ Correct!</p>
                            <p className="text-xs text-muted-foreground">+{roundXP} XP {hintsUsed === 0 && '⭐ No hints!'}</p>
                        </div>
                    )}

                    {/* Scrambled letters */}
                    <div className="flex gap-2 justify-center flex-wrap mb-4">
                        {scrambled.map((letter, i) => (
                            letter ? (
                                <button
                                    key={i}
                                    onClick={() => handleLetterTap(i)}
                                    className="flex items-center justify-center w-11 h-11 rounded-xl font-extrabold text-lg
                                        bg-white border-2 border-gray-200 text-gray-800 shadow-sm
                                        hover:border-indigo-400 hover:bg-indigo-50 active:scale-90 transition-all duration-150"
                                >
                                    {letter}
                                </button>
                            ) : (
                                <div key={i} className="w-11 h-11 rounded-xl border-2 border-transparent" />
                            )
                        ))}
                    </div>

                    {/* Hint button */}
                    <button
                        onClick={giveHint}
                        disabled={isCorrect || hintsUsed >= MAX_HINTS_PER_ROUND}
                        className="text-xs bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 font-semibold active:scale-95 transition-all disabled:opacity-40"
                    >
                        💡 Give me a hint {hintsUsed >= MAX_HINTS_PER_ROUND ? '(used)' : ''}
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'roundDone' && currentWord) {
        return (
            <PlayGameShell title="Spelling Learner" icon="📝" gradient="from-indigo-400 to-blue-600">
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center animate-fade-in">
                    <Mascot mood="excited" size="sm" message={hintsUsed === 0 ? 'Perfect spelling! 🌟' : 'Great job! Keep learning! 📝'} />
                    <div className="mt-3 bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                        <img src={currentWord.imageUrl} alt="" className="w-20 h-20 object-cover rounded-xl mx-auto mb-2 shadow-sm" />
                        <h3 className="text-2xl font-extrabold text-gray-800 tracking-wider">{currentWord.english.toUpperCase()}</h3>
                        <button onClick={() => {
                            try { const a = new Audio(currentWord.audioEnglishUrl); a.play().catch(() => { }); } catch { }
                        }} className="mt-1.5 inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-xs font-semibold active:scale-95 transition-transform">
                            🔊 Listen
                        </button>
                        <div className="mt-3 flex items-center justify-center gap-4">
                            <div className="text-center">
                                <p className="text-amber-500 font-bold text-lg">+{roundXP}</p>
                                <p className="text-[10px] text-muted-foreground">XP</p>
                            </div>
                            <div className="text-center">
                                <p className={`font-bold text-lg ${hintsUsed === 0 ? 'text-green-500' : 'text-amber-500'}`}>{hintsUsed}</p>
                                <p className="text-[10px] text-muted-foreground">Hints</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                        {Array.from({ length: ROUNDS }).map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full ${i <= round ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                    <button onClick={handleNext} className="mt-5 btn-game bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-10 py-3 text-lg">
                        {round + 1 < ROUNDS ? 'Next Word →' : 'See Results! 🏆'}
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'results') {
        return (
            <PlayGameShell title="Spelling Learner" icon="📝" gradient="from-indigo-400 to-blue-600">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
                    <Confetti />
                    <span className="text-6xl mb-3">🏆</span>
                    <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Spelling Master!</h2>
                    <p className="text-muted-foreground mb-4">You spelled {ROUNDS} Toto words!</p>
                    <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <p className="text-2xl font-extrabold text-amber-500">{totalXP}</p>
                                <p className="text-xs text-muted-foreground">Total XP</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-extrabold text-indigo-500">{perfectRounds}</p>
                                <p className="text-xs text-muted-foreground">Perfect</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-extrabold text-amber-400">{totalHints}</p>
                                <p className="text-xs text-muted-foreground">Hints</p>
                            </div>
                        </div>
                    </div>
                    <Mascot mood="happy" size="sm" message={perfectRounds >= 4 ? 'Spelling genius! 📝⭐' : 'Great practice! Keep it up! 💪'} className="mt-4" />
                    <div className="mt-5 flex gap-3">
                        <button onClick={startGame} className="btn-game bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3">Play Again 🔄</button>
                        <button onClick={() => window.history.back()} className="btn-game bg-white text-gray-700 border-2 border-gray-200 px-6 py-3">Back</button>
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    return null;
}
