import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ALL_WORDS, WordItem } from '@/data/wordData';
import { shuffle, generateOptions } from '@/lib/gameUtils';
import { Confetti } from '@/components/effects/Confetti';
import Mascot from '@/components/mascot/Mascot';
import GameTutorial, { useTutorial } from '@/components/play/GameTutorial';
import { useGameSFX } from '@/hooks/useGameSFX';

// ==========================================
// GAME CONSTANTS
// ==========================================
const TOTAL_ROUNDS = 8;
const GRAVITY = 0.25;
const ARROW_SPEED = 18;
const TARGET_SIZE = 70;

const TUTORIAL_STEPS = [
    { emoji: '🏹', title: 'Forest Archer!', description: 'You are an archer in the forest. Shoot arrows at word targets!' },
    { emoji: '🎯', title: 'Find the Target', description: 'Look for the wooden sign with the correct Toto word matching the English word shown.' },
    { emoji: '👆', title: 'Aim & Shoot', description: 'Tap and drag to aim. The dotted line shows your arrow path. Release to shoot!' },
    { emoji: '🌲', title: 'Hit the Right One', description: 'Only one target has the correct answer. Hit it to score points!' },
    { emoji: '⭐', title: 'Master the Forest', description: 'Complete all rounds to become a Forest Archer Master!' },
];

interface Target {
    x: number;
    y: number;
    word: WordItem;
    isCorrect: boolean;
    hit: boolean;
    scale: number;
    speed: number;
}

interface ArrowState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    active: boolean;
    trail: { x: number; y: number; alpha: number }[];
}

interface AimState {
    aiming: boolean;
    angle: number;
    power: number;
    startY: number;
}

interface RoundData {
    question: WordItem;
    options: WordItem[];
}

// Pre-generate tree positions for consistent forest
const TREES: { x: number; y: number; scale: number; layer: number }[] = [];
for (let i = 0; i < 12; i++) {
    TREES.push({
        x: Math.random() * 100,
        y: 30 + Math.random() * 25,
        scale: 0.4 + Math.random() * 0.3,
        layer: 0
    });
}
for (let i = 0; i < 8; i++) {
    TREES.push({
        x: Math.random() * 100,
        y: 50 + Math.random() * 20,
        scale: 0.6 + Math.random() * 0.4,
        layer: 1
    });
}

function getRounds(): RoundData[] {
    const usable = ALL_WORDS.filter(w => w.imageUrl && w.imageUrl.trim() !== '');
    const words = shuffle(usable).slice(0, TOTAL_ROUNDS);
    return words.map(w => ({
        question: w,
        options: generateOptions(w, usable, 3)
    }));
}

// ==========================================
// DRAWING FUNCTIONS
// ==========================================

