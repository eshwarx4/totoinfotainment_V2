import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ALL_WORDS, WordItem } from '@/data/wordData';
import { shuffle, pickRandom } from '@/lib/gameUtils';
import { Confetti } from '@/components/effects/Confetti';
import Mascot from '@/components/mascot/Mascot';
import { useGameSFX } from '@/hooks/useGameSFX';
import {
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
} from 'lucide-react';

// ==========================================
// CONFIG
// ==========================================
const GRID_COLS = 10;
const GRID_ROWS = 14;
const INITIAL_SPEED = 280; // ms per tick
const SPEED_INCREMENT = 12; // ms faster per correct answer
const MIN_SPEED = 100;
const COIN_VALUE = 10;
const DIAMOND_VALUE = 25;
const CORRECT_WORD_XP = 30;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type CellContent = 'empty' | 'correct' | 'wrong' | 'coin' | 'diamond';

interface GridItem {
    x: number;
    y: number;
    type: CellContent;
    word?: WordItem;
}

interface SnakeState {
    body: { x: number; y: number }[];
    direction: Direction;
}

function getOpposite(d: Direction): Direction {
    switch (d) {
        case 'UP': return 'DOWN';
        case 'DOWN': return 'UP';
        case 'LEFT': return 'RIGHT';
        case 'RIGHT': return 'LEFT';
    }
}

function getRandomEmptyCell(
    snake: { x: number; y: number }[],
    items: GridItem[]
): { x: number; y: number } {
    const occupied = new Set([
        ...snake.map(s => `${s.x},${s.y}`),
        ...items.map(i => `${i.x},${i.y}`),
    ]);
    let x: number, y: number;
    let tries = 0;
    do {
        x = Math.floor(Math.random() * GRID_COLS);
        y = Math.floor(Math.random() * GRID_ROWS);
        tries++;
    } while (occupied.has(`${x},${y}`) && tries < 200);
    return { x, y };
}

function getWordsWithImages(): WordItem[] {
    return ALL_WORDS.filter(w => w.imageUrl);
}

