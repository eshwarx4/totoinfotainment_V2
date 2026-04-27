import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useCallback, useEffect, useRef } from 'react';
import { ALL_WORDS, WordItem } from '@/data/wordData';
import { shuffle } from '@/lib/gameUtils';
import Mascot from '@/components/mascot/Mascot';
import { MascotMood } from '@/components/mascot/Mascot';
import { Confetti } from '@/components/effects/Confetti';

import { useGameSFX } from '@/hooks/useGameSFX';



type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
    cols: number;
    rows: number;
    pieces: number;
    label: string;
    emoji: string;
    xpMultiplier: number;
}

const DIFFICULTY_MAP: Record<Difficulty, DifficultyConfig> = {
    easy: { cols: 2, rows: 2, pieces: 4, label: 'Easy', emoji: '🟢', xpMultiplier: 1 },
    medium: { cols: 3, rows: 2, pieces: 6, label: 'Medium', emoji: '🟡', xpMultiplier: 1.5 },
    hard: { cols: 3, rows: 3, pieces: 9, label: 'Hard', emoji: '🔴', xpMultiplier: 2 },
};

const ROUNDS_PER_GAME = 5;

function getRandomWords(count: number): WordItem[] {
    // Filter to words with images
    const withImages = ALL_WORDS.filter(w => w.imageUrl);
    return shuffle(withImages).slice(0, count);
}

/**
 * The core Puzzle Board component — real drag-and-drop via Pointer Events API.
 * Works on Android (touch), iOS (touch), and desktop (mouse) with one unified handler.
 */
