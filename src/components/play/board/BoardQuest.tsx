import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ALL_WORDS, WordItem } from '@/data/wordData';
import { shuffle, pickRandom } from '@/lib/gameUtils';
import { Confetti } from '@/components/effects/Confetti';
import Mascot from '@/components/mascot/Mascot';
import { useGameSFX } from '@/hooks/useGameSFX';

// ==========================================
// CONFIG
// ==========================================
const BOARD_SIZE = 25;
const NUM_SNAKES = 3;
const NUM_LADDERS = 3;
const NUM_DIAMONDS = 2;
const NUM_DOUBLE_XP = 2;
const COIN_PER_CORRECT = 15;
const PENALTY_STEPS = 2;
const LADDER_JUMP = 4;
const SNAKE_SLIDE = 4;

type TileType = 'normal' | 'snake' | 'ladder' | 'diamond' | 'doubleXP';

interface BoardTile {
    index: number;
    type: TileType;
    x: number;
    y: number;
}

// Build a winding path board (5×5 boustrophedon)
function buildBoard(): BoardTile[] {
    const tiles: BoardTile[] = [];
    const specialIndices = new Set<number>();
    specialIndices.add(0);
    specialIndices.add(BOARD_SIZE - 1);

    // Place special tiles randomly (not on first, last, or overlapping)
    const placeSpecial = (count: number, type: TileType) => {
        let placed = 0;
        while (placed < count) {
            const idx = Math.floor(Math.random() * (BOARD_SIZE - 2)) + 1;
            if (!specialIndices.has(idx)) {
                specialIndices.add(idx);
                tiles.push({ index: idx, type, x: 0, y: 0 }); // positions calculated below
                placed++;
            }
        }
    };

    // Create all tiles first as normal
    for (let i = 0; i < BOARD_SIZE; i++) {
        const existingSpecial = tiles.find(t => t.index === i);
        if (!existingSpecial) {
            tiles.push({ index: i, type: 'normal', x: 0, y: 0 });
        }
    }

    // Now place specials
    tiles.length = 0;
    specialIndices.clear();
    specialIndices.add(0);
    specialIndices.add(BOARD_SIZE - 1);

    const specialMap = new Map<number, TileType>();
    const tryPlace = (count: number, type: TileType) => {
        let placed = 0;
        let attempts = 0;
        while (placed < count && attempts < 100) {
            const idx = Math.floor(Math.random() * (BOARD_SIZE - 2)) + 1;
            if (!specialIndices.has(idx)) {
                specialIndices.add(idx);
                specialMap.set(idx, type);
                placed++;
            }
            attempts++;
        }
    };

    tryPlace(NUM_SNAKES, 'snake');
    tryPlace(NUM_LADDERS, 'ladder');
    tryPlace(NUM_DIAMONDS, 'diamond');
    tryPlace(NUM_DOUBLE_XP, 'doubleXP');

    // Assign positions (winding path, 5 columns)
    const cols = 5;
    const rows = Math.ceil(BOARD_SIZE / cols);
    for (let i = 0; i < BOARD_SIZE; i++) {
        const row = Math.floor(i / cols);
        const colInRow = i % cols;
        // Boustrophedon: even rows go left→right, odd rows go right→left
        const col = row % 2 === 0 ? colInRow : (cols - 1 - colInRow);
        // Flip vertically so tile 0 is at bottom
        const visualRow = rows - 1 - row;

        tiles.push({
            index: i,
            type: specialMap.get(i) || 'normal',
            x: col,
            y: visualRow,
        });
    }

    return tiles;
}

function getWordsWithImages(): WordItem[] {
    return ALL_WORDS.filter(w => w.imageUrl);
}

interface QuestionData {
    word: WordItem;
    options: string[];
    correctIndex: number;
}