// ==========================================
// MAIN GAME COMPONENT
// ==========================================
export default function WordSnake() {
    const sfx = useGameSFX();
    const [phase, setPhase] = useState<'menu' | 'playing' | 'gameover'>('menu');
    const [snake, setSnake] = useState<SnakeState>({
        body: [{ x: 5, y: 10 }, { x: 5, y: 11 }, { x: 5, y: 12 }],
        direction: 'UP',
    });
    const [items, setItems] = useState<GridItem[]>([]);
    const [targetWord, setTargetWord] = useState<WordItem | null>(null);
    const [score, setScore] = useState(0);
    const [coins, setCoins] = useState(0);
    const [diamonds, setDiamonds] = useState(0);
    const [wordsCollected, setWordsCollected] = useState(0);
    const [speed, setSpeed] = useState(INITIAL_SPEED);
    const [flashCell, setFlashCell] = useState<{ x: number; y: number; color: string } | null>(null);

    const dirRef = useRef<Direction>('UP');
    const snakeRef = useRef(snake);
    const itemsRef = useRef(items);
    const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const speedRef = useRef(INITIAL_SPEED);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Shared audio player — stops previous before playing new
    const playAudio = useCallback((url: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        try {
            const a = new Audio(url);
            audioRef.current = a;
            a.play().catch(() => { });
        } catch { }
    }, []);

    snakeRef.current = snake;
    itemsRef.current = items;

    const allWords = useMemo(() => getWordsWithImages(), []);

    // ============ SPAWN ITEMS ============
    const spawnItems = useCallback((snakeBody: { x: number; y: number }[], currentItems: GridItem[], target: WordItem) => {
        const newItems: GridItem[] = [...currentItems];

        // Ensure there's always 1 correct image & 2-3 wrong images
        const hasCorrect = newItems.some(i => i.type === 'correct');
        if (!hasCorrect) {
            const pos = getRandomEmptyCell(snakeBody, newItems);
            newItems.push({ ...pos, type: 'correct', word: target });
        }

        const wrongCount = newItems.filter(i => i.type === 'wrong').length;
        const wrongsNeeded = Math.max(0, 2 - wrongCount);
        for (let i = 0; i < wrongsNeeded; i++) {
            const wrongWord = pickRandom(allWords.filter(w => w.id !== target.id), 1)[0];
            const pos = getRandomEmptyCell(snakeBody, newItems);
            newItems.push({ ...pos, type: 'wrong', word: wrongWord });
        }

        // Random coin/diamond
        if (Math.random() < 0.3 && newItems.filter(i => i.type === 'coin').length < 2) {
            const pos = getRandomEmptyCell(snakeBody, newItems);
            newItems.push({ ...pos, type: 'coin' });
        }
        if (Math.random() < 0.1 && newItems.filter(i => i.type === 'diamond').length < 1) {
            const pos = getRandomEmptyCell(snakeBody, newItems);
            newItems.push({ ...pos, type: 'diamond' });
        }

        return newItems;
    }, [allWords]);

    // ============ NEW TARGET ============
    const pickNewTarget = useCallback(
        (currentSnake: { x: number; y: number }[], currentItems: GridItem[]) => {
            const word = pickRandom(allWords, 1)[0];
            setTargetWord(word);
            // Clear old correct/wrong, keep coins/diamonds
            const kept = currentItems.filter(i => i.type === 'coin' || i.type === 'diamond');
            const spawned = spawnItems(currentSnake, kept, word);
            setItems(spawned);
            itemsRef.current = spawned;
            // Auto-play Toto audio
            if (word.audioTotoUrl) {
                setTimeout(() => playAudio(word.audioTotoUrl), 200);
            }
            return word;
        },
        [allWords, spawnItems]
    );

    // ============ START GAME ============
    const startGame = useCallback(() => {
        const initialSnake: SnakeState = {
            body: [{ x: 5, y: 10 }, { x: 5, y: 11 }, { x: 5, y: 12 }],
            direction: 'UP',
        };
        dirRef.current = 'UP';
        speedRef.current = INITIAL_SPEED;
        setSnake(initialSnake);
        snakeRef.current = initialSnake;
        setScore(0);
        setCoins(0);
        setDiamonds(0);
        setWordsCollected(0);
        setSpeed(INITIAL_SPEED);
        setItems([]);
        itemsRef.current = [];
        setPhase('playing');

        const word = pickNewTarget(initialSnake.body, []);

        sfx.playClick();
    }, [pickNewTarget, sfx]);

    // ============ GAME LOOP ============
    const tick = useCallback(() => {
        const s = snakeRef.current;
        const head = s.body[0];
        const dir = dirRef.current;

        let nx = head.x;
        let ny = head.y;
        if (dir === 'UP') ny -= 1;
        if (dir === 'DOWN') ny += 1;
        if (dir === 'LEFT') nx -= 1;
        if (dir === 'RIGHT') nx += 1;

        // Wall collision — wrap around
        if (nx < 0) nx = GRID_COLS - 1;
        if (nx >= GRID_COLS) nx = 0;
        if (ny < 0) ny = GRID_ROWS - 1;
        if (ny >= GRID_ROWS) ny = 0;

        // Self collision
        if (s.body.some(seg => seg.x === nx && seg.y === ny)) {
            // Game over
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            sfx.playGameOver();
            setPhase('gameover');
            return;
        }

        // Check item collision
        const hitItem = itemsRef.current.find(i => i.x === nx && i.y === ny);
        let newBody = [{ x: nx, y: ny }, ...s.body];
        let grow = false;

        if (hitItem) {
            const remaining = itemsRef.current.filter(i => i !== hitItem);

            if (hitItem.type === 'correct') {
                sfx.playCorrect();
                grow = true;
                setScore(sc => sc + CORRECT_WORD_XP);
                setCoins(c => c + COIN_VALUE);
                setWordsCollected(w => w + 1);
                setFlashCell({ x: nx, y: ny, color: 'bg-green-400' });
                // Play English audio
                if (hitItem.word?.audioEnglishUrl) {
                    playAudio(hitItem.word.audioEnglishUrl);
                }
                // Speed up
                speedRef.current = Math.max(MIN_SPEED, speedRef.current - SPEED_INCREMENT);
                setSpeed(speedRef.current);
                // Restart game loop with new speed
                if (gameLoopRef.current) clearInterval(gameLoopRef.current);
                // Pick new target
                setTimeout(() => {
                    pickNewTarget(newBody, remaining);
                }, 100);
                // Restart loop
                gameLoopRef.current = setInterval(tick, speedRef.current);
            } else if (hitItem.type === 'wrong') {
                sfx.playWrong();
                setFlashCell({ x: nx, y: ny, color: 'bg-red-400' });
                // Shrink snake
                if (newBody.length > 2) {
                    newBody = newBody.slice(0, -2); // remove 2 segments
                } else {
                    // Too small — game over
                    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
                    sfx.playGameOver();
                    setPhase('gameover');
                    return;
                }
            } else if (hitItem.type === 'coin') {
                sfx.playCollect();
                grow = true;
                setCoins(c => c + COIN_VALUE);
                setScore(sc => sc + COIN_VALUE);
                setFlashCell({ x: nx, y: ny, color: 'bg-amber-400' });
            } else if (hitItem.type === 'diamond') {
                sfx.playCollect();
                grow = true;
                setDiamonds(d => d + 1);
                setScore(sc => sc + DIAMOND_VALUE);
                setFlashCell({ x: nx, y: ny, color: 'bg-blue-400' });
            }

            setItems(remaining);
            itemsRef.current = remaining;

            // Respawn items periodically
            if (remaining.length < 3) {
                const target = targetWord || allWords[0];
                const spawned = spawnItems(newBody, remaining, target);
                setItems(spawned);
                itemsRef.current = spawned;
            }
        }

        if (!grow) {
            newBody = newBody.slice(0, -1);
        }

        // Clear flash
        setTimeout(() => setFlashCell(null), 200);

        const newState: SnakeState = { body: newBody, direction: dir };
        setSnake(newState);
        snakeRef.current = newState;
    }, [sfx, pickNewTarget, spawnItems, allWords, targetWord]);

    // Start/stop game loop
    useEffect(() => {
        if (phase === 'playing') {
            gameLoopRef.current = setInterval(tick, speedRef.current);
            return () => {
                if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            };
        }
    }, [phase, tick]);

    // ============ CONTROLS ============
    const changeDir = useCallback((d: Direction) => {
        if (getOpposite(d) !== dirRef.current) {
            dirRef.current = d;
        }
    }, []);

    // Keyboard
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (phase !== 'playing') return;
            if (e.key === 'ArrowUp' || e.key === 'w') changeDir('UP');
            if (e.key === 'ArrowDown' || e.key === 's') changeDir('DOWN');
            if (e.key === 'ArrowLeft' || e.key === 'a') changeDir('LEFT');
            if (e.key === 'ArrowRight' || e.key === 'd') changeDir('RIGHT');
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [phase, changeDir]);

    // ==========================================
    // RENDERS
    // ==========================================

    // Menu
    if (phase === 'menu') {
        return (
            <PlayGameShell title="Word Snake" icon="🐍" gradient="from-green-500 to-emerald-600">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center">
                    <Mascot mood="excited" size="md" message="Eat the right words! 🐍✨" />
                    <h2 className="text-xl font-extrabold text-gray-800 mt-4 mb-2">Word Snake</h2>
                    <p className="text-sm text-muted-foreground mb-2 max-w-xs">
                        Control the snake to eat the correct word image. Avoid wrong words — they shrink you!
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-xs text-green-700 max-w-xs">
                        <p className="font-semibold">How to play:</p>
                        <p className="mt-1">• Listen to the Toto word at the top 🔊</p>
                        <p>• Steer the snake to eat the matching image ✅</p>
                        <p>• Collect coins 🪙 and diamonds 💎</p>
                        <p>• Wrong images shrink your snake ❌</p>
                        <p>• Game over if snake hits itself or gets too small!</p>
                    </div>
                    <button
                        onClick={startGame}
                        className="btn-game bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-3 text-lg"
                    >
                        Start! 🐍
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    // Game Over
    if (phase === 'gameover') {
        return (
            <PlayGameShell title="Word Snake" icon="🐍" gradient="from-green-500 to-emerald-600">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
                    <Confetti />
                    <span className="text-6xl mb-3">🏆</span>
                    <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Game Over!</h2>
                    <p className="text-muted-foreground mb-4">
                        You collected {wordsCollected} words!
                    </p>

                    <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                                <p className="text-2xl font-extrabold text-amber-500">{score}</p>
                                <p className="text-[10px] text-muted-foreground">Score</p>
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-yellow-500">🪙 {coins}</p>
                                <p className="text-[10px] text-muted-foreground">Coins</p>
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-blue-500">💎 {diamonds}</p>
                                <p className="text-[10px] text-muted-foreground">Diamonds</p>
                            </div>
                        </div>
                    </div>

                    <Mascot
                        mood={wordsCollected >= 5 ? 'happy' : 'thinking'}
                        size="sm"
                        message={wordsCollected >= 5 ? 'Amazing snake master! 🐍✨' : 'Keep practicing! You\'ll get better! 💪'}
                        className="mt-4"
                    />

                    <div className="mt-5 flex gap-3">
                        <button onClick={startGame}
                            className="btn-game bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3">
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

    // Playing
    const cellSize = Math.floor(Math.min(360, window.innerWidth - 32) / GRID_COLS);

    return (
        <PlayGameShell title="Word Snake" icon="🐍" gradient="from-green-500 to-emerald-600">
            <div className="flex flex-col items-center">
                {/* Scoreboard */}
                <div className="w-full px-4 pt-2 pb-1">
                    <div className="max-w-sm mx-auto flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm">
                        <div className="flex items-center gap-3 text-xs font-bold">
                            <span className="text-amber-600">🪙 {coins}</span>
                            <span className="text-blue-600">💎 {diamonds}</span>
                        </div>
                        <span className="text-sm font-extrabold text-gray-700">{score} pts</span>
                        <span className="text-xs text-gray-400">🐍 {snake.body.length}</span>
                    </div>
                </div>

                {/* Target word */}
                {targetWord && (
                    <div className="my-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                        <span className="text-lg">🔍</span>
                        <span className="text-sm font-extrabold text-green-800">Find:</span>
                        <img
                            src={targetWord.imageUrl}
                            alt={targetWord.english}
                            className="w-8 h-8 rounded-lg object-cover border border-green-300"
                        />
                        <span className="text-sm font-bold text-green-700">{targetWord.english}</span>
                        <button
                            onClick={() => {
                                if (targetWord.audioTotoUrl) {
                                    playAudio(targetWord.audioTotoUrl);
                                }
                            }}
                            className="w-7 h-7 bg-green-200 rounded-full flex items-center justify-center active:scale-90 transition-transform text-sm"
                        >
                            🔊
                        </button>
                    </div>
                )}

                {/* Grid */}
                <div
                    className="relative rounded-xl overflow-hidden border-2 border-green-300 shadow-lg"
                    style={{
                        width: cellSize * GRID_COLS,
                        height: cellSize * GRID_ROWS,
                        background: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)',
                    }}
                >
                    {/* Grid lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15">
                        {Array.from({ length: GRID_COLS + 1 }).map((_, i) => (
                            <line key={`v${i}`} x1={i * cellSize} y1={0} x2={i * cellSize} y2={GRID_ROWS * cellSize}
                                stroke="#065f46" strokeWidth="0.5" />
                        ))}
                        {Array.from({ length: GRID_ROWS + 1 }).map((_, i) => (
                            <line key={`h${i}`} x1={0} y1={i * cellSize} x2={GRID_COLS * cellSize} y2={i * cellSize}
                                stroke="#065f46" strokeWidth="0.5" />
                        ))}
                    </svg>

                    {/* Items on grid */}
                    {items.map((item, i) => (
                        <div
                            key={`${item.x}-${item.y}-${i}`}
                            className="absolute flex items-center justify-center transition-all duration-200"
                            style={{
                                left: item.x * cellSize,
                                top: item.y * cellSize,
                                width: cellSize,
                                height: cellSize,
                            }}
                        >
                            {item.type === 'correct' && item.word && (
                                <img src={item.word.imageUrl} alt="" className="w-[85%] h-[85%] rounded-md object-cover border-2 border-green-400 shadow-sm" />
                            )}
                            {item.type === 'wrong' && item.word && (
                                <img src={item.word.imageUrl} alt="" className="w-[85%] h-[85%] rounded-md object-cover border-2 border-red-300 opacity-90 shadow-sm" />
                            )}
                            {item.type === 'coin' && <span className="text-lg animate-pulse">🪙</span>}
                            {item.type === 'diamond' && <span className="text-lg animate-pulse">💎</span>}
                        </div>
                    ))}

                    {/* Snake */}
                    {snake.body.map((seg, i) => (
                        <div
                            key={i}
                            className={`absolute rounded-sm transition-all duration-75 ${i === 0
                                ? 'bg-green-600 z-10 rounded-md shadow-md'
                                : 'bg-green-500'
                                }`}
                            style={{
                                left: seg.x * cellSize + 1,
                                top: seg.y * cellSize + 1,
                                width: cellSize - 2,
                                height: cellSize - 2,
                                opacity: 1 - i * 0.02,
                            }}
                        >
                            {i === 0 && (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-[10px]">
                                        {dirRef.current === 'UP' ? '👆' : dirRef.current === 'DOWN' ? '👇' : dirRef.current === 'LEFT' ? '👈' : '👉'}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Flash effect */}
                    {flashCell && (
                        <div
                            className={`absolute ${flashCell.color} opacity-50 pointer-events-none animate-ping rounded`}
                            style={{
                                left: flashCell.x * cellSize,
                                top: flashCell.y * cellSize,
                                width: cellSize,
                                height: cellSize,
                            }}
                        />
                    )}
                </div>

                {/* D-Pad Controls */}
                <div className="mt-4 mb-6 relative" style={{ width: 160, height: 160 }}>
                    {/* Up */}
                    <button
                        onTouchStart={(e) => { e.preventDefault(); changeDir('UP'); }}
                        onClick={() => changeDir('UP')}
                        className="absolute left-1/2 -translate-x-1/2 top-0 w-14 h-14 rounded-xl bg-gradient-to-b from-green-400 to-green-500 
                       text-white shadow-lg active:scale-90 transition-all flex items-center justify-center border-2 border-green-300"
                    >
                        <ArrowUp className="w-7 h-7" />
                    </button>
                    {/* Down */}
                    <button
                        onTouchStart={(e) => { e.preventDefault(); changeDir('DOWN'); }}
                        onClick={() => changeDir('DOWN')}
                        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-14 h-14 rounded-xl bg-gradient-to-b from-green-400 to-green-500 
                       text-white shadow-lg active:scale-90 transition-all flex items-center justify-center border-2 border-green-300"
                    >
                        <ArrowDown className="w-7 h-7" />
                    </button>
                    {/* Left */}
                    <button
                        onTouchStart={(e) => { e.preventDefault(); changeDir('LEFT'); }}
                        onClick={() => changeDir('LEFT')}
                        className="absolute top-1/2 -translate-y-1/2 left-0 w-14 h-14 rounded-xl bg-gradient-to-r from-green-400 to-green-500 
                       text-white shadow-lg active:scale-90 transition-all flex items-center justify-center border-2 border-green-300"
                    >
                        <ArrowLeft className="w-7 h-7" />
                    </button>
                    {/* Right */}
                    <button
                        onTouchStart={(e) => { e.preventDefault(); changeDir('RIGHT'); }}
                        onClick={() => changeDir('RIGHT')}
                        className="absolute top-1/2 -translate-y-1/2 right-0 w-14 h-14 rounded-xl bg-gradient-to-r from-green-400 to-green-500 
                       text-white shadow-lg active:scale-90 transition-all flex items-center justify-center border-2 border-green-300"
                    >
                        <ArrowRight className="w-7 h-7" />
                    </button>
                    {/* Center */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center">
                            <span className="text-xl">🐍</span>
                        </div>
                    </div>
                </div>
            </div>
        </PlayGameShell>
    );
}