function PuzzleBoard({
    word,
    difficulty,
    onComplete,
}: {
    word: WordItem;
    difficulty: Difficulty;
    onComplete: (timeMs: number) => void;
}) {
    const config = DIFFICULTY_MAP[difficulty];
    const { cols, rows, pieces } = config;
    const sfx = useGameSFX();

    // Board state
    const [board, setBoard] = useState<(number | null)[]>(Array(pieces).fill(null));
    const [tray, setTray] = useState<number[]>([]);
    const [correctCells, setCorrectCells] = useState<Set<number>>(new Set());
    const [shakingCell, setShakingCell] = useState<number | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Drag state (tracked in refs to avoid stale closures in pointer handlers)
    const dragging = useRef<{
        pieceIndex: number;
        ghostEl: HTMLDivElement;
        offsetX: number;
        offsetY: number;
    } | null>(null);

    const startTime = useRef(Date.now());
    const boardRef = useRef<HTMLDivElement>(null);

    // Initialize puzzle
    useEffect(() => {
        const pieceIndices = Array.from({ length: pieces }, (_, i) => i);
        setTray(shuffle(pieceIndices));
        setBoard(Array(pieces).fill(null));
        setCorrectCells(new Set());
        setIsComplete(false);
        dragging.current = null;
        startTime.current = Date.now();

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => setImageLoaded(true);
        img.onerror = () => setImageLoaded(true);
        img.src = word.imageUrl;
    }, [word, pieces]);

    // Check completion
    useEffect(() => {
        if (correctCells.size === pieces && pieces > 0 && tray.length === 0) {
            setIsComplete(true);
            const elapsed = Date.now() - startTime.current;
            setTimeout(() => onComplete(elapsed), 600);
        }
    }, [correctCells.size, pieces, tray.length, onComplete]);

    // Calculate piece style — crops the right slice of the image
    const cellSize = Math.floor((Math.min(320, window.innerWidth - 48)) / cols);
    const getPieceStyle = (pieceIndex: number, size: number): React.CSSProperties => ({
        backgroundImage: `url(${word.imageUrl})`,
        backgroundSize: `${cols * size}px ${rows * size}px`,
        backgroundPosition: `-${(pieceIndex % cols) * size}px -${Math.floor(pieceIndex / cols) * size}px`,
        width: size,
        height: size,
        borderRadius: 8,
    });

    /* ──────────────────────────────────────────
       Pointer-event drag handlers (start, move, end)
       ────────────────────────────────────────── */

    const onPiecePointerDown = (e: React.PointerEvent, pieceIndex: number) => {
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);

        const trayPieceSize = Math.min(60, cellSize - 8);

        // Create a floating ghost element that follows the pointer
        const ghost = document.createElement('div');
        ghost.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            width: ${trayPieceSize}px;
            height: ${trayPieceSize}px;
            border-radius: 10px;
            border: 3px solid #7c3aed;
            box-shadow: 0 8px 24px rgba(124,58,237,0.45);
            opacity: 0.92;
            transform: scale(1.15);
            transition: none;
            background-image: url(${word.imageUrl});
            background-size: ${cols * trayPieceSize}px ${rows * trayPieceSize}px;
            background-position: -${(pieceIndex % cols) * trayPieceSize}px -${Math.floor(pieceIndex / cols) * trayPieceSize}px;
        `;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        ghost.style.left = `${rect.left}px`;
        ghost.style.top = `${rect.top}px`;
        document.body.appendChild(ghost);

        dragging.current = {
            pieceIndex,
            ghostEl: ghost,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
        };
    };

    const onPiecePointerMove = (e: React.PointerEvent) => {
        if (!dragging.current) return;
        e.preventDefault();
        const { ghostEl, offsetX, offsetY } = dragging.current;
        ghostEl.style.left = `${e.clientX - offsetX}px`;
        ghostEl.style.top = `${e.clientY - offsetY}px`;
    };

    const onPiecePointerUp = (e: React.PointerEvent) => {
        if (!dragging.current) return;
        const { pieceIndex, ghostEl } = dragging.current;

        // Temporarily hide ghost so elementFromPoint finds the cell underneath
        ghostEl.style.display = 'none';
        const targetEl = document.elementFromPoint(e.clientX, e.clientY);
        ghostEl.remove();
        dragging.current = null;

        // Check if we dropped on a cell
        const cellEl = targetEl?.closest('[data-cell-index]') as HTMLElement | null;
        if (!cellEl) return;

        const cellIndex = parseInt(cellEl.dataset.cellIndex ?? '-1', 10);
        if (cellIndex < 0) return;

        if (pieceIndex === cellIndex) {
            // ✅ Correct!
            sfx.playSnap();
            setBoard(prev => { const n = [...prev]; n[cellIndex] = pieceIndex; return n; });
            setTray(prev => prev.filter(p => p !== pieceIndex));
            setCorrectCells(prev => new Set([...prev, cellIndex]));
        } else {
            // ❌ Wrong cell — shake
            sfx.playWrong();
            setShakingCell(cellIndex);
            setTimeout(() => setShakingCell(null), 500);
        }
    };

    if (!imageLoaded) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground mt-3">Loading puzzle...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Puzzle grid */}
            <div
                ref={boardRef}
                className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white/50 backdrop-blur-sm"
                style={{
                    width: cellSize * cols + 2,
                    height: cellSize * rows + 2,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
                    gap: '1px',
                }}
            >
                {Array.from({ length: pieces }).map((_, cellIdx) => {
                    const isPlaced = board[cellIdx] !== null;
                    const isCorrect = correctCells.has(cellIdx);
                    const isShaking = shakingCell === cellIdx;

                    return (
                        <div
                            key={cellIdx}
                            data-cell-index={cellIdx}
                            className={`relative transition-all duration-200 ${isShaking ? 'animate-shake' : ''
                                } ${isPlaced
                                    ? 'ring-2 ring-game-correct/50'
                                    : 'bg-violet-100/60 ring-2 ring-dashed ring-violet-300'
                                }`}
                            style={{ width: cellSize, height: cellSize }}
                        >
                            {isPlaced && (
                                <div
                                    className={`absolute inset-0 transition-all duration-300 ${isCorrect ? 'opacity-100' : 'opacity-80'}`}
                                    style={getPieceStyle(cellIdx, cellSize)}
                                />
                            )}
                            {isCorrect && isComplete && (
                                <div className="absolute inset-0 bg-game-correct/10" />
                            )}
                            {!isPlaced && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-gray-300 text-lg font-bold">{cellIdx + 1}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Word hint */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm">
                <p className="text-sm font-bold text-gray-700">
                    🖼️ Build: <span className="text-violet-600">{word.english}</span>
                </p>
            </div>

            {/* Piece tray — drag pieces from here */}
            {tray.length > 0 && (
                <div className="w-full">
                    <p className="text-xs text-muted-foreground text-center mb-2">
                        Drag a piece onto the matching slot!
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200">
                        {tray.map((pieceIdx) => {
                            const trayPieceSize = Math.min(60, cellSize - 8);
                            return (
                                <div
                                    key={pieceIdx}
                                    className="rounded-xl overflow-hidden cursor-grab active:cursor-grabbing shadow-sm ring-1 ring-gray-200 touch-none select-none"
                                    style={getPieceStyle(pieceIdx, trayPieceSize)}
                                    title={`Piece ${pieceIdx + 1}`}
                                    onPointerDown={(e) => onPiecePointerDown(e, pieceIdx)}
                                    onPointerMove={onPiecePointerMove}
                                    onPointerUp={onPiecePointerUp}
                                    onPointerCancel={() => {
                                        if (dragging.current) {
                                            dragging.current.ghostEl.remove();
                                            dragging.current = null;
                                        }
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Completion screen after solving a puzzle
 */
function PuzzleComplete({
    word,
    timeMs,
    xp,
    roundNum,
    totalRounds,
    onNext,
}: {
    word: WordItem;
    timeMs: number;
    xp: number;
    roundNum: number;
    totalRounds: number;
    onNext: () => void;
}) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Auto-play word audio
        if (word.audioTotoUrl) {
            try {
                const audio = new Audio(word.audioTotoUrl);
                audioRef.current = audio;
                audio.play().catch(() => { });
            } catch { }
        }
        return () => {
            if (audioRef.current) audioRef.current.pause();
        };
    }, [word]);

    const playAudio = () => {
        if (word.audioTotoUrl) {
            try {
                if (audioRef.current) audioRef.current.pause();
                const audio = new Audio(word.audioTotoUrl);
                audioRef.current = audio;
                audio.play().catch(() => { });
            } catch { }
        }
    };

    const timeSec = Math.round(timeMs / 1000);

    return (
        <div className="flex flex-col items-center justify-center text-center px-6 py-8 animate-fade-in">
            <Confetti />

            <Mascot mood="excited" size="md" message="You did it! 🎉" />

            <div className="mt-4 bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                <img
                    src={word.imageUrl}
                    alt={word.english}
                    className="w-28 h-28 object-cover rounded-xl mx-auto mb-3 shadow-md"
                />
                <h3 className="text-2xl font-extrabold text-gray-800">{word.english}</h3>
                <button
                    onClick={playAudio}
                    className="mt-2 inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 rounded-full px-4 py-1.5 text-sm font-semibold active:scale-95 transition-transform"
                >
                    🔊 Listen
                </button>

                <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                    <div className="text-center">
                        <p className="text-amber-500 font-bold text-lg">+{xp}</p>
                        <p className="text-muted-foreground text-xs">XP earned</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-center">
                        <p className="text-blue-500 font-bold text-lg">{timeSec}s</p>
                        <p className="text-muted-foreground text-xs">Time</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5">
                {Array.from({ length: totalRounds }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-all ${i < roundNum ? 'bg-violet-500' : i === roundNum ? 'bg-violet-300 animate-pulse' : 'bg-gray-200'
                            }`}
                    />
                ))}
            </div>

            <button
                onClick={onNext}
                className="mt-5 btn-game bg-gradient-to-r from-violet-500 to-purple-600 text-white px-10 py-3 text-lg"
            >
                {roundNum < totalRounds ? 'Next Puzzle →' : 'See Results! 🏆'}
            </button>
        </div>
    );
}

