import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Confetti } from '@/components/effects/Confetti';
import Mascot from '@/components/mascot/Mascot';
import { useTutorial } from '@/components/play/GameTutorial';
import { useGameSFX } from '@/hooks/useGameSFX';
import { fetchWords, WordRow } from '@/lib/supabaseQueries';
import { transformWordRowToWordItem } from '@/lib/dataTransformers';
import { WordItem } from '@/types/content';
import { Loader2 } from 'lucide-react';

// ==========================================
// GAME CONSTANTS
// ==========================================
const TOTAL_ROUNDS = 8;
const GRAVITY = 0.35;
const ARROW_SPEED = 16;

interface Target {
    x: number;
    y: number;
    word: WordItem;
    isCorrect: boolean;
    hit: boolean;
}

interface ArrowState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    active: boolean;
    trail: { x: number; y: number }[];
}

interface RoundData {
    question: WordItem;
    options: WordItem[];
}

// Shuffle helper
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Generate options for a question
function generateOptions(correct: WordItem, allWords: WordItem[], count: number): WordItem[] {
    const others = allWords.filter(w => w.id !== correct.id);
    const shuffled = shuffle(others).slice(0, count - 1);
    return shuffle([correct, ...shuffled]);
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function MonkeyArrow() {
    const sfx = useGameSFX();
    const tutorial = useTutorial('forest-archer-v2');

    const [phase, setPhase] = useState<'loading' | 'menu' | 'tutorial' | 'playing' | 'results'>('loading');
    const [allWords, setAllWords] = useState<WordItem[]>([]);
    const [rounds, setRounds] = useState<RoundData[]>([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const frameRef = useRef(0);
    const dims = useRef({ w: 400, h: 600 });

    const arrowRef = useRef<ArrowState | null>(null);
    const targetsRef = useRef<Target[]>([]);
    const canShootRef = useRef(true);
    const aimAngleRef = useRef(-0.3);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    // Load words from Supabase
    useEffect(() => {
        async function loadWords() {
            try {
                const wordRows = await fetchWords();
                const words = wordRows
                    .map(transformWordRowToWordItem)
                    .filter(w => w.imageUrl && w.toto);
                setAllWords(words);
                setPhase('menu');
            } catch (err) {
                console.error('Failed to load words:', err);
                setPhase('menu');
            }
        }
        loadWords();
    }, []);

    // Generate rounds
    const generateRounds = useCallback(() => {
        if (allWords.length < 4) return [];
        const questions = shuffle(allWords).slice(0, TOTAL_ROUNDS);
        return questions.map(q => ({
            question: q,
            options: generateOptions(q, allWords, 3)
        }));
    }, [allWords]);

    // Spawn targets for current round
    const spawnTargets = useCallback((roundData: RoundData, w: number, h: number) => {
        const positions = [
            { x: w * 0.55, y: h * 0.22 },
            { x: w * 0.75, y: h * 0.38 },
            { x: w * 0.60, y: h * 0.52 },
        ];
        const targets: Target[] = roundData.options.map((opt, i) => ({
            x: positions[i].x,
            y: positions[i].y,
            word: opt,
            isCorrect: opt.id === roundData.question.id,
            hit: false,
        }));
        targetsRef.current = targets;
    }, []);

    const startGame = useCallback(() => {
        if (tutorial.shouldShow) {
            setTutorialStep(0);
            setPhase('tutorial');
            return;
        }
        const r = generateRounds();
        setRounds(r);
        setCurrentRound(0);
        setScore(0);
        setCorrectCount(0);
        setShowConfetti(false);
        arrowRef.current = null;
        canShootRef.current = true;
        setPhase('playing');
        sfx.startBGM();
    }, [tutorial.shouldShow, generateRounds, sfx]);

    const handleTutorialDone = useCallback(() => {
        tutorial.markSeen();
        const r = generateRounds();
        setRounds(r);
        setCurrentRound(0);
        setScore(0);
        setCorrectCount(0);
        setShowConfetti(false);
        arrowRef.current = null;
        canShootRef.current = true;
        setPhase('playing');
        sfx.startBGM();
    }, [tutorial, generateRounds, sfx]);

    // Canvas event handlers
    const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = dims.current.w / rect.width;
        const scaleY = dims.current.h / rect.height;
        let clientX: number, clientY: number;
        if ('touches' in e) {
            clientX = e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX ?? 0;
            clientY = e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY ?? 0;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    }, []);

    const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!canShootRef.current) return;
        e.preventDefault();
        const coords = getCanvasCoords(e);
        isDraggingRef.current = true;
        dragStartRef.current = coords;
    }, [getCanvasCoords]);

    const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        const coords = getCanvasCoords(e);
        const { h } = dims.current;

        // Angle based on vertical drag
        const deltaY = dragStartRef.current.y - coords.y;
        aimAngleRef.current = Math.max(-0.7, Math.min(0.3, -deltaY / (h * 0.3)));
    }, [getCanvasCoords]);

    const handlePointerUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDraggingRef.current || !canShootRef.current) return;
        e.preventDefault();
        isDraggingRef.current = false;

        const { w, h } = dims.current;
        const bowX = w * 0.12;
        const bowY = h * 0.65;
        const angle = aimAngleRef.current;

        sfx.playShoot();
        arrowRef.current = {
            x: bowX + 30,
            y: bowY,
            vx: Math.cos(angle) * ARROW_SPEED,
            vy: Math.sin(angle) * ARROW_SPEED,
            rotation: angle,
            active: true,
            trail: []
        };
        canShootRef.current = false;
    }, [sfx]);

    // Drawing functions
    const drawForest = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) => {
        // Sky
        const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
        sky.addColorStop(0, '#87CEEB');
        sky.addColorStop(0.5, '#B8E0B8');
        sky.addColorStop(1, '#4CAF50');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        // Sun
        ctx.fillStyle = '#FFE082';
        ctx.beginPath();
        ctx.arc(w * 0.85, h * 0.1, 30, 0, Math.PI * 2);
        ctx.fill();

        // Trees
        const treePositions = [
            { x: w * 0.15, y: h * 0.35, s: 0.6 },
            { x: w * 0.35, y: h * 0.3, s: 0.8 },
            { x: w * 0.85, y: h * 0.32, s: 0.7 },
            { x: w * 0.95, y: h * 0.38, s: 0.5 },
        ];
        treePositions.forEach(({ x, y, s }) => {
            const sway = Math.sin(frame * 0.02 + x) * 2;
            // Trunk
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(x - 6 * s, y, 12 * s, 60 * s);
            // Foliage
            ctx.fillStyle = '#2E7D32';
            ctx.beginPath();
            ctx.moveTo(x + sway, y - 50 * s);
            ctx.lineTo(x - 35 * s, y + 10 * s);
            ctx.lineTo(x + 35 * s, y + 10 * s);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#388E3C';
            ctx.beginPath();
            ctx.moveTo(x + sway * 0.5, y - 30 * s);
            ctx.lineTo(x - 28 * s, y + 20 * s);
            ctx.lineTo(x + 28 * s, y + 20 * s);
            ctx.closePath();
            ctx.fill();
        });

        // Ground
        ctx.fillStyle = '#33691E';
        ctx.fillRect(0, h * 0.7, w, h * 0.3);

        // Grass
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        for (let i = 0; i < w; i += 20) {
            const sway = Math.sin(frame * 0.03 + i * 0.1) * 3;
            ctx.beginPath();
            ctx.moveTo(i, h * 0.7);
            ctx.quadraticCurveTo(i + sway, h * 0.7 - 15, i + sway * 1.5, h * 0.7 - 25);
            ctx.stroke();
        }
    }, []);

    const drawTarget = useCallback((ctx: CanvasRenderingContext2D, target: Target, frame: number, isHighlighted: boolean) => {
        if (target.hit) return;

        const { x, y, word } = target;
        const wobble = Math.sin(frame * 0.04 + x * 0.01) * 3;
        const size = 75;

        ctx.save();
        ctx.translate(x, y + wobble);

        // Glow for highlighted target
        if (isHighlighted) {
            ctx.shadowColor = '#4CAF50';
            ctx.shadowBlur = 20;
        }

        // Post
        ctx.fillStyle = '#6D4C41';
        ctx.fillRect(-5, size * 0.3, 10, size * 0.5);

        // Board
        const boardGrad = ctx.createLinearGradient(-size * 0.5, -size * 0.35, size * 0.5, size * 0.35);
        boardGrad.addColorStop(0, '#FFF8E1');
        boardGrad.addColorStop(0.5, '#FFECB3');
        boardGrad.addColorStop(1, '#FFE082');
        ctx.fillStyle = boardGrad;
        ctx.beginPath();
        ctx.roundRect(-size * 0.55, -size * 0.4, size * 1.1, size * 0.75, 8);
        ctx.fill();

        // Border
        ctx.strokeStyle = isHighlighted ? '#4CAF50' : '#8D6E63';
        ctx.lineWidth = isHighlighted ? 4 : 3;
        ctx.beginPath();
        ctx.roundRect(-size * 0.55, -size * 0.4, size * 1.1, size * 0.75, 8);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Toto word (main)
        ctx.fillStyle = '#3E2723';
        ctx.font = 'bold 16px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(word.toto, 0, -size * 0.1);

        // English (smaller)
        ctx.fillStyle = '#6D4C41';
        ctx.font = '11px Nunito, sans-serif';
        ctx.fillText(`(${word.english})`, 0, size * 0.12);

        ctx.restore();
    }, []);

    const drawBow = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, angle: number, isDragging: boolean, frame: number) => {
        const bowX = w * 0.12;
        const bowY = h * 0.65;
        const bowSize = 50;

        ctx.save();
        ctx.translate(bowX, bowY);

        // Hand
        ctx.fillStyle = '#FFCC80';
        ctx.beginPath();
        ctx.ellipse(-5, 5, 12, 15, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Bow
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(10, 0, bowSize * 0.7, -Math.PI * 0.45 + angle, Math.PI * 0.45 + angle);
        ctx.stroke();
        ctx.strokeStyle = '#795548';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Bowstring
        const topX = 10 + Math.cos(-Math.PI * 0.45 + angle) * bowSize * 0.7;
        const topY = Math.sin(-Math.PI * 0.45 + angle) * bowSize * 0.7;
        const botX = 10 + Math.cos(Math.PI * 0.45 + angle) * bowSize * 0.7;
        const botY = Math.sin(Math.PI * 0.45 + angle) * bowSize * 0.7;

        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (isDragging) {
            ctx.moveTo(topX, topY);
            ctx.lineTo(-10, 0);
            ctx.lineTo(botX, botY);
        } else {
            ctx.moveTo(topX, topY);
            ctx.lineTo(botX, botY);
        }
        ctx.stroke();

        // Arrow on bow
        ctx.save();
        ctx.rotate(angle);
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(isDragging ? -5 : 10, -2, 35, 4);
        ctx.fillStyle = '#C62828';
        ctx.beginPath();
        ctx.moveTo(isDragging ? 32 : 47, 0);
        ctx.lineTo(isDragging ? 24 : 39, -5);
        ctx.lineTo(isDragging ? 24 : 39, 5);
        ctx.closePath();
        ctx.fill();
        // Fletching
        ctx.fillStyle = '#FF6F00';
        ctx.beginPath();
        ctx.moveTo(isDragging ? -5 : 10, 0);
        ctx.lineTo(isDragging ? -12 : 3, -6);
        ctx.lineTo(isDragging ? -2 : 13, 0);
        ctx.lineTo(isDragging ? -12 : 3, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }, []);

    const drawArrow = useCallback((ctx: CanvasRenderingContext2D, arrow: ArrowState) => {
        if (!arrow.active) return;

        ctx.save();

        // Trail
        arrow.trail.forEach((p, i) => {
            ctx.fillStyle = `rgba(255, 152, 0, ${0.5 - i * 0.03})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.translate(arrow.x, arrow.y);
        ctx.rotate(arrow.rotation);

        // Shaft
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(-20, -2, 35, 4);

        // Head
        ctx.fillStyle = '#C62828';
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(10, -6);
        ctx.lineTo(10, 6);
        ctx.closePath();
        ctx.fill();

        // Fletching
        ctx.fillStyle = '#FF6F00';
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(-26, -7);
        ctx.lineTo(-15, 0);
        ctx.lineTo(-26, 7);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }, []);

    const drawTrajectory = useCallback((ctx: CanvasRenderingContext2D, startX: number, startY: number, angle: number) => {
        ctx.save();
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();

        let px = startX, py = startY;
        let vx = Math.cos(angle) * ARROW_SPEED;
        let vy = Math.sin(angle) * ARROW_SPEED;

        ctx.moveTo(px, py);
        for (let i = 0; i < 40; i++) {
            px += vx;
            py += vy;
            vy += GRAVITY;
            if (py > dims.current.h || px > dims.current.w) break;
            ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Crosshair
        ctx.setLineDash([]);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }, []);

    // Game loop
    useEffect(() => {
        if (phase !== 'playing' && phase !== 'tutorial') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        if (!parent) return;

        const w = parent.clientWidth || 400;
        const h = parent.clientHeight || 600;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        dims.current = { w, h };

        // Spawn targets
        if (phase === 'playing' && rounds[currentRound]) {
            spawnTargets(rounds[currentRound], w, h);
        } else if (phase === 'tutorial') {
            // Demo targets for tutorial
            targetsRef.current = [
                { x: w * 0.55, y: h * 0.22, word: { id: '1', english: 'Apple', toto: 'Example', transliteration: '', imageUrl: '', audioToto: '', audioEnglish: '', category: '' }, isCorrect: false, hit: false },
                { x: w * 0.75, y: h * 0.38, word: { id: '2', english: 'Correct', toto: 'Target', transliteration: '', imageUrl: '', audioToto: '', audioEnglish: '', category: '' }, isCorrect: true, hit: false },
                { x: w * 0.60, y: h * 0.52, word: { id: '3', english: 'Banana', toto: 'Word', transliteration: '', imageUrl: '', audioToto: '', audioEnglish: '', category: '' }, isCorrect: false, hit: false },
            ];
        }

        const bowX = w * 0.12;
        const bowY = h * 0.65;

        const loop = () => {
            if (!ctx) return;
            frameRef.current++;
            const f = frameRef.current;

            // Draw scene
            drawForest(ctx, w, h, f);

            // Draw targets
            const targets = targetsRef.current;
            targets.forEach((t, i) => {
                drawTarget(ctx, t, f, phase === 'tutorial' && tutorialStep === 1 && t.isCorrect);
            });

            // Update & draw arrow
            const arrow = arrowRef.current;
            if (arrow && arrow.active) {
                arrow.x += arrow.vx;
                arrow.y += arrow.vy;
                arrow.vy += GRAVITY;
                arrow.rotation = Math.atan2(arrow.vy, arrow.vx);

                arrow.trail.unshift({ x: arrow.x, y: arrow.y });
                if (arrow.trail.length > 15) arrow.trail.pop();

                // Collision
                for (const t of targets) {
                    if (t.hit) continue;
                    const dx = arrow.x - t.x;
                    const dy = arrow.y - t.y;
                    if (Math.abs(dx) < 45 && Math.abs(dy) < 35) {
                        arrow.active = false;
                        t.hit = true;

                        if (t.isCorrect) {
                            sfx.playHit();
                            sfx.playCorrect();
                            setScore(s => s + 100);
                            setCorrectCount(c => c + 1);

                            if (phase === 'tutorial') {
                                setTimeout(() => {
                                    setTutorialStep(3);
                                }, 500);
                            } else {
                                setTimeout(() => {
                                    arrowRef.current = null;
                                    if (currentRound + 1 >= TOTAL_ROUNDS) {
                                        setShowConfetti(true);
                                        sfx.playVictory();
                                        sfx.stopBGM();
                                        setPhase('results');
                                    } else {
                                        setCurrentRound(r => r + 1);
                                        canShootRef.current = true;
                                    }
                                }, 800);
                            }
                        } else {
                            sfx.playWrong();
                            setTimeout(() => {
                                arrowRef.current = null;
                                canShootRef.current = true;
                            }, 500);
                        }
                        break;
                    }
                }

                // Off screen
                if (arrow.x > w + 50 || arrow.y > h + 50) {
                    arrowRef.current = null;
                    canShootRef.current = true;
                }
            }

            if (arrow) drawArrow(ctx, arrow);

            // Draw bow
            drawBow(ctx, w, h, aimAngleRef.current, isDraggingRef.current, f);

            // Trajectory preview
            if (isDraggingRef.current && canShootRef.current) {
                drawTrajectory(ctx, bowX + 30, bowY, aimAngleRef.current);
            }

            // Tutorial overlays
            if (phase === 'tutorial') {
                drawTutorialOverlay(ctx, w, h, f);
            }

            animRef.current = requestAnimationFrame(loop);
        };

        const drawTutorialOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) => {
            // Semi-transparent overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, w, h);

            // Big animated arrow
            const arrowBob = Math.sin(frame * 0.1) * 10;

            if (tutorialStep === 0) {
                // Point to bow area
                drawBigArrow(ctx, w * 0.25, h * 0.5 + arrowBob, w * 0.15, h * 0.65, frame);
                drawInstructionBox(ctx, w * 0.5, h * 0.35, '👆', 'Drag here to aim!', w);
            } else if (tutorialStep === 1) {
                // Point to targets
                drawBigArrow(ctx, w * 0.45, h * 0.25 + arrowBob, w * 0.6, h * 0.38, frame);
                drawInstructionBox(ctx, w * 0.5, h * 0.7, '🎯', 'Hit the correct target!', w);
            } else if (tutorialStep === 2) {
                // Point to release
                drawBigArrow(ctx, w * 0.3, h * 0.45 + arrowBob, w * 0.15, h * 0.55, frame);
                drawInstructionBox(ctx, w * 0.5, h * 0.3, '🚀', 'Release to shoot!', w);
            } else if (tutorialStep === 3) {
                // Success!
                drawInstructionBox(ctx, w * 0.5, h * 0.4, '🎉', "You're ready!", w);
            }
        };

        const drawBigArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, frame: number) => {
            const pulse = 1 + Math.sin(frame * 0.15) * 0.1;
            const angle = Math.atan2(toY - fromY, toX - fromX);
            const length = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);

            ctx.save();
            ctx.translate(fromX, fromY);
            ctx.rotate(angle);
            ctx.scale(pulse, pulse);

            // Arrow shaft
            ctx.fillStyle = '#FFD700';
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
            ctx.fillRect(0, -8, length - 30, 16);

            // Arrow head
            ctx.beginPath();
            ctx.moveTo(length, 0);
            ctx.lineTo(length - 35, -20);
            ctx.lineTo(length - 35, 20);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        };

        const drawInstructionBox = (ctx: CanvasRenderingContext2D, x: number, y: number, emoji: string, text: string, w: number) => {
            ctx.save();

            // Box
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.roundRect(x - 100, y - 50, 200, 100, 20);
            ctx.fill();

            ctx.shadowBlur = 0;

            // Emoji
            ctx.font = '40px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, x, y - 15);

            // Text
            ctx.fillStyle = '#333';
            ctx.font = 'bold 16px Nunito, sans-serif';
            ctx.fillText(text, x, y + 25);

            ctx.restore();
        };

        animRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animRef.current);
    }, [phase, currentRound, rounds, tutorialStep, spawnTargets, drawForest, drawTarget, drawBow, drawArrow, drawTrajectory, sfx]);

    // Spawn targets when round changes
    useEffect(() => {
        if (phase === 'playing' && rounds[currentRound]) {
            spawnTargets(rounds[currentRound], dims.current.w, dims.current.h);
        }
    }, [currentRound, phase, rounds, spawnTargets]);

    // Tutorial interaction
    const handleTutorialTap = useCallback(() => {
        if (tutorialStep === 0) {
            setTutorialStep(1);
        } else if (tutorialStep === 1) {
            setTutorialStep(2);
            canShootRef.current = true;
        } else if (tutorialStep === 3) {
            handleTutorialDone();
        }
    }, [tutorialStep, handleTutorialDone]);

    // Cleanup
    useEffect(() => () => { sfx.stopBGM(); }, [sfx]);

    // ==========================================
    // SCREENS
    // ==========================================
    if (phase === 'loading') {
        return (
            <PlayGameShell title="Forest Archer" icon="🏹" gradient="from-green-500 to-emerald-600">
                <div className="flex flex-col items-center justify-center min-h-[65vh]">
                    <Loader2 className="w-12 h-12 animate-spin text-green-500 mb-4" />
                    <p className="text-gray-500">Loading words...</p>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'tutorial') {
        return (
            <PlayGameShell title="Forest Archer" icon="🏹" gradient="from-green-500 to-emerald-600">
                <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
                    <div
                        className="flex-1 relative overflow-hidden"
                        onClick={handleTutorialTap}
                        onTouchStart={tutorialStep === 2 ? handlePointerDown : undefined}
                        onTouchMove={tutorialStep === 2 ? handlePointerMove : undefined}
                        onTouchEnd={tutorialStep === 2 ? handlePointerUp : undefined}
                        onMouseDown={tutorialStep === 2 ? handlePointerDown : undefined}
                        onMouseMove={tutorialStep === 2 ? handlePointerMove : undefined}
                        onMouseUp={tutorialStep === 2 ? handlePointerUp : undefined}
                    >
                        <canvas ref={canvasRef} className="block absolute inset-0" style={{ touchAction: 'none' }} />
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'menu') {
        return (
            <PlayGameShell title="Forest Archer" icon="🏹" gradient="from-green-500 to-emerald-600">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center">
                    <div className="text-7xl mb-4">🏹🌲</div>
                    <h2 className="text-xl font-extrabold text-gray-800 mt-2 mb-2">Forest Archer</h2>
                    <p className="text-sm text-gray-500 mb-4 max-w-xs">
                        Shoot arrows at targets with the correct Toto words!
                    </p>
                    {allWords.length > 0 ? (
                        <p className="text-xs text-green-600 mb-4">{allWords.length} words loaded from database</p>
                    ) : (
                        <p className="text-xs text-orange-500 mb-4">No words available</p>
                    )}
                    <button
                        onClick={() => { sfx.playClick(); startGame(); }}
                        disabled={allWords.length < 4}
                        className="btn-game bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-3 text-lg rounded-xl font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                    >
                        Start Game 🏹
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'results') {
        const percentage = Math.round((correctCount / TOTAL_ROUNDS) * 100);
        return (
            <PlayGameShell title="Forest Archer" icon="🏹" gradient="from-green-500 to-emerald-600">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
                    {showConfetti && <Confetti />}
                    <span className="text-6xl mb-3">{percentage >= 80 ? '🏆' : percentage >= 50 ? '⭐' : '💪'}</span>
                    <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
                        {percentage >= 80 ? 'Master Archer!' : percentage >= 50 ? 'Good Shooting!' : 'Keep Practicing!'}
                    </h2>
                    <p className="text-gray-500 mb-4">You hit {correctCount} out of {TOTAL_ROUNDS} targets!</p>
                    <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center">
                                <p className="text-2xl font-extrabold text-amber-500">{score}</p>
                                <p className="text-xs text-gray-500">Score</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-extrabold text-green-500">{percentage}%</p>
                                <p className="text-xs text-gray-500">Accuracy</p>
                            </div>
                        </div>
                    </div>
                    <Mascot mood="happy" size="sm" message="Great archery! 🎯" className="mt-4" />
                    <div className="mt-5 flex gap-3">
                        <button onClick={() => { sfx.playClick(); startGame(); }} className="btn-game bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg active:scale-95">
                            Play Again 🔄
                        </button>
                        <button onClick={() => { sfx.stopBGM(); window.history.back(); }} className="btn-game bg-white text-gray-700 border-2 border-gray-200 px-6 py-3 rounded-xl font-bold active:scale-95">
                            Back
                        </button>
                    </div>
                </div>
            </PlayGameShell>
        );
    }

    // Playing
    const round = rounds[currentRound];
    return (
        <PlayGameShell title="Forest Archer" icon="🏹" gradient="from-green-500 to-emerald-600">
            <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
                {/* Question bar */}
                <div className="flex items-center justify-between px-3 py-2 bg-white/90 backdrop-blur-sm shrink-0 border-b border-gray-100 shadow-sm">
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">🪙 {score}</span>
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
                        {round?.question.imageUrl && (
                            <img src={round.question.imageUrl} alt="" className="w-7 h-7 rounded object-cover" />
                        )}
                        <div className="text-center">
                            <span className="text-sm font-bold text-green-800">Find: {round?.question.english}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i < correctCount ? 'bg-green-500' : i === currentRound ? 'bg-amber-400' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div
                    className="flex-1 relative overflow-hidden"
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={() => { isDraggingRef.current = false; }}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                >
                    <canvas ref={canvasRef} className="block absolute inset-0" style={{ touchAction: 'none' }} />
                </div>
            </div>
        </PlayGameShell>
    );
}
