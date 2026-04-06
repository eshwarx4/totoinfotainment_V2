import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ALL_WORDS, WordItem } from '@/data/wordData';
import { shuffle, generateOptions } from '@/lib/gameUtils';
import { Confetti } from '@/components/effects/Confetti';
import Mascot from '@/components/mascot/Mascot';

// ==========================================
// GAME CONSTANTS — Slower, child-friendly pace
// ==========================================
const GRAVITY = 0.45;
const JUMP_FORCE = -9;
const GROUND_Y = 0.78; // ground at 78% height
const PLAYER_SIZE = 36;
const GAME_SPEED_INITIAL = 2.2; // MUCH slower
const OBSTACLE_INTERVAL_MIN = 140; // more spacing
const OBSTACLE_INTERVAL_MAX = 260;
const CHECKPOINT_DISTANCE = 800; // more running before quiz
const MAX_CHECKPOINTS = 5;

// Toto-themed obstacle types
type ObstacleType = 'rock' | 'log' | 'bush';
interface Obstacle {
    x: number;
    width: number;
    height: number;
    passed: boolean;
    type: ObstacleType;
}

interface GameData {
    player: { y: number; vy: number; isJumping: boolean; frame: number };
    obstacles: Obstacle[];
    distance: number;
    speed: number;
    nextObstacle: number;
    groundOffset: number;
    bgOffset: number;
}

function getCheckpointWords(): { question: WordItem; options: WordItem[] }[] {
    const words = shuffle(ALL_WORDS.filter(w => w.imageUrl)).slice(0, MAX_CHECKPOINTS);
    return words.map(w => ({ question: w, options: generateOptions(w, ALL_WORDS, 3) }));
}

// ==========================================
// TOTOPARA-THEMED CANVAS RENDERER
// ==========================================
function drawGame(ctx: CanvasRenderingContext2D, s: GameData, w: number, h: number) {
    const gy = h * GROUND_Y;
    ctx.clearRect(0, 0, w, h);

    // === Sky — warm golden-hour feel of Totopara hills ===
    const sky = ctx.createLinearGradient(0, 0, 0, gy);
    sky.addColorStop(0, '#89CFF0');   // soft blue
    sky.addColorStop(0.5, '#B7E4F9');
    sky.addColorStop(0.85, '#FFF8E7'); // warm horizon glow
    sky.addColorStop(1, '#E8F5E9');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, gy);

    // === Distant Totopara hills ===
    ctx.fillStyle = '#7CB342';
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    for (let x = 0; x <= w; x += 40) {
        const hh = 70 + Math.sin(x * 0.008 + s.bgOffset * 0.0002) * 35 + Math.cos(x * 0.015) * 20;
        ctx.lineTo(x, gy - hh);
    }
    ctx.lineTo(w, gy);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // === Mid-ground tree line ===
    ctx.fillStyle = '#558B2F';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    for (let x = 0; x <= w; x += 30) {
        const th = 45 + Math.sin(x * 0.02 + s.bgOffset * 0.0005) * 20;
        ctx.lineTo(x, gy - th);
    }
    ctx.lineTo(w, gy);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // === Bamboo huts in background (parallax) ===
    const hutPositions = [0.15, 0.55, 0.85];
    for (const hp of hutPositions) {
        const hx = ((hp * w + s.bgOffset * 0.15) % (w + 80)) - 40;
        const hy = gy - 55;
        // Hut body (bamboo color)
        ctx.fillStyle = '#D7B377';
        ctx.fillRect(hx, hy + 15, 30, 22);
        // Hut roof (thatch)
        ctx.fillStyle = '#8D6E36';
        ctx.beginPath();
        ctx.moveTo(hx - 5, hy + 16);
        ctx.lineTo(hx + 15, hy - 2);
        ctx.lineTo(hx + 35, hy + 16);
        ctx.closePath();
        ctx.fill();
        // Door
        ctx.fillStyle = '#6D4C21';
        ctx.fillRect(hx + 11, hy + 24, 8, 13);
    }

    // === Ground — rich Totopara forest floor ===
    const grd = ctx.createLinearGradient(0, gy, 0, h);
    grd.addColorStop(0, '#6B8E23');  // olive green
    grd.addColorStop(0.15, '#556B2F');
    grd.addColorStop(0.5, '#4A5D23');
    grd.addColorStop(1, '#3E4F1F');
    ctx.fillStyle = grd;
    ctx.fillRect(0, gy, w, h - gy);

    // Ground path (dirt trail)
    ctx.fillStyle = '#8B7355';
    ctx.globalAlpha = 0.4;
    ctx.fillRect(0, gy, w, 6);
    ctx.globalAlpha = 1;

    // Grass tufts
    ctx.strokeStyle = '#7CB342';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
        const gx = ((i * 35 + s.groundOffset * 1.5) % (w + 40)) - 20;
        ctx.beginPath();
        ctx.moveTo(gx, gy + 1);
        ctx.lineTo(gx - 3, gy - 6);
        ctx.moveTo(gx, gy + 1);
        ctx.lineTo(gx + 2, gy - 7);
        ctx.moveTo(gx, gy + 1);
        ctx.lineTo(gx + 5, gy - 5);
        ctx.stroke();
    }

    // === Obstacles — natural objects ===
    for (const obs of s.obstacles) {
        drawObstacle(ctx, obs, gy);
    }

    // === Player — Toto village child character ===
    drawPlayer(ctx, s, gy);

    // Distance
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.font = 'bold 13px Nunito, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.floor(s.distance)}m`, w - 10, 20);
}