/**
 * Final results screen
 */
function GameResults({
    totalXP,
    totalTime,
    rounds,
    onPlayAgain,
    onBack,
}: {
    totalXP: number;
    totalTime: number;
    rounds: number;
    onPlayAgain: () => void;
    onBack: () => void;
}) {
    const timeSec = Math.round(totalTime / 1000);

    return (
        <div className="flex flex-col items-center justify-center text-center px-6 py-10 animate-fade-in">
            <Confetti />
            <span className="text-6xl mb-3">🏆</span>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Game Complete!</h2>
            <p className="text-muted-foreground mb-6">You completed {rounds} puzzles!</p>

            <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <p className="text-3xl font-extrabold text-amber-500">{totalXP}</p>
                        <p className="text-xs text-muted-foreground">Total XP</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-extrabold text-blue-500">{timeSec}s</p>
                        <p className="text-xs text-muted-foreground">Total Time</p>
                    </div>
                </div>
            </div>

            <Mascot mood="happy" size="sm" message="You're a puzzle master! 🧩✨" className="mt-4" />

            <div className="mt-6 flex gap-3">
                <button
                    onClick={onPlayAgain}
                    className="btn-game bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3"
                >
                    Play Again 🔄
                </button>
                <button
                    onClick={onBack}
                    className="btn-game bg-white text-gray-700 border-2 border-gray-200 px-6 py-3"
                >
                    Back
                </button>
            </div>
        </div>
    );
}

/**
 * Main Puzzle Game Screen
 */