function generateQuestion(allWords: WordItem[]): QuestionData {
    const word = pickRandom(allWords, 1)[0];
    const wrongs = pickRandom(allWords.filter(w => w.id !== word.id), 2).map(w => w.english);
    const options = shuffle([word.english, ...wrongs]);
    const correctIndex = options.indexOf(word.english);
    return { word, options, correctIndex };
}

// Tile visual config
const TILE_EMOJIS: Record<TileType, string> = {
    normal: '',
    snake: '🐍',
    ladder: '🪜',
    diamond: '💎',
    doubleXP: '⭐',
};

const TILE_COLORS: Record<TileType, string> = {
    normal: 'bg-amber-50 border-amber-200',
    snake: 'bg-red-50 border-red-300',
    ladder: 'bg-green-50 border-green-300',
    diamond: 'bg-blue-50 border-blue-300',
    doubleXP: 'bg-yellow-50 border-yellow-300',
};

// ==========================================
// DICE COMPONENT
// ==========================================
function DiceFace({ value, rolling }: { value: number; rolling: boolean }) {
    const dots: { x: number; y: number }[][] = [
        [], // 0
        [{ x: 50, y: 50 }], // 1
        [{ x: 25, y: 25 }, { x: 75, y: 75 }], // 2
        [{ x: 25, y: 25 }, { x: 50, y: 50 }, { x: 75, y: 75 }], // 3
        [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 75 }], // 4
        [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 50, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }], // 5
        [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }], // 6
    ];

    return (
        <div className={`w-20 h-20 bg-white rounded-2xl shadow-xl border-2 border-gray-200 relative ${rolling ? 'animate-spin' : ''}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {(dots[value] || []).map((dot, i) => (
                    <circle key={i} cx={dot.x} cy={dot.y} r="10" fill="#1e293b" />
                ))}
            </svg>
        </div>
    );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function BoardQuest() {
    const sfx = useGameSFX();
    const allWords = useMemo(() => getWordsWithImages(), []);
    const [board] = useState(() => buildBoard());

    const [phase, setPhase] = useState<'menu' | 'rolling' | 'moving' | 'question' | 'answered' | 'special' | 'finished'>('menu');
    const [playerPos, setPlayerPos] = useState(0);
    const [targetPos, setTargetPos] = useState(0);
    const [diceValue, setDiceValue] = useState(1);
    const [diceRolling, setDiceRolling] = useState(false);
    const [coins, setCoins] = useState(0);
    const [diamonds, setDiamonds] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [question, setQuestion] = useState<QuestionData | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [doubleXPActive, setDoubleXPActive] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ============ ROLL DICE ============
    const rollDice = useCallback(() => {
        sfx.playClick();
        setDiceRolling(true);
        setPhase('rolling');

        // Animate dice for 1 second
        let count = 0;
        const interval = setInterval(() => {
            setDiceValue(Math.floor(Math.random() * 6) + 1);
            count++;
            if (count >= 8) {
                clearInterval(interval);
                const finalValue = Math.floor(Math.random() * 6) + 1;
                setDiceValue(finalValue);
                setDiceRolling(false);
                sfx.playSnap();

                // Calculate target position
                const newPos = Math.min(BOARD_SIZE - 1, playerPos + finalValue);
                setTargetPos(newPos);
                setPhase('moving');

                // Animate movement step by step
                let currentStep = playerPos;
                const moveStep = () => {
                    if (currentStep < newPos) {
                        currentStep++;
                        setPlayerPos(currentStep);
                        sfx.playTick();
                        moveTimerRef.current = setTimeout(moveStep, 300);
                    } else {
                        // Arrived at destination
                        if (currentStep >= BOARD_SIZE - 1) {
                            // Won!
                            setShowConfetti(true);
                            sfx.playVictory();
                            setPhase('finished');
                        } else {
                            // Show question
                            const q = generateQuestion(allWords);
                            setQuestion(q);
                            setSelectedAnswer(null);
                            setPhase('question');
                            // Play toto audio
                            if (q.word.audioTotoUrl) {
                                try { new Audio(q.word.audioTotoUrl).play().catch(() => { }); } catch { }
                            }
                        }
                    }
                };
                moveTimerRef.current = setTimeout(moveStep, 400);
            }
        }, 120);
    }, [playerPos, allWords, sfx]);

    // ============ ANSWER QUESTION ============
    const handleAnswer = useCallback((optionIndex: number) => {
        if (selectedAnswer !== null || !question) return;
        setSelectedAnswer(optionIndex);

        const isCorrect = optionIndex === question.correctIndex;

        if (isCorrect) {
            sfx.playCorrect();
            const reward = doubleXPActive ? COIN_PER_CORRECT * 2 : COIN_PER_CORRECT;
            setCoins(c => c + reward);
            setCorrectCount(c => c + 1);
            setDoubleXPActive(false);
            setFeedback(`✅ Correct! +${reward} 🪙`);
            // Play English audio
            if (question.word.audioEnglishUrl) {
                try { new Audio(question.word.audioEnglishUrl).play().catch(() => { }); } catch { }
            }
        } else {
            sfx.playWrong();
            setWrongCount(w => w + 1);
            setFeedback(`❌ Wrong! Go back ${PENALTY_STEPS} steps`);
            // Move back
            const newPos = Math.max(0, playerPos - PENALTY_STEPS);
            setTimeout(() => setPlayerPos(newPos), 800);
        }

        setPhase('answered');

        // After showing feedback, check for special tile
        setTimeout(() => {
            setFeedback(null);
            const currentTile = board.find(t => t.index === playerPos);
            if (currentTile && currentTile.type !== 'normal' && isCorrect) {
                handleSpecialTile(currentTile.type);
            } else {
                setPhase('rolling');
            }
        }, 1800);
    }, [selectedAnswer, question, playerPos, doubleXPActive, sfx, board]);

    // ============ SPECIAL TILES ============
    const handleSpecialTile = useCallback((type: TileType) => {
        setPhase('special');

        if (type === 'ladder') {
            sfx.playCorrect();
            setFeedback(`🪜 Ladder! Jump forward ${LADDER_JUMP} tiles!`);
            const newPos = Math.min(BOARD_SIZE - 1, playerPos + LADDER_JUMP);
            setTimeout(() => setPlayerPos(newPos), 500);
        } else if (type === 'snake') {
            sfx.playWrong();
            setFeedback(`🐍 Snake! Slide back ${SNAKE_SLIDE} tiles!`);
            const newPos = Math.max(0, playerPos - SNAKE_SLIDE);
            setTimeout(() => setPlayerPos(newPos), 500);
        } else if (type === 'diamond') {
            sfx.playCollect();
            setDiamonds(d => d + 1);
            setFeedback('💎 Diamond! +1 Diamond!');
        } else if (type === 'doubleXP') {
            sfx.playCollect();
            setDoubleXPActive(true);
            setFeedback('⭐ Double XP! Next correct = 2× coins!');
        }

        setTimeout(() => {
            setFeedback(null);
            if (playerPos >= BOARD_SIZE - 1) {
                setShowConfetti(true);
                sfx.playVictory();
                setPhase('finished');
            } else {
                setPhase('rolling');
            }
        }, 1500);
    }, [playerPos, sfx]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
        };
    }, []);

    // ============ RESET ============
    const resetGame = useCallback(() => {
        setPlayerPos(0);
        setTargetPos(0);
        setDiceValue(1);
        setCoins(0);
        setDiamonds(0);
        setCorrectCount(0);
        setWrongCount(0);
        setDoubleXPActive(false);
        setShowConfetti(false);
        setFeedback(null);
        setPhase('rolling');
        sfx.playClick();
    }, [sfx]);

    // ==========================================
    // RENDERS
    // ==========================================

    // Menu
    if (phase === 'menu') {
        return (
            <PlayGameShell title="Board Quest" icon="🎲" gradient="from-amber-500 to-orange-600">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center">
                    <Mascot mood="excited" size="md" message="Roll the dice & explore Totopara! 🎲🏘️" />
                    <h2 className="text-xl font-extrabold text-gray-800 mt-4 mb-2">Totopara Board Quest</h2>
                    <p className="text-sm text-muted-foreground mb-2 max-w-xs">
                        Roll the dice, move across the village, and answer word questions to earn coins!
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-xs text-amber-700 max-w-xs text-left">
                        <p className="font-semibold">How to play:</p>
                        <p className="mt-1">🎲 Tap to roll the dice and move</p>
                        <p>❓ Answer word questions on each tile</p>
                        <p>✅ Correct = earn coins! ❌ Wrong = go back 2</p>
                        <p>🪜 Ladders jump you forward!</p>
                        <p>🐍 Snakes slide you back!</p>
                        <p>💎 Collect diamonds & ⭐ Double XP tiles!</p>
                        <p>🏆 Reach tile 25 to win!</p>
                    </div>
                    <button
                        onClick={resetGame}
                        className="btn-game bg-gradient-to-r from-amber-500 to-orange-600 text-white px-12 py-3 text-lg"
                    >
                        Start Quest! 🎲
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    // Finished
    if (phase === 'finished') {
        return (
            <PlayGameShell title="Board Quest" icon="🎲" gradient="from-amber-500 to-orange-600">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
                    {showConfetti && <Confetti />}
                    <span className="text-6xl mb-3">🏆</span>
                    <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Quest Complete!</h2>
                    <p className="text-muted-foreground mb-4">You conquered the Totopara Board!</p>

                    <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-extrabold text-amber-500">🪙 {coins}</p>
                                <p className="text-[10px] text-muted-foreground">Coins</p>
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-blue-500">💎 {diamonds}</p>
                                <p className="text-[10px] text-muted-foreground">Diamonds</p>
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-green-500">{correctCount}</p>
                                <p className="text-[10px] text-muted-foreground">Correct</p>
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-red-400">{wrongCount}</p>
                                <p className="text-[10px] text-muted-foreground">Wrong</p>
                            </div>
                        </div>
                    </div>

                    <Mascot mood="happy" size="sm" message="You're a Totopara champion! 🏘️✨" className="mt-4" />

                    <div className="mt-5 flex gap-3">
                        <button onClick={resetGame}
                            className="btn-game bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3">
                            Play Again 🔄
                        </button>
                        <button onClick={() => window.history.back()}
                            className="btn-game bg-white text-gray-700 border-2 border-gray-200 px-6 py-3">
                            Back
                        </button>
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    // Playing states: rolling, moving, question, answered, special
    const tileSize = Math.floor(Math.min(340, window.innerWidth - 40) / 5);
    const rows = Math.ceil(BOARD_SIZE / 5);

    return (
        <PlayGameShell title="Board Quest" icon="🎲" gradient="from-amber-500 to-orange-600">
            <div className="flex flex-col items-center px-4 py-3">
                {/* Score bar */}
                <div className="w-full max-w-sm flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm mb-3">
                    <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="text-amber-600">🪙 {coins}</span>
                        <span className="text-blue-600">💎 {diamonds}</span>
                    </div>
                    <span className="text-xs font-bold text-green-600">✅ {correctCount}</span>
                    <span className="text-xs text-gray-400">Tile {playerPos + 1}/{BOARD_SIZE}</span>
                    {doubleXPActive && (
                        <span className="text-xs font-bold text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-full">2× ⭐</span>
                    )}
                </div>

                {/* Board */}
                <div
                    className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-amber-300"
                    style={{
                        width: tileSize * 5,
                        height: tileSize * rows,
                        background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
                    }}
                >
                    {board.map((tile) => {
                        const isPlayer = tile.index === playerPos;
                        const isPast = tile.index < playerPos;
                        const isFinish = tile.index === BOARD_SIZE - 1;
                        const isStart = tile.index === 0;

                        return (
                            <div
                                key={tile.index}
                                className={`absolute flex flex-col items-center justify-center rounded-lg border transition-all duration-300
                  ${TILE_COLORS[tile.type]}
                  ${isPast ? 'opacity-50' : 'opacity-100'}
                  ${isPlayer ? 'ring-2 ring-amber-500 z-10 scale-105' : ''}
                `}
                                style={{
                                    left: tile.x * tileSize + 2,
                                    top: tile.y * tileSize + 2,
                                    width: tileSize - 4,
                                    height: tileSize - 4,
                                }}
                            >
                                {/* Tile number */}
                                <span className="text-[9px] font-bold text-gray-400 absolute top-0.5 left-1">{tile.index + 1}</span>

                                {/* Special emoji */}
                                {tile.type !== 'normal' && (
                                    <span className="text-lg">{TILE_EMOJIS[tile.type]}</span>
                                )}

                                {/* Start/Finish markers */}
                                {isStart && <span className="text-xs font-bold text-green-600">START</span>}
                                {isFinish && <span className="text-lg">🏆</span>}

                                {/* Player token */}
                                {isPlayer && (
                                    <div className="absolute -top-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20 animate-bounce">
                                        <span className="text-sm">🦉</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Feedback overlay */}
                {feedback && (
                    <div className="mt-3 bg-white rounded-2xl shadow-lg px-5 py-3 text-center animate-fade-in max-w-xs">
                        <p className="text-sm font-bold text-gray-800">{feedback}</p>
                    </div>
                )}

                {/* Question modal */}
                {(phase === 'question' || phase === 'answered') && question && (
                    <div className="mt-3 bg-white rounded-2xl shadow-xl p-4 w-full max-w-xs border border-amber-200 animate-fade-in">
                        <p className="text-xs font-semibold text-amber-600 mb-2">What is this? 🤔</p>
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={question.word.imageUrl}
                                alt=""
                                className="w-16 h-16 rounded-xl object-cover border-2 border-amber-200 shadow-sm"
                            />
                            <button
                                onClick={() => {
                                    if (question.word.audioTotoUrl) {
                                        try { new Audio(question.word.audioTotoUrl).play().catch(() => { }); } catch { }
                                    }
                                }}
                                className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                            >
                                🔊
                            </button>
                        </div>
                        <div className="grid gap-2">
                            {question.options.map((opt, i) => {
                                let btnClass = 'bg-gray-50 border-gray-200 text-gray-700';
                                if (selectedAnswer !== null) {
                                    if (i === question.correctIndex) {
                                        btnClass = 'bg-green-100 border-green-400 text-green-700';
                                    } else if (i === selectedAnswer && i !== question.correctIndex) {
                                        btnClass = 'bg-red-100 border-red-400 text-red-700';
                                    }
                                }
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(i)}
                                        disabled={selectedAnswer !== null}
                                        className={`w-full py-2.5 rounded-xl border-2 font-bold text-sm transition-all active:scale-95 ${btnClass}`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Dice + Roll button */}
                {(phase === 'rolling' || phase === 'moving') && (
                    <div className="mt-4 flex flex-col items-center gap-3">
                        <DiceFace value={diceValue} rolling={diceRolling} />
                        <button
                            onClick={rollDice}
                            disabled={phase === 'moving' || diceRolling}
                            className="btn-game bg-gradient-to-r from-amber-500 to-orange-600 text-white px-10 py-3 text-lg
                         disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {diceRolling ? '🎲 Rolling...' : phase === 'moving' ? '🦉 Moving...' : '🎲 Roll Dice!'}
                        </button>
                    </div>
                )}
            </div>
        </PlayGameShell>
    );
}
