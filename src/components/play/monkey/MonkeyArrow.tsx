import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ALL_WORDS, WordItem } from '@/data/wordData';
import { shuffle, generateOptions } from '@/lib/gameUtils';
import { Confetti } from '@/components/effects/Confetti';
import Mascot from '@/components/mascot/Mascot';

// ==========================================
// GAME CONSTANTS
// ==========================================
const TOTAL_ROUNDS = 8;
const GRAVITY = 0.35;
const ARROW_POWER = 0.18;
const TARGET_W = 80;
const TARGET_H = 34;

interface Target {
    x: number;
    y: number;
    word: WordItem;
    isCorrect: boolean;
    hit: boolean;
    wobble: number;
}

interface ArrowState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    active: boolean;
    trail: { x: number; y: number }[];
    hitTarget: number | null;
}

interface DragState {
    dragging: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
}

interface RoundData {
    question: WordItem;
    targets: Target[];
}

function getRounds(): RoundData[] {
    const usable = ALL_WORDS.filter(w => w.imageUrl && w.imageUrl.trim() !== '');
    const words = shuffle(usable).slice(0, TOTAL_ROUNDS);
    return words.map(w => {
        const options = generateOptions(w, usable, 4);
        // Place targets at right side, vertically spread
        const targets: Target[] = options.map((opt, i) => ({
            x: 280 + (i % 2) * 50,
            y: 80 + i * 80,
            word: opt,
            isCorrect: opt.id === w.id,
            hit: false,
            wobble: Math.random() * Math.PI * 2,
        }));
        return { question: w, targets };
    });
}

// ==========================================
// DRAWING FUNCTIONS
// ==========================================

function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#5DADE2');
    sky.addColorStop(0.4, '#85C1E9');
    sky.addColorStop(0.7, '#AED6F1');
    sky.addColorStop(1, '#A9DFBF');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    [[80, 35, 28], [220, 20, 22], [340, 45, 18]].forEach(([cx, cy, r]) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.5, cy - r * 0.25, r * 0.65, r * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawGround(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const gy = h * 0.82;
    // Grass
    const grd = ctx.createLinearGradient(0, gy, 0, h);
    grd.addColorStop(0, '#27AE60');
    grd.addColorStop(0.15, '#229954');
    grd.addColorStop(0.5, '#1E8449');
    grd.addColorStop(1, '#196F3D');
    ctx.fillStyle = grd;
    ctx.fillRect(0, gy, w, h - gy);

    // Grass tufts
    ctx.strokeStyle = '#2ECC71';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 20; i++) {
        const gx = (i * 22) % w;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx - 2, gy - 5);
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx + 3, gy - 7);
        ctx.stroke();
    }
}