function drawForestBackground(ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) {
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    sky.addColorStop(0, '#87CEEB');
    sky.addColorStop(0.3, '#98D8C8');
    sky.addColorStop(0.6, '#7CB342');
    sky.addColorStop(1, '#558B2F');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Sun
    const sunGlow = ctx.createRadialGradient(w * 0.85, h * 0.12, 0, w * 0.85, h * 0.12, 60);
    sunGlow.addColorStop(0, 'rgba(255, 244, 157, 1)');
    sunGlow.addColorStop(0.3, 'rgba(255, 236, 117, 0.8)');
    sunGlow.addColorStop(0.7, 'rgba(255, 241, 118, 0.2)');
    sunGlow.addColorStop(1, 'rgba(255, 241, 118, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(w * 0.6, 0, w * 0.4, h * 0.3);

    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(w * 0.85, h * 0.12, 25, 0, Math.PI * 2);
    ctx.fill();

    // Distant mountains
    ctx.fillStyle = '#81C784';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.35);
    ctx.lineTo(w * 0.15, h * 0.22);
    ctx.lineTo(w * 0.3, h * 0.32);
    ctx.lineTo(w * 0.5, h * 0.18);
    ctx.lineTo(w * 0.7, h * 0.28);
    ctx.lineTo(w * 0.85, h * 0.2);
    ctx.lineTo(w, h * 0.3);
    ctx.lineTo(w, h * 0.4);
    ctx.lineTo(0, h * 0.4);
    ctx.closePath();
    ctx.fill();

    // Draw back layer trees
    TREES.filter(t => t.layer === 0).forEach(tree => {
        drawTree(ctx, (tree.x / 100) * w, (tree.y / 100) * h, tree.scale * 80, frame, 0.6);
    });

    // Mid forest layer
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.45);
    for (let i = 0; i <= w; i += 30) {
        ctx.lineTo(i, h * 0.42 + Math.sin(i * 0.02 + frame * 0.01) * 5);
    }
    ctx.lineTo(w, h * 0.55);
    ctx.lineTo(0, h * 0.55);
    ctx.closePath();
    ctx.fill();

    // Draw front layer trees
    TREES.filter(t => t.layer === 1).forEach(tree => {
        drawTree(ctx, (tree.x / 100) * w, (tree.y / 100) * h, tree.scale * 100, frame, 1);
    });

    // Ground
    const ground = ctx.createLinearGradient(0, h * 0.7, 0, h);
    ground.addColorStop(0, '#33691E');
    ground.addColorStop(0.3, '#2E7D32');
    ground.addColorStop(1, '#1B5E20');
    ctx.fillStyle = ground;
    ctx.fillRect(0, h * 0.7, w, h * 0.3);

    // Grass blades at bottom
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    for (let i = 0; i < w; i += 15) {
        const sway = Math.sin(frame * 0.03 + i * 0.1) * 3;
        ctx.beginPath();
        ctx.moveTo(i, h * 0.7);
        ctx.quadraticCurveTo(i + sway, h * 0.7 - 15, i + sway * 1.5, h * 0.7 - 25);
        ctx.stroke();
    }

    // Foreground grass tufts
    ctx.fillStyle = '#388E3C';
    for (let i = 0; i < w; i += 40) {
        const sway = Math.sin(frame * 0.02 + i * 0.05) * 2;
        ctx.beginPath();
        ctx.moveTo(i, h * 0.7);
        ctx.quadraticCurveTo(i + 10 + sway, h * 0.7 - 20, i + 5, h * 0.7);
        ctx.quadraticCurveTo(i + 15 + sway, h * 0.7 - 25, i + 12, h * 0.7);
        ctx.quadraticCurveTo(i + 22 + sway, h * 0.7 - 18, i + 20, h * 0.7);
        ctx.closePath();
        ctx.fill();
    }
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, frame: number, alpha: number) {
    ctx.save();
    ctx.globalAlpha = alpha;

    const sway = Math.sin(frame * 0.015 + x * 0.01) * 2;

    // Trunk
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x - size * 0.08, y, size * 0.16, size * 0.5);

    // Foliage layers
    const colors = ['#2E7D32', '#388E3C', '#43A047'];
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        const layerY = y - size * 0.2 * i;
        const layerSize = size * (0.5 - i * 0.1);
        ctx.moveTo(x + sway, layerY - layerSize);
        ctx.lineTo(x - layerSize * 0.8 + sway * 0.5, layerY);
        ctx.lineTo(x + layerSize * 0.8 + sway * 0.5, layerY);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}

