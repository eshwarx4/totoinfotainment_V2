import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Confetti } from '@/components/effects/Confetti';
import Mascot from '@/components/mascot/Mascot';
import { useTutorial } from '@/components/play/GameTutorial';
import { useGameSFX } from '@/hooks/useGameSFX';
import { ALL_WORDS, WordItem } from '@/data/wordData';

// ==========================================
// GAME CONSTANTS
// ==========================================
const TOTAL_ROUNDS = 8;
const GRAVITY = 0.5;
const MAX_POWER = 100;

interface GameWord {
    id: string;
    english: string;
    imageUrl: string;
    audioTotoUrl: string;
    audioEnglishUrl: string;
}

interface Target {
    x: number;
    y: number;
    word: GameWord;
    isCorrect: boolean;
    hit: boolean;
}

interface Arrow {
    x: number;
    y: number;
    vx: number;
    vy: number;
    active: boolean;
}

interface RoundData {
    question: GameWord;
    options: GameWord[];
}

// Shuffle array
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function toGameWord(w: WordItem): GameWord {
    return {
        id: w.id,
        english: w.english,
        imageUrl: w.imageUrl,
        audioTotoUrl: w.audioTotoUrl,
        audioEnglishUrl: w.audioEnglishUrl,
    };
}

// Generate options
function generateOptions(correct: GameWord, allWords: GameWord[], count: number): GameWord[] {
    const others = allWords.filter(w => w.id !== correct.id);
    const shuffled = shuffle(others).slice(0, count - 1);
    return shuffle([correct, ...shuffled]);
}