export default function PuzzleGame() {
    const sfx = useGameSFX();
    const [phase, setPhase] = useState<'select' | 'playing' | 'roundComplete' | 'results'>('select');
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [words, setWords] = useState<WordItem[]>([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [roundTimes, setRoundTimes] = useState<number[]>([]);
    const [totalXP, setTotalXP] = useState(0);
    const [lastRoundXP, setLastRoundXP] = useState(0);
    const [lastRoundTime, setLastRoundTime] = useState(0);
    const [mascotMood, setMascotMood] = useState<MascotMood>('happy');

    const startGame = useCallback((diff: Difficulty) => {
        sfx.playClick();
        setDifficulty(diff);
        setWords(getRandomWords(ROUNDS_PER_GAME));
        setCurrentRound(0);
        setRoundTimes([]);
        setTotalXP(0);
        setPhase('playing');
        setMascotMood('thinking');
    }, [sfx]);

    const handlePuzzleComplete = useCallback(
        (timeMs: number) => {
            const config = DIFFICULTY_MAP[difficulty];
            const speedBonus = Math.max(0, 30 - Math.round(timeMs / 1000));
            const xp = Math.round((20 + speedBonus) * config.xpMultiplier);

            sfx.playVictory();
            setRoundTimes(prev => [...prev, timeMs]);
            setTotalXP(prev => prev + xp);
            setLastRoundXP(xp);
            setLastRoundTime(timeMs);
            setMascotMood('excited');
            setPhase('roundComplete');
        },
        [difficulty, sfx]
    );

    const handleNext = useCallback(() => {
        if (currentRound + 1 >= ROUNDS_PER_GAME) {
            setPhase('results');
        } else {
            setCurrentRound(prev => prev + 1);
            setPhase('playing');
            setMascotMood('thinking');
        }
    }, [currentRound]);

    const handlePlayAgain = useCallback(() => {
        setPhase('select');
        setMascotMood('happy');
    }, []);



    // Difficulty selection screen
    if (phase === 'select') {
        return (
            <PlayGameShell title="Puzzle Builder" icon="🧩" gradient="from-violet-500 to-purple-600">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center">
                    <Mascot mood={mascotMood} size="md" message="Pick a difficulty! 🧩" />

                    <h2 className="text-xl font-extrabold text-gray-800 mt-4 mb-1">Choose Difficulty</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Solve {ROUNDS_PER_GAME} image puzzles!
                    </p>

                    <div className="grid gap-3 w-full max-w-xs">
                        {(Object.entries(DIFFICULTY_MAP) as [Difficulty, DifficultyConfig][]).map(
                            ([key, conf]) => (
                                <button
                                    key={key}
                                    onClick={() => startGame(key)}
                                    className="group relative bg-white rounded-2xl p-4 shadow-md border border-gray-100 text-left
                    transition-all duration-200 active:scale-[0.97] hover:shadow-lg hover:border-violet-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{conf.emoji}</span>
                                        <div className="flex-1">
                                            <h3 className="font-extrabold text-gray-800">{conf.label}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {conf.cols}×{conf.rows} grid • {conf.pieces} pieces
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-amber-500">{conf.xpMultiplier}× XP</p>
                                        </div>
                                    </div>
                                </button>
                            )
                        )}
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    // Playing
    if (phase === 'playing' && words[currentRound]) {
        return (
            <PlayGameShell title="Puzzle Builder" icon="🧩" gradient="from-violet-500 to-purple-600">
                <div className="px-4 py-4">
                    {/* Progress */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: ROUNDS_PER_GAME }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i < currentRound
                                        ? 'w-4 bg-violet-500'
                                        : i === currentRound
                                            ? 'w-8 bg-violet-400'
                                            : 'w-4 bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">
                            {currentRound + 1}/{ROUNDS_PER_GAME}
                        </span>
                    </div>

                    <PuzzleBoard
                        word={words[currentRound]}
                        difficulty={difficulty}
                        onComplete={handlePuzzleComplete}
                    />
                </div>
            </PlayGameShell>
        );
    }

    // Round complete
    if (phase === 'roundComplete' && words[currentRound]) {
        return (
            <PlayGameShell title="Puzzle Builder" icon="🧩" gradient="from-violet-500 to-purple-600">
                <PuzzleComplete
                    word={words[currentRound]}
                    timeMs={lastRoundTime}
                    xp={lastRoundXP}
                    roundNum={currentRound + 1}
                    totalRounds={ROUNDS_PER_GAME}
                    onNext={handleNext}
                />
            </PlayGameShell>
        );
    }

    // Results
    if (phase === 'results') {
        const totalTime = roundTimes.reduce((a, b) => a + b, 0);
        return (
            <PlayGameShell title="Puzzle Builder" icon="🧩" gradient="from-violet-500 to-purple-600">
                <GameResults
                    totalXP={totalXP}
                    totalTime={totalTime}
                    rounds={ROUNDS_PER_GAME}
                    onPlayAgain={handlePlayAgain}
                    onBack={() => window.history.back()}
                />
            </PlayGameShell>
        );
    }

    return null;
}