function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, gy: number) {
    const ox = obs.x, ow = obs.width, oh = obs.height;

    if (obs.type === 'rock') {
        // Natural gray rock
        ctx.fillStyle = '#8B8682';
        ctx.beginPath();
        ctx.moveTo(ox + 4, gy);
        ctx.lineTo(ox, gy - oh * 0.6);
        ctx.quadraticCurveTo(ox + ow * 0.3, gy - oh - 2, ox + ow * 0.5, gy - oh);
        ctx.quadraticCurveTo(ox + ow * 0.8, gy - oh + 3, ox + ow, gy - oh * 0.5);
        ctx.lineTo(ox + ow - 2, gy);
        ctx.closePath();
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.arc(ox + ow * 0.35, gy - oh * 0.7, 4, 0, Math.PI * 2);
        ctx.fill();
    } else if (obs.type === 'log') {
        // Fallen log
        ctx.fillStyle = '#6D4C21';
        const r = oh * 0.35;
        ctx.beginPath();
        ctx.ellipse(ox + ow / 2, gy - r, ow / 2, r, 0, 0, Math.PI * 2);
        ctx.fill();
        // Wood rings
        ctx.strokeStyle = '#8B6914';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(ox + ow / 2, gy - r, ow * 0.25, r * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Bark texture
        ctx.fillStyle = '#5C3A14';
        ctx.fillRect(ox + 4, gy - r - 1, ow - 8, 2);
    } else {
        // Bush
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.arc(ox + ow / 2, gy - oh * 0.6, oh * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#388E3C';
        ctx.beginPath();
        ctx.arc(ox + ow * 0.3, gy - oh * 0.4, oh * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ox + ow * 0.7, gy - oh * 0.45, oh * 0.38, 0, Math.PI * 2);
        ctx.fill();
        // Berries
        ctx.fillStyle = '#E53935';
        ctx.beginPath();
        ctx.arc(ox + ow * 0.4, gy - oh * 0.55, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ox + ow * 0.65, gy - oh * 0.6, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.ellipse(ox + ow / 2, gy + 2, ow / 2 + 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlayer(ctx: CanvasRenderingContext2D, s: GameData, gy: number) {
    const px = 55, py = s.player.y, sz = PLAYER_SIZE;
    const jumping = s.player.isJumping;
    const frame = s.player.frame;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(px + sz / 2, gy + 2, sz / 2 + 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (warm skin tone)
    ctx.fillStyle = '#C68642';
    // Torso
    ctx.fillRect(px + sz * 0.3, py + sz * 0.35, sz * 0.4, sz * 0.35);

    // Traditional simple tunic (white with warm border)
    ctx.fillStyle = '#FFF8E1';
    ctx.fillRect(px + sz * 0.25, py + sz * 0.35, sz * 0.5, sz * 0.3);
    ctx.strokeStyle = '#FF8F00';
    ctx.lineWidth = 1;
    ctx.strokeRect(px + sz * 0.25, py + sz * 0.35, sz * 0.5, sz * 0.3);

    // Head
    ctx.fillStyle = '#C68642';
    ctx.beginPath();
    ctx.arc(px + sz / 2, py + sz * 0.22, sz * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(px + sz / 2, py + sz * 0.18, sz * 0.18, Math.PI, 2 * Math.PI);
    ctx.fill();

    // Eyes (looking forward)
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(px + sz * 0.43, py + sz * 0.2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + sz * 0.57, py + sz * 0.2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#8D4925';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px + sz / 2, py + sz * 0.24, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Legs
    ctx.fillStyle = '#C68642';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    if (!jumping) {
        const legPhase = Math.sin(frame * 0.2);
        // Left leg
        ctx.strokeStyle = '#C68642';
        ctx.beginPath();
        ctx.moveTo(px + sz * 0.38, py + sz * 0.68);
        ctx.lineTo(px + sz * 0.38 + legPhase * 5, py + sz * 0.92);
        ctx.stroke();
        // Right leg
        ctx.beginPath();
        ctx.moveTo(px + sz * 0.62, py + sz * 0.68);
        ctx.lineTo(px + sz * 0.62 - legPhase * 5, py + sz * 0.92);
        ctx.stroke();
    } else {
        // Tucked jump pose
        ctx.strokeStyle = '#C68642';
        ctx.beginPath();
        ctx.moveTo(px + sz * 0.38, py + sz * 0.68);
        ctx.lineTo(px + sz * 0.35, py + sz * 0.78);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px + sz * 0.62, py + sz * 0.68);
        ctx.lineTo(px + sz * 0.65, py + sz * 0.78);
        ctx.stroke();
    }

    // Arms
    ctx.strokeStyle = '#C68642';
    ctx.lineWidth = 2.5;
    const armSwing = jumping ? 0 : Math.sin(frame * 0.2) * 4;
    ctx.beginPath();
    ctx.moveTo(px + sz * 0.25, py + sz * 0.42);
    ctx.lineTo(px + sz * 0.15 - armSwing, py + sz * 0.58);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + sz * 0.75, py + sz * 0.42);
    ctx.lineTo(px + sz * 0.85 + armSwing, py + sz * 0.58);
    ctx.stroke();
}

// ==========================================
// CHECKPOINT QUIZ
// ==========================================
function CheckpointQuiz({
    question, options, checkpointNum, totalCheckpoints, onAnswer,
}: {
    question: WordItem; options: WordItem[]; checkpointNum: number; totalCheckpoints: number;
    onAnswer: (correct: boolean) => void;
}) {
    const [selected, setSelected] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    const handleSelect = (wordId: string) => {
        if (feedback === 'correct') return;
        setSelected(wordId);
        const isCorrect = wordId === question.id;
        setFeedback(isCorrect ? 'correct' : 'wrong');
        if (isCorrect) {
            if (question.audioTotoUrl) {
                try { new Audio(question.audioTotoUrl).play().catch(() => { }); } catch { }
            }
            setTimeout(() => onAnswer(true), 1200);
        } else {
            setTimeout(() => { setSelected(null); setFeedback(null); }, 900);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
            <div className="bg-amber-100 text-amber-700 rounded-full px-4 py-1 text-xs font-bold mb-3">
                🏁 Totopara Checkpoint {checkpointNum}/{totalCheckpoints}
            </div>
            <Mascot mood="thinking" size="sm" message="What is this word in Toto? 🤔" />
            <div className="mt-3 bg-white rounded-2xl shadow-lg p-4 w-full max-w-xs">
                <img src={question.imageUrl} alt="quiz" className="w-24 h-24 object-cover rounded-xl mx-auto mb-3 shadow-sm" />
                <p className="text-sm font-bold text-gray-600 mb-3">What is this?</p>
                <div className="grid gap-2">
                    {options.map(opt => {
                        const isSelected = selected === opt.id;
                        const isCorrectOpt = opt.id === question.id;
                        const showCorrect = feedback && isCorrectOpt;
                        const showWrong = isSelected && !isCorrectOpt;
                        return (
                            <button key={opt.id} onClick={() => handleSelect(opt.id)} disabled={feedback === 'correct'}
                                className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${showCorrect ? 'bg-green-100 text-green-700 ring-2 ring-green-400 scale-[1.02]'
                                        : showWrong ? 'bg-red-100 text-red-700 ring-2 ring-red-400 animate-shake'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95'
                                    }`}
                            >
                                {opt.english} {showCorrect && '✅'} {showWrong && '❌'}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function RunnerGame() {
    const [phase, setPhase] = useState<'menu' | 'playing' | 'checkpoint' | 'gameover' | 'results'>('menu');
    const [score, setScore] = useState(0);
    const [distance, setDistance] = useState(0);
    const [checkpointsCleared, setCheckpointsCleared] = useState(0);
    const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
    const [checkpointData, setCheckpointData] = useState<ReturnType<typeof getCheckpointWords>>([]);
    const [showConfetti, setShowConfetti] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<GameData | null>(null);
    const animRef = useRef<number>(0);
    const nextCheckpointAt = useRef(CHECKPOINT_DISTANCE);
    const isRunning = useRef(false);
    const dims = useRef({ w: 400, h: 500 });

    const jump = useCallback(() => {
        if (!gameRef.current || phase !== 'playing') return;
        const p = gameRef.current.player;
        if (!p.isJumping) { p.vy = JUMP_FORCE; p.isJumping = true; }
    }, [phase]);

    const OBSTACLE_TYPES: ObstacleType[] = ['rock', 'log', 'bush'];

    const gameLoop = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const s = gameRef.current;
        if (!canvas || !ctx || !s || !isRunning.current) return;

        const { w, h } = dims.current;
        const gy = h * GROUND_Y;

        // Physics
        s.player.vy += GRAVITY;
        s.player.y += s.player.vy;
        s.player.frame++;

        if (s.player.y >= gy - PLAYER_SIZE) {
            s.player.y = gy - PLAYER_SIZE;
            s.player.vy = 0;
            s.player.isJumping = false;
        }

        // Move obstacles
        for (const obs of s.obstacles) {
            obs.x -= s.speed;
            if (!obs.passed && obs.x + obs.width < 55) { obs.passed = true; setScore(sc => sc + 10); }
        }
        s.obstacles = s.obstacles.filter(o => o.x > -50);

        // Spawn obstacles — natural variety
        s.nextObstacle -= s.speed;
        if (s.nextObstacle <= 0) {
            const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
            const baseH = type === 'rock' ? 25 : type === 'log' ? 18 : 30;
            const varH = type === 'rock' ? 20 : type === 'log' ? 8 : 15;
            s.obstacles.push({
                x: w + 20,
                width: type === 'log' ? 35 + Math.random() * 10 : 24 + Math.random() * 10,
                height: baseH + Math.random() * varH,
                passed: false,
                type,
            });
            s.nextObstacle = OBSTACLE_INTERVAL_MIN + Math.random() * (OBSTACLE_INTERVAL_MAX - OBSTACLE_INTERVAL_MIN);
        }

        // Collision
        const px = 55, py = s.player.y;
        for (const obs of s.obstacles) {
            if (px + PLAYER_SIZE - 10 > obs.x + 3 && px + 10 < obs.x + obs.width - 3
                && py + PLAYER_SIZE > gy - obs.height + 5) {
                isRunning.current = false;
                setPhase('gameover');
                return;
            }
        }

        // Progress
        s.distance += s.speed * 0.08;
        s.speed = GAME_SPEED_INITIAL + s.distance * 0.0015; // Very gentle speedup
        s.groundOffset += s.speed;
        s.bgOffset += s.speed;
        setDistance(s.distance);

        // Checkpoint
        if (s.distance >= nextCheckpointAt.current && currentCheckpoint < MAX_CHECKPOINTS) {
            isRunning.current = false;
            setPhase('checkpoint');
            return;
        }

        drawGame(ctx, s, w, h);
        animRef.current = requestAnimationFrame(gameLoop);
    }, [currentCheckpoint, OBSTACLE_TYPES]);

    const startGame = useCallback(() => {
        setPhase('playing');
        setCheckpointData(getCheckpointWords());
        setCurrentCheckpoint(0);
        setCheckpointsCleared(0);
        setScore(0);
        setDistance(0);
        setShowConfetti(false);
        nextCheckpointAt.current = CHECKPOINT_DISTANCE;
    }, []);

    const handleCheckpointAnswer = useCallback((correct: boolean) => {
        if (correct) {
            setCheckpointsCleared(c => c + 1);
            setScore(sc => sc + 50);
            setCurrentCheckpoint(c => c + 1);
            nextCheckpointAt.current += CHECKPOINT_DISTANCE;
            if (currentCheckpoint + 1 >= MAX_CHECKPOINTS) { setShowConfetti(true); setPhase('results'); }
            else { setPhase('playing'); }
        }
    }, [currentCheckpoint]);

    useEffect(() => { return () => { isRunning.current = false; cancelAnimationFrame(animRef.current); }; }, []);

    // Init canvas when playing
    useEffect(() => {
        if (phase !== 'playing') return;
        const timer = setTimeout(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const parent = canvas.parentElement;
            if (!parent) return;
            const w = parent.clientWidth || 400;
            const h = parent.clientHeight || 500;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            dims.current = { w, h };

            const gy = h * GROUND_Y;
            gameRef.current = {
                player: { y: gy - PLAYER_SIZE, vy: 0, isJumping: false, frame: 0 },
                obstacles: [], distance: 0, speed: GAME_SPEED_INITIAL,
                nextObstacle: 160, groundOffset: 0, bgOffset: 0,
            };
            if (ctx) drawGame(ctx, gameRef.current, w, h);
            isRunning.current = true;
            animRef.current = requestAnimationFrame(gameLoop);
        }, 200);
        return () => { clearTimeout(timer); isRunning.current = false; cancelAnimationFrame(animRef.current); };
    }, [phase, gameLoop]);

    // Keyboard
    useEffect(() => {
        if (phase !== 'playing') return;
        const kh = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); jump(); } };
        document.addEventListener('keydown', kh);
        return () => document.removeEventListener('keydown', kh);
    }, [phase, jump]);

    // ==========================================
    // SCREENS
    // ==========================================
    if (phase === 'menu') {
        return (
            <PlayGameShell title="Totopara Runner" icon="🏃" gradient="from-emerald-400 to-green-600">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center">
                    <Mascot mood="excited" size="md" message="Run through Totopara! 🏃🌿" />
                    <h2 className="text-xl font-extrabold text-gray-800 mt-4 mb-2">Totopara Runner</h2>
                    <p className="text-sm text-muted-foreground mb-2 max-w-xs">
                        Run through the village, jump over obstacles, and learn Toto words!
                    </p>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-6 text-xs text-emerald-700 max-w-xs">
                        <p className="font-semibold">How to play:</p>
                        <p className="mt-1">• Tap screen or press Space to jump</p>
                        <p>• Jump over rocks, logs & bushes</p>
                        <p>• Answer {MAX_CHECKPOINTS} Toto word quizzes!</p>
                    </div>
                    <button onClick={startGame} className="btn-game bg-gradient-to-r from-emerald-500 to-green-600 text-white px-12 py-3 text-lg">
                        Start Running! 🌿
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'checkpoint' && checkpointData[currentCheckpoint]) {
        const cp = checkpointData[currentCheckpoint];
        return (
            <PlayGameShell title="Totopara Runner" icon="🏃" gradient="from-emerald-400 to-green-600">
                <CheckpointQuiz question={cp.question} options={cp.options}
                    checkpointNum={currentCheckpoint + 1} totalCheckpoints={MAX_CHECKPOINTS}
                    onAnswer={handleCheckpointAnswer}
                />
            </PlayGameShell>
        );
    }

    if (phase === 'gameover') {
        return (
            <PlayGameShell title="Totopara Runner" icon="🏃" gradient="from-emerald-400 to-green-600">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
                    <Mascot mood="sad" size="md" message="Oops! Try again! 💫" />
                    <h2 className="text-2xl font-extrabold text-gray-800 mt-4 mb-2">Tripped!</h2>
                    <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs mt-2">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <p className="text-2xl font-extrabold text-amber-500">{score}</p>
                                <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-extrabold text-blue-500">{Math.floor(distance)}m</p>
                                <p className="text-xs text-muted-foreground">Distance</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-extrabold text-green-500">{checkpointsCleared}/{MAX_CHECKPOINTS}</p>
                                <p className="text-xs text-muted-foreground">Words</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                        <button onClick={startGame} className="btn-game bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3">
                            Try Again 🔄
                        </button>
                        <button onClick={() => setPhase('menu')} className="btn-game bg-white text-gray-700 border-2 border-gray-200 px-6 py-3">
                            Menu
                        </button>
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'results') {
        return (
            <PlayGameShell title="Totopara Runner" icon="🏃" gradient="from-emerald-400 to-green-600">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
                    {showConfetti && <Confetti />}
                    <span className="text-6xl mb-3">🏆</span>
                    <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Totopara Champion!</h2>
                    <p className="text-muted-foreground mb-4">You explored {MAX_CHECKPOINTS} checkpoints!</p>
                    <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-3xl font-extrabold text-amber-500">{score}</p>
                                <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-extrabold text-blue-500">{Math.floor(distance)}m</p>
                                <p className="text-xs text-muted-foreground">Distance</p>
                            </div>
                        </div>
                    </div>
                    <Mascot mood="happy" size="sm" message="You're a Totopara explorer! ⭐🌿" className="mt-4" />
                    <div className="mt-5 flex gap-3">
                        <button onClick={startGame} className="btn-game bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3">
                            Play Again 🔄
                        </button>
                        <button onClick={() => window.history.back()} className="btn-game bg-white text-gray-700 border-2 border-gray-200 px-6 py-3">
                            Back
                        </button>
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    // Playing
    return (
        <PlayGameShell title="Totopara Runner" icon="🏃" gradient="from-emerald-400 to-green-600">
            <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
                <div className="flex items-center justify-between px-4 py-2 bg-white/60 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">🪙 {score}</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">🌿 {Math.floor(distance)}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: MAX_CHECKPOINTS }).map((_, i) => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < checkpointsCleared ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        ))}
                    </div>
                </div>
                <div className="flex-1 relative overflow-hidden bg-sky-100" onClick={jump} onTouchStart={(e) => { e.preventDefault(); jump(); }}>
                    <canvas ref={canvasRef} className="block cursor-pointer absolute inset-0" style={{ touchAction: 'none' }} />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                        Tap to jump!
                    </div>
                </div>
            </div>
        </PlayGameShell>
    );
}