function drawMonkey(ctx: CanvasRenderingContext2D, mx: number, my: number, frame: number, isDragging: boolean) {
    const bob = isDragging ? 0 : Math.sin(frame * 0.04) * 2;
    const y = my + bob;

    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(mx, my + 35, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail - long curled tail
    ctx.strokeStyle = '#7B5B3A';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(mx - 14, y + 15);
    ctx.bezierCurveTo(mx - 35, y + 5, mx - 40, y - 20, mx - 25, y - 30);
    ctx.stroke();
    ctx.strokeStyle = '#9B7B5B';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Feet
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.ellipse(mx - 10, y + 32, 6, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(mx + 10, y + 32, 6, 4, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    ctx.ellipse(mx, y + 12, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = '#EFEBE9';
    ctx.beginPath();
    ctx.ellipse(mx + 1, y + 15, 11, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left arm (holding bow)
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(mx + 16, y + 4);
    ctx.lineTo(mx + 32, y - 6);
    ctx.stroke();

    // Hand
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.arc(mx + 33, y - 7, 4, 0, Math.PI * 2);
    ctx.fill();

    // BOW - proper wooden bow
    ctx.save();
    ctx.translate(mx + 36, y - 6);

    // Bow limbs (wooden)
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 22, -0.75 * Math.PI, 0.75 * Math.PI);
    ctx.stroke();

    // Bow wood grain
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 22, -0.75 * Math.PI, 0.75 * Math.PI);
    ctx.stroke();

    // Bow tips (notches)
    const tipAngleTop = -0.75 * Math.PI;
    const tipAngleBot = 0.75 * Math.PI;
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.arc(22 * Math.cos(tipAngleTop), 22 * Math.sin(tipAngleTop), 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(22 * Math.cos(tipAngleBot), 22 * Math.sin(tipAngleBot), 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Bowstring
    ctx.strokeStyle = '#D7CCC8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const topX = 22 * Math.cos(tipAngleTop);
    const topY = 22 * Math.sin(tipAngleTop);
    const botX = 22 * Math.cos(tipAngleBot);
    const botY = 22 * Math.sin(tipAngleBot);
    if (isDragging) {
        // Pulled back bowstring
        ctx.moveTo(topX, topY);
        ctx.lineTo(-8, 0);
        ctx.lineTo(botX, botY);
    } else {
        ctx.moveTo(topX, topY);
        ctx.lineTo(botX, botY);
    }
    ctx.stroke();

    // Arrow nocked on bowstring when ready
    if (!isDragging) {
        // Arrow shaft
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(-6, -1.5, 26, 3);
        // Arrow head
        ctx.fillStyle = '#B71C1C';
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(16, -4);
        ctx.lineTo(16, 4);
        ctx.closePath();
        ctx.fill();
        // Fletching
        ctx.fillStyle = '#FF8F00';
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-12, -4);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-12, 4);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();

    // Right arm
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(mx - 16, y + 6);
    ctx.lineTo(mx - 24, y + 18);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    ctx.arc(mx, y - 14, 16, 0, Math.PI * 2);
    ctx.fill();

    // Face plate
    ctx.fillStyle = '#EFEBE9';
    ctx.beginPath();
    ctx.ellipse(mx + 1, y - 11, 11, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    [[-16, -18], [16, -18]].forEach(([ex, ey]) => {
        ctx.fillStyle = '#7B5B3A';
        ctx.beginPath();
        ctx.arc(mx + ex, y + ey, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFAB91';
        ctx.beginPath();
        ctx.arc(mx + ex, y + ey, 4.5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Eyes
    ctx.fillStyle = '#2C2C2C';
    ctx.beginPath();
    ctx.ellipse(mx - 5, y - 16, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(mx + 7, y - 16, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(mx - 4, y - 17.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(mx + 8, y - 17.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.ellipse(mx + 1, y - 11, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(mx + 1, y - 7, 5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.restore();
}

function drawTargets(ctx: CanvasRenderingContext2D, targets: Target[], frame: number) {
    for (const t of targets) {
        if (t.hit) continue;
        const wobbleY = Math.sin(frame * 0.025 + t.wobble) * 4;
        const tx = t.x;
        const ty = t.y + wobbleY;

        ctx.save();

        // Post
        ctx.fillStyle = '#795548';
        ctx.fillRect(tx + TARGET_W / 2 - 3, ty + TARGET_H / 2, 6, 30);

        // Board shadow
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        // Wooden board
        const boardGrd = ctx.createLinearGradient(tx, ty, tx, ty + TARGET_H);
        boardGrd.addColorStop(0, '#FFF8E1');
        boardGrd.addColorStop(0.5, '#FFF3E0');
        boardGrd.addColorStop(1, '#FFE0B2');
        ctx.fillStyle = boardGrd;
        ctx.beginPath();
        ctx.roundRect(tx, ty, TARGET_W, TARGET_H, 6);
        ctx.fill();

        // Board border
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(tx, ty, TARGET_W, TARGET_H, 6);
        ctx.stroke();

        // Inner border
        ctx.strokeStyle = '#A1887F';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tx + 3, ty + 3, TARGET_W - 6, TARGET_H - 6, 4);
        ctx.stroke();

        ctx.restore();

        // Word text
        ctx.fillStyle = '#3E2723';
        ctx.font = 'bold 14px Nunito, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.word.english, tx + TARGET_W / 2, ty + TARGET_H / 2);
    }
}

function drawTrajectory(ctx: CanvasRenderingContext2D, startX: number, startY: number, vx: number, vy: number) {
    ctx.save();
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    let px = startX, py = startY;
    let cvx = vx, cvy = vy;
    ctx.moveTo(px, py);

    for (let i = 0; i < 40; i++) {
        px += cvx;
        py += cvy;
        cvy += GRAVITY;
        if (py > 500) break;
        ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Crosshair at end
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px - 12, py);
    ctx.lineTo(px + 12, py);
    ctx.moveTo(px, py - 12);
    ctx.lineTo(px, py + 12);
    ctx.stroke();

    ctx.restore();
}

function drawArrow(ctx: CanvasRenderingContext2D, arrow: ArrowState) {
    if (!arrow.active && arrow.hitTarget === null) return;

    ctx.save();

    // Trail
    if (arrow.trail.length > 2) {
        ctx.strokeStyle = 'rgba(255, 152, 0, 0.25)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        arrow.trail.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Sparkle dots along trail
        ctx.fillStyle = 'rgba(255, 193, 7, 0.3)';
        arrow.trail.forEach((p, i) => {
            if (i % 3 === 0) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    // Arrow body
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.rotation);

    // Shaft
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(-20, -2, 32, 4);

    // Shaft wood grain
    ctx.fillStyle = '#A1887F';
    ctx.fillRect(-15, -1, 20, 2);

    // Arrow head (metal)
    ctx.fillStyle = '#B71C1C';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(6, -6);
    ctx.lineTo(8, 0);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fill();
    // Metallic shine
    ctx.fillStyle = '#EF5350';
    ctx.beginPath();
    ctx.moveTo(13, -1);
    ctx.lineTo(9, -4);
    ctx.lineTo(10, 0);
    ctx.closePath();
    ctx.fill();

    // Fletching feathers
    ctx.fillStyle = '#FF8F00';
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-24, -6);
    ctx.lineTo(-14, -1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FFB300';
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-24, 6);
    ctx.lineTo(-14, 1);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawHitEffect(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, correct: boolean) {
    const radius = Math.min(frame * 3, 30);
    const alpha = Math.max(1 - frame * 0.04, 0);

    ctx.save();
    ctx.globalAlpha = alpha;

    if (correct) {
        // Green burst
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Stars
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const sx = x + Math.cos(angle) * radius * 1.2;
            const sy = y + Math.sin(angle) * radius * 1.2;
            ctx.fillStyle = '#FFD700';
            ctx.font = `${12 + frame * 0.3}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('⭐', sx, sy);
        }
    } else {
        // Red X
        ctx.strokeStyle = '#F44336';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = `${16 + frame * 0.5}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('❌', x, y + 6);
    }

    ctx.restore();
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function MonkeyArrow() {
    const [phase, setPhase] = useState<'menu' | 'playing' | 'results'>('menu');
    const [rounds, setRounds] = useState<RoundData[]>([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const frameRef = useRef(0);
    const dims = useRef({ w: 400, h: 520 });

    // Game state refs
    const arrowRef = useRef<ArrowState | null>(null);
    const dragRef = useRef<DragState>({ dragging: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });
    const canShootRef = useRef(true);
    const hitEffectRef = useRef<{ x: number; y: number; frame: number; correct: boolean } | null>(null);
    const roundsRef = useRef<RoundData[]>([]);
    const currentRoundRef = useRef(0);

    const MONKEY_X = 60;
    const MONKEY_Y = dims.current.h * 0.65;
    const BOW_X = MONKEY_X + 36;
    const BOW_Y = MONKEY_Y - 6;

    const startGame = useCallback(() => {
        const r = getRounds();
        setRounds(r);
        roundsRef.current = r;
        setCurrentRound(0);
        currentRoundRef.current = 0;
        setScore(0);
        setCorrectCount(0);
        setShowConfetti(false);
        arrowRef.current = null;
        canShootRef.current = true;
        hitEffectRef.current = null;
        setPhase('playing');
    }, []);

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
        dragRef.current = { dragging: true, startX: coords.x, startY: coords.y, currentX: coords.x, currentY: coords.y };
    }, [getCanvasCoords]);

    const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!dragRef.current.dragging) return;
        e.preventDefault();
        const coords = getCanvasCoords(e);
        dragRef.current.currentX = coords.x;
        dragRef.current.currentY = coords.y;
    }, [getCanvasCoords]);

    const handlePointerUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!dragRef.current.dragging || !canShootRef.current) return;
        e.preventDefault();
        const drag = dragRef.current;
        drag.dragging = false;

        const dx = drag.startX - drag.currentX;
        const dy = drag.startY - drag.currentY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15) return; // Too small drag, ignore

        const power = Math.min(dist * ARROW_POWER, 16);
        const angle = Math.atan2(dy, dx);
        const vx = Math.cos(angle) * power * -1; // Reverse because drag is opposite
        const vy = Math.sin(angle) * power * -1;

        // Actually shoot toward drag direction (pull back = shoot forward)
        arrowRef.current = {
            x: BOW_X + 20,
            y: BOW_Y,
            vx: Math.abs(vx) < 1 ? 5 : vx > 0 ? vx : -vx,
            vy: vy,
            rotation: 0,
            active: true,
            trail: [],
            hitTarget: null,
        };
        canShootRef.current = false;
    }, [BOW_X, BOW_Y]);

    // Game loop
    useEffect(() => {
        if (phase !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        if (!parent) return;

        const w = parent.clientWidth || 400;
        const h = parent.clientHeight || 520;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        dims.current = { w, h };

        const monkeyY = h * 0.65;
        const bowX = MONKEY_X + 36;
        const bowY = monkeyY - 6;

        const loop = () => {
            if (!ctx) return;
            frameRef.current++;
            const f = frameRef.current;
            const rnd = roundsRef.current[currentRoundRef.current];
            if (!rnd) return;

            // Clear & draw background
            drawSky(ctx, w, h);
            drawGround(ctx, w, h);

            // Draw targets
            drawTargets(ctx, rnd.targets, f);

            // Draw trajectory preview while dragging
            const drag = dragRef.current;
            if (drag.dragging && canShootRef.current) {
                const dx = drag.startX - drag.currentX;
                const dy = drag.startY - drag.currentY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 15) {
                    const power = Math.min(dist * ARROW_POWER, 16);
                    const angle = Math.atan2(dy, dx);
                    const tvx = Math.cos(angle) * power * -1;
                    const tvy = Math.sin(angle) * power * -1;
                    const shootVx = Math.abs(tvx) < 1 ? 5 : tvx > 0 ? tvx : -tvx;
                    drawTrajectory(ctx, bowX + 20, bowY, shootVx, tvy);

                    // Draw pull-back line
                    ctx.save();
                    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    ctx.moveTo(drag.startX, drag.startY);
                    ctx.lineTo(drag.currentX, drag.currentY);
                    ctx.stroke();
                    ctx.restore();
                }
            }

            // Update & draw arrow
            const arrow = arrowRef.current;
            if (arrow && arrow.active) {
                arrow.x += arrow.vx;
                arrow.y += arrow.vy;
                arrow.vy += GRAVITY;
                arrow.rotation = Math.atan2(arrow.vy, arrow.vx);
                arrow.trail.push({ x: arrow.x, y: arrow.y });
                if (arrow.trail.length > 20) arrow.trail.shift();

                // Check collision with targets
                for (let i = 0; i < rnd.targets.length; i++) {
                    const t = rnd.targets[i];
                    if (t.hit) continue;
                    const wobbleY = Math.sin(f * 0.025 + t.wobble) * 4;
                    if (
                        arrow.x > t.x && arrow.x < t.x + TARGET_W &&
                        arrow.y > t.y + wobbleY - 5 && arrow.y < t.y + wobbleY + TARGET_H + 5
                    ) {
                        arrow.active = false;
                        arrow.hitTarget = i;
                        hitEffectRef.current = { x: t.x + TARGET_W / 2, y: t.y + TARGET_H / 2 + wobbleY, frame: 0, correct: t.isCorrect };

                        if (t.isCorrect) {
                            t.hit = true;
                            setScore(s => s + 100);
                            setCorrectCount(c => c + 1);
                            if (t.word.audioTotoUrl) {
                                try { new Audio(t.word.audioTotoUrl).play().catch(() => { }); } catch { }
                            }
                            setTimeout(() => {
                                hitEffectRef.current = null;
                                arrowRef.current = null;
                                if (currentRoundRef.current + 1 >= TOTAL_ROUNDS) {
                                    setShowConfetti(true);
                                    setPhase('results');
                                } else {
                                    currentRoundRef.current++;
                                    setCurrentRound(r => r + 1);
                                    canShootRef.current = true;
                                }
                            }, 1200);
                        } else {
                            setTimeout(() => {
                                hitEffectRef.current = null;
                                arrowRef.current = null;
                                canShootRef.current = true;
                            }, 800);
                        }
                        break;
                    }
                }

                // Off screen
                if (arrow.x > w + 30 || arrow.y > h + 30 || arrow.x < -30) {
                    arrowRef.current = null;
                    canShootRef.current = true;
                }
            }

            if (arrow) drawArrow(ctx, arrow);

            // Hit effect
            if (hitEffectRef.current) {
                hitEffectRef.current.frame++;
                drawHitEffect(ctx, hitEffectRef.current.x, hitEffectRef.current.y, hitEffectRef.current.frame, hitEffectRef.current.correct);
            }

            // Draw monkey on top
            drawMonkey(ctx, MONKEY_X, monkeyY, f, drag.dragging);

            // Aim indicator (drag instruction)
            if (canShootRef.current && !drag.dragging && !arrow) {
                ctx.save();
                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                ctx.font = '12px Nunito, system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('👆 Drag anywhere to aim & shoot!', w / 2, h * 0.82 + 20);
                ctx.restore();
            }

            animRef.current = requestAnimationFrame(loop);
        };

        animRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animRef.current);
    }, [phase, MONKEY_X]);

    // ==========================================
    // SCREENS
    // ==========================================
    if (phase === 'menu') {
        return (
            <PlayGameShell title="Monkey Arrow" icon="🐒" gradient="from-lime-400 to-emerald-500">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center">
                    <div className="text-7xl mb-4">🐒🏹</div>
                    <h2 className="text-xl font-extrabold text-gray-800 mt-2 mb-2">Monkey Arrow</h2>
                    <p className="text-sm text-gray-500 mb-2 max-w-xs">
                        Help the monkey archer hit the correct word target!
                    </p>
                    <div className="bg-lime-50 border border-lime-200 rounded-xl p-3 mb-6 text-xs text-lime-700 max-w-xs text-left">
                        <p className="font-semibold text-center mb-1">How to play:</p>
                        <p>• See the English word at the top</p>
                        <p>• <strong>Drag anywhere</strong> to aim — trajectory line shows where the arrow will go</p>
                        <p>• <strong>Release</strong> to shoot!</p>
                        <p>• Hit the matching word target</p>
                        <p>• {TOTAL_ROUNDS} rounds to master</p>
                    </div>
                    <button onClick={startGame} className="btn-game bg-gradient-to-r from-lime-500 to-emerald-600 text-white px-12 py-3 text-lg rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
                        Start Shooting! 🏹
                    </button>
                </div>
            </PlayGameShell>
        );
    }

    if (phase === 'results') {
        const percentage = Math.round((correctCount / TOTAL_ROUNDS) * 100);
        return (
            <PlayGameShell title="Monkey Arrow" icon="🐒" gradient="from-lime-400 to-emerald-500">
                <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
                    {showConfetti && <Confetti />}
                    <span className="text-6xl mb-3">{percentage >= 80 ? '🏆' : percentage >= 50 ? '⭐' : '💪'}</span>
                    <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
                        {percentage >= 80 ? 'Amazing Archery!' : percentage >= 50 ? 'Good Shots!' : 'Keep Practicing!'}
                    </h2>
                    <p className="text-gray-500 mb-4">You hit {correctCount} out of {TOTAL_ROUNDS} targets!</p>
                    <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <p className="text-2xl font-extrabold text-amber-500">{score}</p>
                                <p className="text-xs text-gray-500">Score</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-extrabold text-green-500">{correctCount}/{TOTAL_ROUNDS}</p>
                                <p className="text-xs text-gray-500">Hits</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-extrabold text-blue-500">{percentage}%</p>
                                <p className="text-xs text-gray-500">Accuracy</p>
                            </div>
                        </div>
                    </div>
                    <Mascot mood="happy" size="sm" message="Great archery skills! 🎯" className="mt-4" />
                    <div className="mt-5 flex gap-3">
                        <button onClick={startGame} className="btn-game bg-gradient-to-r from-lime-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg active:scale-95">
                            Play Again 🔄
                        </button>
                        <button onClick={() => window.history.back()} className="btn-game bg-white text-gray-700 border-2 border-gray-200 px-6 py-3 rounded-xl font-bold active:scale-95">
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
        <PlayGameShell title="Monkey Arrow" icon="🐒" gradient="from-lime-400 to-emerald-500">
            <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
                {/* Question bar */}
                <div className="flex items-center justify-between px-3 py-2 bg-white/80 backdrop-blur-sm shrink-0 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">🪙 {score}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5">
                        {round?.question.imageUrl && (
                            <img src={round.question.imageUrl} alt="" className="w-6 h-6 rounded object-cover" />
                        )}
                        <span className="text-sm font-bold text-blue-800">Find: {round?.question.english}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < correctCount ? 'bg-emerald-500' : i === currentRound ? 'bg-amber-400 animate-pulse' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div
                    className="flex-1 relative overflow-hidden"
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                >
                    <canvas ref={canvasRef} className="block absolute inset-0 cursor-crosshair" style={{ touchAction: 'none' }} />
                </div>
            </div>
        </PlayGameShell>
    );
}