function drawTarget(ctx: CanvasRenderingContext2D, target: Target, frame: number) {
    if (target.hit) return;

    const { x, y, word, scale } = target;
    const size = TARGET_SIZE * scale;
    const wobble = Math.sin(frame * 0.05 + x * 0.01) * 3;

    ctx.save();
    ctx.translate(x, y + wobble);

    // Wooden post
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(-4, 0, 8, size * 0.6);

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;

    // Main board
    const boardGrad = ctx.createLinearGradient(-size * 0.6, -size * 0.4, size * 0.6, size * 0.4);
    boardGrad.addColorStop(0, '#FFF8E1');
    boardGrad.addColorStop(0.5, '#FFECB3');
    boardGrad.addColorStop(1, '#FFE082');
    ctx.fillStyle = boardGrad;
    ctx.beginPath();
    ctx.roundRect(-size * 0.6, -size * 0.5, size * 1.2, size * 0.8, 8);
    ctx.fill();

    // Board border
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-size * 0.6, -size * 0.5, size * 1.2, size * 0.8, 8);
    ctx.stroke();

    // Corner decorations
    ctx.fillStyle = '#A1887F';
    [[-size * 0.5, -size * 0.4], [size * 0.5, -size * 0.4], [-size * 0.5, size * 0.2], [size * 0.5, size * 0.2]].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Word text
    ctx.fillStyle = '#3E2723';
    ctx.font = `bold ${Math.round(size * 0.22)}px Nunito, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(word.toto || word.english, 0, -size * 0.1);

    // English subtitle (smaller)
    if (word.toto && word.toto !== word.english) {
        ctx.fillStyle = '#6D4C41';
        ctx.font = `${Math.round(size * 0.14)}px Nunito, system-ui, sans-serif`;
        ctx.fillText(`(${word.english})`, 0, size * 0.15);
    }

    ctx.restore();
}

function drawBowAndHands(ctx: CanvasRenderingContext2D, w: number, h: number, aim: AimState, frame: number) {
    ctx.save();

    const bowX = w * 0.15;
    const bowY = h * 0.85;
    const bowSize = Math.min(w, h) * 0.25;

    // Left hand (holding bow)
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.ellipse(bowX - bowSize * 0.15, bowY - bowSize * 0.1, 18, 22, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Fingers wrapped around bow
    ctx.fillStyle = '#FFB74D';
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(bowX - bowSize * 0.05, bowY - bowSize * 0.2 + i * 12, 6, 10, 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Bow
    ctx.save();
    ctx.translate(bowX, bowY - bowSize * 0.3);
    ctx.rotate(-0.1);

    // Bow wood
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, bowSize * 0.4, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    // Bow detail
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, bowSize * 0.4, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    // Bow tips
    ctx.fillStyle = '#3E2723';
    const topAngle = -Math.PI * 0.4;
    const botAngle = Math.PI * 0.4;
    ctx.beginPath();
    ctx.arc(Math.cos(topAngle) * bowSize * 0.4, Math.sin(topAngle) * bowSize * 0.4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(Math.cos(botAngle) * bowSize * 0.4, Math.sin(botAngle) * bowSize * 0.4, 5, 0, Math.PI * 2);
    ctx.fill();

    // Bowstring
    const stringTopX = Math.cos(topAngle) * bowSize * 0.4;
    const stringTopY = Math.sin(topAngle) * bowSize * 0.4;
    const stringBotX = Math.cos(botAngle) * bowSize * 0.4;
    const stringBotY = Math.sin(botAngle) * bowSize * 0.4;

    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (aim.aiming) {
        const pullBack = aim.power * 0.3;
        ctx.moveTo(stringTopX, stringTopY);
        ctx.lineTo(-pullBack, 0);
        ctx.lineTo(stringBotX, stringBotY);
    } else {
        ctx.moveTo(stringTopX, stringTopY);
        ctx.lineTo(stringBotX, stringBotY);
    }
    ctx.stroke();

    // Arrow on bow
    if (!aim.aiming) {
        // Resting arrow
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(0, -2, bowSize * 0.5, 4);
        ctx.fillStyle = '#C62828';
        ctx.beginPath();
        ctx.moveTo(bowSize * 0.5, 0);
        ctx.lineTo(bowSize * 0.42, -6);
        ctx.lineTo(bowSize * 0.42, 6);
        ctx.closePath();
        ctx.fill();
    } else {
        // Drawn arrow
        const pullBack = aim.power * 0.3;
        ctx.save();
        ctx.translate(-pullBack, 0);
        ctx.rotate(aim.angle);

        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(-5, -2, bowSize * 0.5, 4);
        ctx.fillStyle = '#C62828';
        ctx.beginPath();
        ctx.moveTo(bowSize * 0.45, 0);
        ctx.lineTo(bowSize * 0.37, -6);
        ctx.lineTo(bowSize * 0.37, 6);
        ctx.closePath();
        ctx.fill();
        // Fletching
        ctx.fillStyle = '#FF6F00';
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(-15, -8);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-15, 8);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    ctx.restore();

    // Right hand (pulling string)
    if (aim.aiming) {
        const pullBack = aim.power * 0.3;
        ctx.fillStyle = '#FFCC80';
        ctx.beginPath();
        ctx.ellipse(bowX - pullBack - 10, bowY - bowSize * 0.3, 15, 18, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Fingers on string
        ctx.fillStyle = '#FFB74D';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(bowX - pullBack - 5, bowY - bowSize * 0.35 + i * 10, 5, 8, 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}

function drawTrajectory(ctx: CanvasRenderingContext2D, startX: number, startY: number, angle: number, power: number) {
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();

    const vx = Math.cos(angle) * power * 0.3;
    const vy = Math.sin(angle) * power * 0.3;

    let px = startX, py = startY;
    let cvx = vx, cvy = vy;
    ctx.moveTo(px, py);

    for (let i = 0; i < 50; i++) {
        px += cvx;
        py += cvy;
        cvy += GRAVITY * 0.5;
        if (py > startY + 100 || px > startX + 400) break;
        ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Crosshair at end
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
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

function drawArrow(ctx: CanvasRenderingContext2D, arrow: ArrowState) {
    if (!arrow.active) return;

    ctx.save();

    // Motion blur trail
    arrow.trail.forEach((point, i) => {
        ctx.fillStyle = `rgba(255, 152, 0, ${point.alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3 - i * 0.2, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.rotation);

    // Arrow shaft
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(-25, -2.5, 40, 5);
    ctx.fillStyle = '#A1887F';
    ctx.fillRect(-20, -1.5, 30, 3);

    // Arrow head
    ctx.fillStyle = '#B71C1C';
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(8, -8);
    ctx.lineTo(10, 0);
    ctx.lineTo(8, 8);
    ctx.closePath();
    ctx.fill();

    // Shine on arrow head
    ctx.fillStyle = '#EF5350';
    ctx.beginPath();
    ctx.moveTo(16, -2);
    ctx.lineTo(11, -5);
    ctx.lineTo(12, -1);
    ctx.closePath();
    ctx.fill();

    // Fletching
    ctx.fillStyle = '#FF6F00';
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-32, -10);
    ctx.lineTo(-18, -2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-32, 10);
    ctx.lineTo(-18, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawHitEffect(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, correct: boolean) {
    const progress = Math.min(frame / 30, 1);
    const radius = progress * 50;
    const alpha = 1 - progress;

    ctx.save();
    ctx.globalAlpha = alpha;

    if (correct) {
        // Green burst
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Stars
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + frame * 0.1;
            const dist = radius * 1.3;
            ctx.fillStyle = '#FFD700';
            ctx.font = `${20 + frame * 0.5}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('✨', x + Math.cos(angle) * dist, y + Math.sin(angle) * dist);
        }

        // "+100" text
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 28px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+100', x, y - radius - 20);
    } else {
        // Red X
        ctx.strokeStyle = '#F44336';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = `${30 + frame}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('❌', x, y + 10);
    }

    ctx.restore();
}

function drawPowerBar(ctx: CanvasRenderingContext2D, x: number, y: number, power: number, maxPower: number) {
    const barW = 120, barH = 16;
    const fill = Math.min(power / maxPower, 1);

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(x - barW / 2, y, barW, barH, 8);
    ctx.fill();

    // Fill gradient
    const gradient = ctx.createLinearGradient(x - barW / 2, y, x + barW / 2, y);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(0.5, '#FFEB3B');
    gradient.addColorStop(1, '#F44336');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x - barW / 2 + 2, y + 2, (barW - 4) * fill, barH - 4, 6);
    ctx.fill();

    // Label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('POWER', x, y - 6);
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function MonkeyArrow() {
    const sfx = useGameSFX();
    const tutorial = useTutorial('forest-archer');
    const [phase, setPhase] = useState<'menu' | 'tutorial' | 'playing' | 'results'>('menu');
    const [rounds, setRounds] = useState<RoundData[]>([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const frameRef = useRef(0);
    const dims = useRef({ w: 400, h: 600 });

    const arrowRef = useRef<ArrowState | null>(null);
    const aimRef = useRef<AimState>({ aiming: false, angle: -0.3, power: 0, startY: 0 });
    const targetsRef = useRef<Target[]>([]);
    const canShootRef = useRef(true);
    const hitEffectRef = useRef<{ x: number; y: number; frame: number; correct: boolean } | null>(null);
    const roundsRef = useRef<RoundData[]>([]);
    const currentRoundRef = useRef(0);

    const spawnTargets = useCallback((roundData: RoundData, w: number, h: number) => {
        const targets: Target[] = roundData.options.map((opt, i) => ({
            x: w + 50 + i * 150,
            y: h * 0.25 + (i % 2) * h * 0.25 + Math.random() * h * 0.1,
            word: opt,
            isCorrect: opt.id === roundData.question.id,
            hit: false,
            scale: 0.9 + Math.random() * 0.3,
            speed: 0.8 + Math.random() * 0.4
        }));
        targetsRef.current = targets;
    }, []);

    const startGame = useCallback(() => {
        if (tutorial.shouldShow) {
            setPhase('tutorial');
            return;
        }
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
        sfx.startBGM();
    }, [tutorial.shouldShow, sfx]);

    const handleTutorialDone = useCallback(() => {
        tutorial.markSeen();
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
        sfx.startBGM();
    }, [tutorial, sfx]);

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
        aimRef.current = { aiming: true, angle: -0.3, power: 0, startY: coords.y };
    }, [getCanvasCoords]);

    const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!aimRef.current.aiming) return;
        e.preventDefault();
        const coords = getCanvasCoords(e);
        const h = dims.current.h;

        // Calculate angle based on vertical position (higher = more upward)
        const centerY = h * 0.5;
        const deltaY = centerY - coords.y;
        aimRef.current.angle = Math.max(-0.8, Math.min(0.5, deltaY / (h * 0.5)));

        // Power based on horizontal drag or time held
        const dragDist = Math.abs(coords.y - aimRef.current.startY);
        aimRef.current.power = Math.min(dragDist * 0.8, 80);
    }, [getCanvasCoords]);

    const handlePointerUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!aimRef.current.aiming || !canShootRef.current) return;
        e.preventDefault();

        const aim = aimRef.current;
        if (aim.power < 20) {
            aim.aiming = false;
            return;
        }

        aim.aiming = false;
        canShootRef.current = false;

        const { w, h } = dims.current;
        const startX = w * 0.2;
        const startY = h * 0.55;

        const speed = (aim.power / 80) * ARROW_SPEED;
        sfx.playShoot();

        arrowRef.current = {
            x: startX,
            y: startY,
            vx: Math.cos(aim.angle) * speed,
            vy: Math.sin(aim.angle) * speed,
            rotation: aim.angle,
            active: true,
            trail: []
        };
    }, [sfx]);

    // Game loop
    useEffect(() => {
        if (phase !== 'playing') return;

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

        // Spawn initial targets
        if (roundsRef.current[currentRoundRef.current]) {
            spawnTargets(roundsRef.current[currentRoundRef.current], w, h);
        }

        const loop = () => {
            if (!ctx) return;
            frameRef.current++;
            const f = frameRef.current;
            const rnd = roundsRef.current[currentRoundRef.current];
            if (!rnd) return;

            // Draw scene
            drawForestBackground(ctx, w, h, f);

            // Update & draw targets (moving left)
            const targets = targetsRef.current;
            targets.forEach(t => {
                if (!t.hit) {
                    t.x -= t.speed;
                    // Respawn if off screen
                    if (t.x < -100) {
                        t.x = w + 100 + Math.random() * 100;
                        t.y = h * 0.2 + Math.random() * h * 0.35;
                    }
                }
                drawTarget(ctx, t, f);
            });

            // Update & draw arrow
            const arrow = arrowRef.current;
            if (arrow && arrow.active) {
                arrow.x += arrow.vx;
                arrow.y += arrow.vy;
                arrow.vy += GRAVITY;
                arrow.rotation = Math.atan2(arrow.vy, arrow.vx);

                // Trail
                arrow.trail.unshift({ x: arrow.x, y: arrow.y, alpha: 1 });
                if (arrow.trail.length > 15) arrow.trail.pop();
                arrow.trail.forEach((p, i) => { p.alpha = 1 - i / 15; });

                // Check collision
                for (const t of targets) {
                    if (t.hit) continue;
                    const targetCenterX = t.x;
                    const targetCenterY = t.y;
                    const hitRadius = TARGET_SIZE * t.scale * 0.5;

                    const dx = arrow.x - targetCenterX;
                    const dy = arrow.y - targetCenterY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < hitRadius) {
                        arrow.active = false;
                        t.hit = true;
                        hitEffectRef.current = { x: t.x, y: t.y, frame: 0, correct: t.isCorrect };

                        if (t.isCorrect) {
                            sfx.playHit();
                            sfx.playCorrect();
                            setScore(s => s + 100);
                            setCorrectCount(c => c + 1);

                            setTimeout(() => {
                                hitEffectRef.current = null;
                                arrowRef.current = null;
                                if (currentRoundRef.current + 1 >= TOTAL_ROUNDS) {
                                    setShowConfetti(true);
                                    sfx.playVictory();
                                    sfx.stopBGM();
                                    setPhase('results');
                                } else {
                                    currentRoundRef.current++;
                                    setCurrentRound(r => r + 1);
                                    spawnTargets(roundsRef.current[currentRoundRef.current], w, h);
                                    canShootRef.current = true;
                                }
                            }, 1000);
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
                if (arrow.x > w + 50 || arrow.y > h + 50 || arrow.x < -50 || arrow.y < -50) {
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

            // Draw bow and hands
            const aim = aimRef.current;
            drawBowAndHands(ctx, w, h, aim, f);

            // Trajectory preview
            if (aim.aiming && aim.power >= 20) {
                const startX = w * 0.2;
                const startY = h * 0.55;
                drawTrajectory(ctx, startX, startY, aim.angle, aim.power);
                drawPowerBar(ctx, w * 0.5, h * 0.92, aim.power, 80);
            }

            // Instructions
            if (canShootRef.current && !aim.aiming && !arrow) {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.beginPath();
                ctx.roundRect(w * 0.25, h * 0.88, w * 0.5, 36, 18);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = 'bold 13px Nunito, system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('👆 Touch & drag up to aim, release to shoot!', w / 2, h * 0.9 + 8);
                ctx.restore();
            }

            animRef.current = requestAnimationFrame(loop);
        };

        animRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animRef.current);
    }, [phase, spawnTargets, sfx]);

    // Cleanup
    useEffect(() => () => { sfx.stopBGM(); }, [sfx]);

    // ==========================================
    // SCREENS
    // ==========================================
    if (phase === 'tutorial') {
        return (
            <PlayGameShell title="Forest Archer" icon="🏹" gradient="from-green-500 to-emerald-600">
                <GameTutorial gameId="forest-archer" steps={TUTORIAL_STEPS} onComplete={handleTutorialDone} />
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
                        You are an archer in the magical forest. Hit targets with the correct Toto words!
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-xs text-green-700 max-w-xs text-left">
                        <p className="font-semibold text-center mb-1">How to play:</p>
                        <p>• See the English word you need to find</p>
                        <p>• <strong>Touch and drag up/down</strong> to aim your bow</p>
                        <p>• <strong>Release</strong> to shoot the arrow</p>
                        <p>• Hit the target with the matching Toto word</p>
                        <p>• Complete {TOTAL_ROUNDS} rounds to win!</p>
                    </div>
                    <button onClick={() => { sfx.playClick(); startGame(); }} className="btn-game bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-3 text-lg rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
                        Enter Forest 🌲
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
                    <Mascot mood="happy" size="sm" message="Amazing forest skills! 🎯" className="mt-4" />
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
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">🪙 {score}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
                        {round?.question.imageUrl && (
                            <img src={round.question.imageUrl} alt="" className="w-7 h-7 rounded object-cover" />
                        )}
                        <div className="text-left">
                            <span className="text-xs text-green-600">Find:</span>
                            <span className="text-sm font-bold text-green-800 ml-1">{round?.question.english}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i < correctCount ? 'bg-green-500' : i === currentRound ? 'bg-amber-400 animate-pulse' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div
                    className="flex-1 relative overflow-hidden"
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
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