// Get words with images
function getUsableWords(): GameWord[] {
    return ALL_WORDS.filter(w => w.imageUrl).map(toGameWord);
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function MonkeyArrow() {
    const sfx = useGameSFX();
    const tutorial = useTutorial('forest-archer-v4');

    const [phase, setPhase] = useState<'menu' | 'tutorial' | 'playing' | 'results'>('menu');
    const [rounds, setRounds] = useState<RoundData[]>([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const frameRef = useRef(0);
    const dimsRef = useRef({ w: 400, h: 600 });

    const arrowRef = useRef<Arrow | null>(null);
    const targetsRef = useRef<Target[]>([]);
    const canShootRef = useRef(true);
    const aimingRef = useRef(false);
    const powerRef = useRef(0);
    const angleRef = useRef(-0.3);
    const hitEffectRef = useRef<{ x: number; y: number; frame: number; correct: boolean } | null>(null);

    const allWordsRef = useRef<GameWord[]>(getUsableWords());
    const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

    // Generate rounds from local data
    const generateRounds = useCallback((): RoundData[] => {
        const words = allWordsRef.current;
        if (words.length < 4) return [];
        const questions = shuffle(words).slice(0, TOTAL_ROUNDS);
        return questions.map(q => ({
            question: q,
            options: generateOptions(q, words, 3)
        }));
    }, []);

    const spawnTargets = useCallback((roundData: RoundData, w: number, h: number) => {
        const positions = [
            { x: w * 0.50, y: h * 0.18 },
            { x: w * 0.78, y: h * 0.35 },
            { x: w * 0.58, y: h * 0.50 },
        ];
        targetsRef.current = roundData.options.map((opt, i) => ({
            x: positions[i].x,
            y: positions[i].y,
            word: opt,
            isCorrect: opt.id === roundData.question.id,
            hit: false,
        }));
    }, []);

    const startGame = useCallback(() => {
        if (tutorial.shouldShow) {
            setTutorialStep(0);
            setPhase('tutorial');
            return;
        }
        const r = generateRounds();
        if (r.length === 0) return;
        setRounds(r);
        setCurrentRound(0);
        setScore(0);
        setCorrectCount(0);
        setShowConfetti(false);
        arrowRef.current = null;
        canShootRef.current = true;
        powerRef.current = 0;
        hitEffectRef.current = null;
        setPhase('playing');
        sfx.startBGM();
        // Preload images for all rounds
        r.forEach(rd => {
            rd.options.forEach(opt => {
                if (opt.imageUrl && !imgCacheRef.current.has(opt.id)) {
                    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = opt.imageUrl;
                    imgCacheRef.current.set(opt.id, img);
                }
            });
        });
    }, [tutorial.shouldShow, generateRounds, sfx]);

    const finishTutorial = useCallback(() => {
        tutorial.markSeen();
        const r = generateRounds();
        setRounds(r);
        setCurrentRound(0);
        setScore(0);
        setCorrectCount(0);
        arrowRef.current = null;
        canShootRef.current = true;
        powerRef.current = 0;
        hitEffectRef.current = null;
        setPhase('playing');
        sfx.startBGM();
    }, [tutorial, generateRounds, sfx]);

    // Pointer handlers
    const getCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = dimsRef.current.w / rect.width;
        const scaleY = dimsRef.current.h / rect.height;
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

    const onPointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!canShootRef.current) return;
        e.preventDefault();
        aimingRef.current = true;
        powerRef.current = 0;
    }, []);

    const onPointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!aimingRef.current) return;
        e.preventDefault();
        const coords = getCoords(e);
        const { w, h } = dimsRef.current;
        const bowX = 80;
        const bowY = h * 0.7;

        // Calculate angle from bow to pointer
        const dx = coords.x - bowX;
        const dy = coords.y - bowY;
        angleRef.current = Math.atan2(dy, dx);
        // Clamp angle: allow -1.5 (pointing almost straight up) to 0.5 (pointing down-right)
        angleRef.current = Math.max(-1.5, Math.min(0.5, angleRef.current));

        // Power based on distance - scale up for easier aiming
        const dist = Math.sqrt(dx * dx + dy * dy);
        powerRef.current = Math.min(dist * 1.5, MAX_POWER);
    }, [getCoords]);

    const onPointerUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!aimingRef.current || !canShootRef.current) return;
        e.preventDefault();
        aimingRef.current = false;

        if (powerRef.current < 15) {
            powerRef.current = 0;
            return;
        }

        const { h } = dimsRef.current;
        const bowX = 80;
        const bowY = h * 0.7;
        const speed = (powerRef.current / MAX_POWER) * 28;

        sfx.playShoot();
        arrowRef.current = {
            x: bowX + 50,
            y: bowY,
            vx: Math.cos(angleRef.current) * speed,
            vy: Math.sin(angleRef.current) * speed,
            active: true
        };
        canShootRef.current = false;
        powerRef.current = 0;
    }, [sfx]);

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
        dimsRef.current = { w, h };

        const bowX = 80;
        const bowY = h * 0.8;

        // Spawn targets
        if (phase === 'playing' && rounds[currentRound]) {
            spawnTargets(rounds[currentRound], w, h);
        } else if (phase === 'tutorial') {
            const demoWords: GameWord[] = [
                { id: '1', english: 'Apple', imageUrl: '', audioTotoUrl: '', audioEnglishUrl: '' },
                { id: '2', english: 'Bird', imageUrl: '', audioTotoUrl: '', audioEnglishUrl: '' },
                { id: '3', english: 'Cat', imageUrl: '', audioTotoUrl: '', audioEnglishUrl: '' },
            ];
            targetsRef.current = [
                { x: w * 0.50, y: h * 0.18, word: demoWords[0], isCorrect: false, hit: false },
                { x: w * 0.78, y: h * 0.35, word: demoWords[1], isCorrect: true, hit: false },
                { x: w * 0.58, y: h * 0.50, word: demoWords[2], isCorrect: false, hit: false },
            ];
        }

        const loop = () => {
            if (!ctx) return;
            frameRef.current++;
            const f = frameRef.current;

            // === DRAW FOREST BACKGROUND ===
            // Sky
            const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
            sky.addColorStop(0, '#87CEEB');
            sky.addColorStop(0.4, '#98D8AA');
            sky.addColorStop(1, '#4CAF50');
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, h);

            // Sun
            ctx.fillStyle = '#FFE082';
            ctx.beginPath();
            ctx.arc(w * 0.85, h * 0.1, 30, 0, Math.PI * 2);
            ctx.fill();

            // Mountains
            ctx.fillStyle = '#6B8E7B';
            ctx.beginPath();
            ctx.moveTo(0, h * 0.35);
            ctx.lineTo(w * 0.2, h * 0.2);
            ctx.lineTo(w * 0.4, h * 0.32);
            ctx.lineTo(w * 0.6, h * 0.18);
            ctx.lineTo(w * 0.8, h * 0.28);
            ctx.lineTo(w, h * 0.3);
            ctx.lineTo(w, h * 0.4);
            ctx.lineTo(0, h * 0.4);
            ctx.closePath();
            ctx.fill();

            // Trees
            const drawTree = (tx: number, ty: number, scale: number) => {
                const sway = Math.sin(f * 0.02 + tx) * 2;
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(tx - 6 * scale, ty, 12 * scale, 50 * scale);
                ctx.fillStyle = '#2E7D32';
                ctx.beginPath();
                ctx.moveTo(tx + sway, ty - 40 * scale);
                ctx.lineTo(tx - 30 * scale, ty + 5);
                ctx.lineTo(tx + 30 * scale, ty + 5);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#388E3C';
                ctx.beginPath();
                ctx.moveTo(tx + sway * 0.7, ty - 25 * scale);
                ctx.lineTo(tx - 25 * scale, ty + 15);
                ctx.lineTo(tx + 25 * scale, ty + 15);
                ctx.closePath();
                ctx.fill();
            };
            drawTree(w * 0.05, h * 0.45, 1.2);
            drawTree(w * 0.15, h * 0.42, 0.9);
            drawTree(w * 0.9, h * 0.43, 1.1);
            drawTree(w * 0.95, h * 0.46, 0.8);

            // Birds
            const drawBird = (bx: number, by: number) => {
                const wingAngle = Math.sin(f * 0.15) * 0.4;
                ctx.strokeStyle = '#5D4037';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(bx - 8, by);
                ctx.quadraticCurveTo(bx - 4, by - 6 * Math.cos(wingAngle), bx, by);
                ctx.quadraticCurveTo(bx + 4, by - 6 * Math.cos(wingAngle), bx + 8, by);
                ctx.stroke();
            };
            drawBird((w * 0.3 + f * 0.5) % w, h * 0.12);
            drawBird((w * 0.6 + f * 0.3) % w, h * 0.08);

            // Ground
            ctx.fillStyle = '#33691E';
            ctx.fillRect(0, h * 0.78, w, h * 0.22);

            // Grass
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 2;
            for (let i = 0; i < w; i += 20) {
                const sway = Math.sin(f * 0.03 + i * 0.1) * 3;
                ctx.beginPath();
                ctx.moveTo(i, h * 0.78);
                ctx.lineTo(i + sway, h * 0.78 - 15);
                ctx.stroke();
            }

            // Flowers
            const flowerColors = ['#E91E63', '#9C27B0', '#FF9800', '#FFEB3B'];
            for (let i = 0; i < w; i += 50) {
                ctx.fillStyle = flowerColors[i % 4];
                ctx.beginPath();
                ctx.arc(i + 25, h * 0.79, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFC107';
                ctx.beginPath();
                ctx.arc(i + 25, h * 0.79, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // === DRAW TARGETS ===
            targetsRef.current.forEach(t => {
                if (t.hit) return;
                const bob = Math.sin(f * 0.04 + t.x * 0.01) * 3;

                ctx.save();
                ctx.translate(t.x, t.y + bob);

                // Post
                ctx.fillStyle = '#6D4C41';
                ctx.fillRect(-5, 20, 10, 40);

                // Board shadow
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.beginPath();
                ctx.roundRect(-52, -27, 108, 52, 8);
                ctx.fill();

                // Board
                const boardGrad = ctx.createLinearGradient(-50, -25, 50, 25);
                boardGrad.addColorStop(0, '#FFECB3');
                boardGrad.addColorStop(0.5, '#FFE082');
                boardGrad.addColorStop(1, '#FFCA28');
                ctx.fillStyle = boardGrad;
                ctx.beginPath();
                ctx.roundRect(-50, -28, 100, 50, 8);
                ctx.fill();

                // Border
                ctx.strokeStyle = t.isCorrect ? '#4CAF50' : '#8D6E63';
                ctx.lineWidth = t.isCorrect ? 4 : 3;
                ctx.beginPath();
                ctx.roundRect(-50, -28, 100, 50, 8);
                ctx.stroke();

                // Word text
                ctx.fillStyle = '#3E2723';
                ctx.font = 'bold 18px Nunito, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(t.word.english, 0, 0);

                ctx.restore();
            });

            // === UPDATE ARROW ===
            const arrow = arrowRef.current;
            if (arrow && arrow.active) {
                arrow.x += arrow.vx;
                arrow.y += arrow.vy;
                arrow.vy += GRAVITY;

                // Check collision
                for (const t of targetsRef.current) {
                    if (t.hit) continue;
                    const dx = arrow.x - t.x;
                    const dy = arrow.y - t.y;
                    if (Math.abs(dx) < 50 && Math.abs(dy) < 30) {
                        arrow.active = false;
                        t.hit = true;
                        hitEffectRef.current = { x: t.x, y: t.y, frame: 0, correct: t.isCorrect };

                        if (t.isCorrect) {
                            sfx.playHit();
                            sfx.playCorrect();
                            setScore(s => s + 100);
                            setCorrectCount(c => c + 1);
                            // Play English audio on correct hit
                            if (t.word.audioEnglishUrl) {
                                try { new Audio(t.word.audioEnglishUrl).play().catch(() => { }); } catch { }
                            }

                            if (phase === 'tutorial') {
                                setTimeout(() => setTutorialStep(3), 500);
                            } else {
                                setTimeout(() => {
                                    hitEffectRef.current = null;
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
                                }, 1000);
                            }
                        } else {
                            sfx.playWrong();
                            setTimeout(() => {
                                hitEffectRef.current = null;
                                arrowRef.current = null;
                                canShootRef.current = true;
                            }, 600);
                        }
                        break;
                    }
                }

                // Off screen
                if (arrow.x > w + 50 || arrow.y > h + 50 || arrow.x < -50) {
                    arrowRef.current = null;
                    canShootRef.current = true;
                }
            }

            // === DRAW ARROW ===
            if (arrow && arrow.active) {
                const rotation = Math.atan2(arrow.vy, arrow.vx);
                ctx.save();
                ctx.translate(arrow.x, arrow.y);
                ctx.rotate(rotation);

                // Shaft
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(-25, -3, 50, 6);

                // Head
                ctx.fillStyle = '#C62828';
                ctx.beginPath();
                ctx.moveTo(30, 0);
                ctx.lineTo(20, -8);
                ctx.lineTo(20, 8);
                ctx.closePath();
                ctx.fill();

                // Fletching
                ctx.fillStyle = '#FF6F00';
                ctx.beginPath();
                ctx.moveTo(-22, 0);
                ctx.lineTo(-32, -10);
                ctx.lineTo(-18, 0);
                ctx.lineTo(-32, 10);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            }

            // === HIT EFFECT ===
            if (hitEffectRef.current) {
                hitEffectRef.current.frame++;
                const hf = hitEffectRef.current;
                const progress = Math.min(hf.frame / 25, 1);
                const radius = progress * 50;
                const alpha = 1 - progress;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = hf.correct ? '#4CAF50' : '#F44336';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(hf.x, hf.y, radius, 0, Math.PI * 2);
                ctx.stroke();

                if (hf.correct) {
                    ctx.fillStyle = '#4CAF50';
                    ctx.font = 'bold 28px Nunito, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('+100', hf.x, hf.y - radius - 10);
                }
                ctx.restore();
            }

            // === DRAW BOW ===
            ctx.save();
            ctx.translate(bowX, bowY);
            ctx.rotate(angleRef.current);

            // Bow body
            ctx.strokeStyle = '#5D4037';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(0, 0, 60, -Math.PI * 0.45, Math.PI * 0.45);
            ctx.stroke();
            ctx.strokeStyle = '#795548';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Bow tips
            ctx.fillStyle = '#3E2723';
            ctx.beginPath();
            ctx.arc(Math.cos(-Math.PI * 0.45) * 60, Math.sin(-Math.PI * 0.45) * 60, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(Math.cos(Math.PI * 0.45) * 60, Math.sin(Math.PI * 0.45) * 60, 5, 0, Math.PI * 2);
            ctx.fill();

            // Bowstring
            const topX = Math.cos(-Math.PI * 0.45) * 60;
            const topY = Math.sin(-Math.PI * 0.45) * 60;
            const botX = Math.cos(Math.PI * 0.45) * 60;
            const botY = Math.sin(Math.PI * 0.45) * 60;
            const pull = aimingRef.current ? powerRef.current * 0.3 : 0;

            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(topX, topY);
            if (pull > 5) ctx.lineTo(-pull, 0);
            ctx.lineTo(botX, botY);
            ctx.stroke();

            // Arrow on bow
            if (canShootRef.current) {
                const arrowX = pull > 5 ? -pull : 5;
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(arrowX, -3, 50, 6);
                ctx.fillStyle = '#C62828';
                ctx.beginPath();
                ctx.moveTo(arrowX + 55, 0);
                ctx.lineTo(arrowX + 45, -7);
                ctx.lineTo(arrowX + 45, 7);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#FF6F00';
                ctx.beginPath();
                ctx.moveTo(arrowX + 5, 0);
                ctx.lineTo(arrowX - 8, -8);
                ctx.lineTo(arrowX + 3, 0);
                ctx.lineTo(arrowX - 8, 8);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();

            // === TRAJECTORY LINE ===
            if (aimingRef.current && powerRef.current > 15 && canShootRef.current) {
                const speed = (powerRef.current / MAX_POWER) * 28;
                let px = bowX + 50 + Math.cos(angleRef.current) * 30;
                let py = bowY + Math.sin(angleRef.current) * 30;
                let vx = Math.cos(angleRef.current) * speed;
                let vy = Math.sin(angleRef.current) * speed;

                ctx.save();
                ctx.setLineDash([10, 8]);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(px, py);

                for (let i = 0; i < 50; i++) {
                    px += vx;
                    py += vy;
                    vy += GRAVITY;
                    if (py > h || px > w) break;
                    ctx.lineTo(px, py);
                }
                ctx.stroke();

                // Crosshair at end
                ctx.setLineDash([]);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(px, py, 12, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(px - 18, py);
                ctx.lineTo(px + 18, py);
                ctx.moveTo(px, py - 18);
                ctx.lineTo(px, py + 18);
                ctx.stroke();

                ctx.restore();
            }

            // === TUTORIAL OVERLAY ===
            if (phase === 'tutorial') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fillRect(0, 0, w, h);

                const pulse = 1 + Math.sin(f * 0.1) * 0.1;
                const bob = Math.sin(f * 0.08) * 10;

                // Big golden arrow pointer
                const drawPointer = (fromX: number, fromY: number, toX: number, toY: number) => {
                    const angle = Math.atan2(toY - fromY, toX - fromX);
                    const length = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);

                    ctx.save();
                    ctx.translate(fromX, fromY);
                    ctx.rotate(angle);
                    ctx.scale(pulse, pulse);

                    ctx.shadowColor = '#FFD700';
                    ctx.shadowBlur = 20;
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(0, -12, length - 30, 24);
                    ctx.beginPath();
                    ctx.moveTo(length, 0);
                    ctx.lineTo(length - 40, -25);
                    ctx.lineTo(length - 40, 25);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                };

                // Instruction box
                const drawBox = (bx: number, by: number, emoji: string, text: string) => {
                    ctx.save();
                    ctx.shadowColor = 'rgba(0,0,0,0.3)';
                    ctx.shadowBlur = 15;
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.roundRect(bx - 120, by - 50, 240, 100, 20);
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    ctx.font = '42px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(emoji, bx, by - 10);

                    ctx.fillStyle = '#333';
                    ctx.font = 'bold 16px Nunito, sans-serif';
                    ctx.fillText(text, bx, by + 30);
                    ctx.restore();
                };

                if (tutorialStep === 0) {
                    drawPointer(w * 0.3, h * 0.5 + bob, bowX + 40, bowY - 30);
                    drawBox(w * 0.55, h * 0.25, '🏹', 'Tap & drag to aim the bow!');
                } else if (tutorialStep === 1) {
                    drawPointer(w * 0.4, h * 0.12 + bob, w * 0.65, h * 0.35);
                    drawBox(w * 0.5, h * 0.7, '🎯', 'Find "Bird" and shoot it!');
                    // Highlight correct target
                    const correct = targetsRef.current.find(t => t.isCorrect);
                    if (correct) {
                        ctx.strokeStyle = '#4CAF50';
                        ctx.lineWidth = 4;
                        ctx.setLineDash([8, 4]);
                        ctx.beginPath();
                        ctx.arc(correct.x, correct.y, 60, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
                } else if (tutorialStep === 2) {
                    drawBox(w * 0.5, h * 0.35, '🚀', 'Release to shoot!');
                } else if (tutorialStep === 3) {
                    drawBox(w * 0.5, h * 0.4, '🎉', "You're ready to play!");
                }
            }

            // === INSTRUCTIONS (playing mode) ===
            if (phase === 'playing' && canShootRef.current && !arrowRef.current) {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.beginPath();
                ctx.roundRect(w * 0.2, h * 0.88, w * 0.6, 35, 18);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = 'bold 13px Nunito, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('👆 Drag anywhere to aim, release to shoot!', w * 0.5, h * 0.9 + 6);
                ctx.restore();
            }

            animRef.current = requestAnimationFrame(loop);
        };

        animRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animRef.current);
    }, [phase, currentRound, rounds, tutorialStep, spawnTargets, sfx]);

    // Update targets when round changes + play Toto audio
    useEffect(() => {
        if (phase === 'playing' && rounds[currentRound]) {
            spawnTargets(rounds[currentRound], dimsRef.current.w, dimsRef.current.h);
            // Play Toto audio for the question word
            const q = rounds[currentRound].question;
            if (q.audioTotoUrl) {
                try { new Audio(q.audioTotoUrl).play().catch(() => { }); } catch { }
            }
        }
    }, [currentRound, phase, rounds, spawnTargets]);

    // Tutorial tap handler
    const onTutorialTap = useCallback(() => {
        if (tutorialStep === 0) setTutorialStep(1);
        else if (tutorialStep === 1) { setTutorialStep(2); canShootRef.current = true; }
        else if (tutorialStep === 3) finishTutorial();
    }, [tutorialStep, finishTutorial]);

    useEffect(() => () => { sfx.stopBGM(); }, [sfx]);

    // ==========================================
    // SCREENS
    // ==========================================
    if (phase === 'tutorial') {
        return (
            <PlayGameShell title="Forest Archer" icon="🏹" gradient="from-green-500 to-emerald-600">
                <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
                    <div
                        className="flex-1 relative overflow-hidden"
                        onClick={tutorialStep !== 2 ? onTutorialTap : undefined}
                        onTouchStart={tutorialStep === 2 ? onPointerDown : undefined}
                        onTouchMove={tutorialStep === 2 ? onPointerMove : undefined}
                        onTouchEnd={tutorialStep === 2 ? onPointerUp : undefined}
                        onMouseDown={tutorialStep === 2 ? onPointerDown : undefined}
                        onMouseMove={tutorialStep === 2 ? onPointerMove : undefined}
                        onMouseUp={tutorialStep === 2 ? onPointerUp : undefined}
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
                    <p className="text-sm text-gray-500 mb-2 max-w-xs">
                        Shoot arrows at targets with the correct words!
                    </p>
                    <p className="text-xs text-green-600 mb-4">{allWordsRef.current.length} words loaded</p>
                    <button
                        onClick={() => { sfx.playClick(); startGame(); }}
                        className="btn-game bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-3 text-lg rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
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
            <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
                {/* Top bar — Big question image + Score + progress */}
                <div className="flex items-center justify-between px-3 py-2 bg-white/95 backdrop-blur-sm shrink-0 border-b border-gray-100 gap-2">
                    {/* Question: BIG image, highlighted green border */}
                    <div className="shrink-0 rounded-2xl p-1" style={{ background: 'linear-gradient(135deg, #4CAF50, #81C784)', boxShadow: '0 0 12px rgba(76,175,80,0.4)' }}>
                        {round?.question.imageUrl ? (
                            <img
                                src={round.question.imageUrl}
                                alt=""
                                className="w-14 h-14 rounded-xl object-cover bg-white"
                                onClick={() => {
                                    if (round?.question.audioTotoUrl) {
                                        try { new Audio(round.question.audioTotoUrl).play().catch(() => { }); } catch { }
                                    }
                                }}
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-xl font-bold text-green-800">?</div>
                        )}
                    </div>
                    {/* Score */}
                    <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full shrink-0">🪙 {score}</span>
                    {/* Progress dots */}
                    <div className="flex items-center gap-1 shrink-0">
                        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < correctCount ? 'bg-green-500' : i === currentRound ? 'bg-amber-400 animate-pulse' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div
                    className="flex-1 min-h-0 relative overflow-hidden"
                    onMouseDown={onPointerDown}
                    onMouseMove={onPointerMove}
                    onMouseUp={onPointerUp}
                    onMouseLeave={() => { aimingRef.current = false; powerRef.current = 0; }}
                    onTouchStart={onPointerDown}
                    onTouchMove={onPointerMove}
                    onTouchEnd={onPointerUp}
                >
                    <canvas ref={canvasRef} className="block absolute inset-0" style={{ touchAction: 'none' }} />
                </div>
            </div>
        </PlayGameShell>
    );
}
