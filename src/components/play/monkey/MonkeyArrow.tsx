import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Confetti } from '@/components/effects/Confetti';
import Mascot from '@/components/mascot/Mascot';
import { useTutorial } from '@/components/play/GameTutorial';
import { useGameSFX } from '@/hooks/useGameSFX';
import { fetchWords } from '@/lib/supabaseQueries';
import { transformWordRowToWordItem } from '@/lib/dataTransformers';
import { WordItem } from '@/types/content';
import { Loader2 } from 'lucide-react';

// ==========================================
// GAME CONSTANTS
// ==========================================
const TOTAL_ROUNDS = 8;
const GRAVITY = 0.4;
const ARROW_SPEED = 18;
const BOW_SIZE = 80;

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
    stuck: boolean;
    trail: { x: number; y: number }[];
}

interface Bird {
    x: number;
    y: number;
    vx: number;
    wingPhase: number;
    size: number;
}

interface Butterfly {
    x: number;
    y: number;
    phase: number;
    color: string;
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

function generateOptions(correct: WordItem, allWords: WordItem[], count: number): WordItem[] {
    const others = allWords.filter(w => w.id !== correct.id);
    const shuffled = shuffle(others).slice(0, count - 1);
    return shuffle([correct, ...shuffled]);
}

// ==========================================
// FOREST ENVIRONMENT
// ==========================================
const TREE_CONFIGS = [
    { x: 0.02, y: 0.45, scale: 1.2, layer: 0 },
    { x: 0.12, y: 0.42, scale: 0.9, layer: 0 },
    { x: 0.88, y: 0.40, scale: 1.1, layer: 0 },
    { x: 0.95, y: 0.44, scale: 0.8, layer: 0 },
    { x: 0.05, y: 0.55, scale: 1.4, layer: 1 },
    { x: 0.92, y: 0.52, scale: 1.3, layer: 1 },
];

const BUSH_CONFIGS = [
    { x: 0.15, y: 0.68 },
    { x: 0.25, y: 0.70 },
    { x: 0.75, y: 0.69 },
    { x: 0.85, y: 0.71 },
];

// ==========================================
// DRAWING FUNCTIONS
// ==========================================

function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) {
    // Sky gradient - warm forest morning
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    sky.addColorStop(0, '#87CEEB');
    sky.addColorStop(0.3, '#B4E7CE');
    sky.addColorStop(0.6, '#90C695');
    sky.addColorStop(1, '#5D8A66');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Sun with rays
    const sunX = w * 0.85;
    const sunY = h * 0.12;

    // Sun glow
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 80);
    sunGlow.addColorStop(0, 'rgba(255, 244, 130, 1)');
    sunGlow.addColorStop(0.3, 'rgba(255, 236, 100, 0.6)');
    sunGlow.addColorStop(0.7, 'rgba(255, 200, 50, 0.2)');
    sunGlow.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(sunX - 100, sunY - 100, 200, 200);

    // Sun rays
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(frame * 0.003);
    for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.fillStyle = 'rgba(255, 244, 130, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-8, -70);
        ctx.lineTo(8, -70);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();

    // Sun disc
    ctx.fillStyle = '#FFE082';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(sunX - 5, sunY - 5, 18, 0, Math.PI * 2);
    ctx.fill();

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const clouds = [
        { x: 0.15, y: 0.08, s: 1 },
        { x: 0.4, y: 0.12, s: 0.8 },
        { x: 0.65, y: 0.06, s: 0.9 },
    ];
    clouds.forEach(c => {
        const cx = (c.x * w + frame * 0.1) % (w + 100) - 50;
        const cy = c.y * h;
        const s = c.s * 30;
        ctx.beginPath();
        ctx.ellipse(cx, cy, s * 1.5, s * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx - s, cy + 5, s, s * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + s * 0.8, cy + 3, s * 0.8, s * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawMountains(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Distant mountains
    ctx.fillStyle = '#6B8E7B';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.35);
    ctx.lineTo(w * 0.15, h * 0.22);
    ctx.lineTo(w * 0.3, h * 0.30);
    ctx.lineTo(w * 0.45, h * 0.18);
    ctx.lineTo(w * 0.6, h * 0.28);
    ctx.lineTo(w * 0.75, h * 0.20);
    ctx.lineTo(w * 0.9, h * 0.26);
    ctx.lineTo(w, h * 0.32);
    ctx.lineTo(w, h * 0.45);
    ctx.lineTo(0, h * 0.45);
    ctx.closePath();
    ctx.fill();

    // Closer hills
    ctx.fillStyle = '#5D8A66';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.42);
    ctx.quadraticCurveTo(w * 0.2, h * 0.35, w * 0.4, h * 0.40);
    ctx.quadraticCurveTo(w * 0.6, h * 0.45, w * 0.8, h * 0.38);
    ctx.quadraticCurveTo(w * 0.9, h * 0.35, w, h * 0.42);
    ctx.lineTo(w, h * 0.5);
    ctx.lineTo(0, h * 0.5);
    ctx.closePath();
    ctx.fill();
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, frame: number) {
    const sway = Math.sin(frame * 0.015 + x * 0.01) * 3 * scale;

    ctx.save();
    ctx.translate(x, y);

    // Trunk
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.moveTo(-8 * scale, 0);
    ctx.lineTo(-12 * scale, 80 * scale);
    ctx.lineTo(12 * scale, 80 * scale);
    ctx.lineTo(8 * scale, 0);
    ctx.closePath();
    ctx.fill();

    // Trunk detail
    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-2 * scale, 10 * scale);
    ctx.lineTo(-3 * scale, 60 * scale);
    ctx.moveTo(4 * scale, 20 * scale);
    ctx.lineTo(5 * scale, 70 * scale);
    ctx.stroke();

    // Foliage layers
    const foliageColors = ['#2E7D32', '#388E3C', '#43A047', '#4CAF50'];
    for (let i = 0; i < 4; i++) {
        ctx.fillStyle = foliageColors[i];
        const layerY = -20 * scale - i * 25 * scale;
        const layerWidth = (55 - i * 8) * scale;
        const layerSway = sway * (1 - i * 0.2);

        ctx.beginPath();
        ctx.moveTo(layerSway, layerY - 30 * scale);
        ctx.quadraticCurveTo(-layerWidth + layerSway, layerY, -layerWidth * 0.7 + layerSway, layerY + 15 * scale);
        ctx.lineTo(layerWidth * 0.7 + layerSway, layerY + 15 * scale);
        ctx.quadraticCurveTo(layerWidth + layerSway, layerY, layerSway, layerY - 30 * scale);
        ctx.fill();
    }

    ctx.restore();
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
    const sway = Math.sin(frame * 0.02 + x) * 2;

    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.ellipse(x + sway, y, 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.ellipse(x - 15 + sway * 0.5, y + 5, 20, 15, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 18 + sway * 0.5, y + 3, 18, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Berries
    ctx.fillStyle = '#E53935';
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(x - 10 + i * 12 + sway, y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawHoneycomb(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
    // Beehive on tree
    ctx.fillStyle = '#FFB300';
    ctx.beginPath();
    ctx.ellipse(x, y, 25, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Honeycomb pattern
    ctx.fillStyle = '#FF8F00';
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
            const hx = x - 10 + col * 15 + (row % 2) * 7;
            const hy = y - 15 + row * 12;
            drawHexagon(ctx, hx, hy, 6);
        }
    }

    // Dripping honey
    const dripY = y + 35 + Math.sin(frame * 0.05) * 5;
    ctx.fillStyle = '#FFCA28';
    ctx.beginPath();
    ctx.ellipse(x, dripY, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bees
    for (let i = 0; i < 2; i++) {
        const beeX = x + Math.sin(frame * 0.08 + i * 2) * 30;
        const beeY = y - 20 + Math.cos(frame * 0.1 + i * 3) * 15;
        drawBee(ctx, beeX, beeY, frame);
    }
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
}

function drawBee(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
    // Body
    ctx.fillStyle = '#FFC107';
    ctx.beginPath();
    ctx.ellipse(x, y, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stripes
    ctx.fillStyle = '#212121';
    ctx.fillRect(x - 2, y - 4, 2, 8);
    ctx.fillRect(x + 2, y - 4, 2, 8);

    // Wings
    const wingFlap = Math.sin(frame * 0.5) * 0.3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(x - 2, y - 5, 4, 3, wingFlap, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 2, y - 5, 4, 3, -wingFlap, 0, Math.PI * 2);
    ctx.fill();
}

function drawBird(ctx: CanvasRenderingContext2D, bird: Bird, frame: number) {
    const wingAngle = Math.sin(frame * 0.15 + bird.wingPhase) * 0.5;

    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.scale(bird.size, bird.size);

    // Body
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#4E342E';
    ctx.beginPath();
    ctx.arc(8, -2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.moveTo(12, -2);
    ctx.lineTo(16, -1);
    ctx.lineTo(12, 0);
    ctx.closePath();
    ctx.fill();

    // Wings
    ctx.fillStyle = '#6D4C41';
    ctx.save();
    ctx.rotate(wingAngle);
    ctx.beginPath();
    ctx.ellipse(-2, -3, 10, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Tail
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(-15, -3);
    ctx.lineTo(-15, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawButterfly(ctx: CanvasRenderingContext2D, bf: Butterfly, frame: number) {
    const wingFlap = Math.sin(frame * 0.2 + bf.phase) * 0.4;
    const floatY = Math.sin(frame * 0.03 + bf.phase * 2) * 5;

    ctx.save();
    ctx.translate(bf.x, bf.y + floatY);

    // Wings
    ctx.fillStyle = bf.color;
    ctx.save();
    ctx.scale(1, Math.cos(wingFlap));
    ctx.beginPath();
    ctx.ellipse(-6, 0, 8, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(6, 0, 8, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Body
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(-1, -8, 2, 16);

    // Antennae
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(-3, -12, -5, -14);
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(3, -12, 5, -14);
    ctx.stroke();

    ctx.restore();
}

function drawGround(ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) {
    const groundY = h * 0.68;

    // Main ground
    const ground = ctx.createLinearGradient(0, groundY, 0, h);
    ground.addColorStop(0, '#4CAF50');
    ground.addColorStop(0.2, '#43A047');
    ground.addColorStop(0.5, '#388E3C');
    ground.addColorStop(1, '#2E7D32');
    ctx.fillStyle = ground;
    ctx.fillRect(0, groundY, w, h - groundY);

    // Grass tufts
    ctx.strokeStyle = '#66BB6A';
    ctx.lineWidth = 2;
    for (let i = 0; i < w; i += 15) {
        const sway = Math.sin(frame * 0.025 + i * 0.05) * 3;
        ctx.beginPath();
        ctx.moveTo(i, groundY);
        ctx.quadraticCurveTo(i + sway, groundY - 12, i + sway * 1.5, groundY - 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i + 5, groundY);
        ctx.quadraticCurveTo(i + 5 + sway * 0.7, groundY - 8, i + 5 + sway, groundY - 15);
        ctx.stroke();
    }

    // Flowers
    const flowerColors = ['#E91E63', '#9C27B0', '#FF9800', '#FFEB3B', '#FF5722'];
    for (let i = 0; i < w; i += 45) {
        const flowerY = groundY + 5;
        const color = flowerColors[i % flowerColors.length];
        const sway = Math.sin(frame * 0.02 + i * 0.1) * 2;

        // Stem
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(i + 20, flowerY + 15);
        ctx.quadraticCurveTo(i + 20 + sway, flowerY, i + 20 + sway, flowerY - 10);
        ctx.stroke();

        // Petals
        ctx.fillStyle = color;
        for (let p = 0; p < 5; p++) {
            const angle = (p * Math.PI * 2) / 5;
            ctx.beginPath();
            ctx.ellipse(
                i + 20 + sway + Math.cos(angle) * 5,
                flowerY - 10 + Math.sin(angle) * 5,
                4, 3, angle, 0, Math.PI * 2
            );
            ctx.fill();
        }
        // Center
        ctx.fillStyle = '#FFC107';
        ctx.beginPath();
        ctx.arc(i + 20 + sway, flowerY - 10, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawTarget(ctx: CanvasRenderingContext2D, target: Target, frame: number) {
    if (target.hit) return;

    const { x, y, word, isCorrect, wobble } = target;
    const bob = Math.sin(frame * 0.03 + wobble) * 4;

    ctx.save();
    ctx.translate(x, y + bob);

    // Wooden sign post
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(-6, 25, 12, 50);

    // Sign board shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.roundRect(-58, -28, 120, 60, 8);
    ctx.fill();

    // Sign board
    const boardGrad = ctx.createLinearGradient(-55, -25, 55, 25);
    boardGrad.addColorStop(0, '#FFECB3');
    boardGrad.addColorStop(0.3, '#FFE082');
    boardGrad.addColorStop(0.7, '#FFD54F');
    boardGrad.addColorStop(1, '#FFCA28');
    ctx.fillStyle = boardGrad;
    ctx.beginPath();
    ctx.roundRect(-55, -30, 110, 55, 8);
    ctx.fill();

    // Board border
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-55, -30, 110, 55, 8);
    ctx.stroke();

    // Wood grain lines
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-50, -20 + i * 15);
        ctx.lineTo(50, -18 + i * 15);
        ctx.stroke();
    }

    // Corner nails
    ctx.fillStyle = '#5D4037';
    [[-45, -22], [45, -22], [-45, 17], [45, 17]].forEach(([nx, ny]) => {
        ctx.beginPath();
        ctx.arc(nx, ny, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Correct target indicator
    if (isCorrect) {
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.5)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.roundRect(-58, -33, 116, 61, 10);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Toto word (main text)
    ctx.fillStyle = '#3E2723';
    ctx.font = 'bold 18px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(word.toto || word.english, 0, -8);

    // English translation (smaller)
    ctx.fillStyle = '#6D4C41';
    ctx.font = '12px Nunito, sans-serif';
    ctx.fillText(`(${word.english})`, 0, 10);

    ctx.restore();
}

function drawBow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, pullBack: number, frame: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const bowRadius = BOW_SIZE;
    const pull = pullBack * 0.4;

    // Bow shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(5, 5, bowRadius, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    // Main bow - wood gradient
    const bowGrad = ctx.createLinearGradient(-bowRadius, 0, bowRadius, 0);
    bowGrad.addColorStop(0, '#8D6E63');
    bowGrad.addColorStop(0.3, '#A1887F');
    bowGrad.addColorStop(0.5, '#6D4C41');
    bowGrad.addColorStop(0.7, '#A1887F');
    bowGrad.addColorStop(1, '#8D6E63');

    ctx.strokeStyle = bowGrad;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, bowRadius, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    // Bow decorations
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, bowRadius, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    // Bow tips with decorative ends
    const topAngle = -Math.PI * 0.45;
    const botAngle = Math.PI * 0.45;
    const topX = Math.cos(topAngle) * bowRadius;
    const topY = Math.sin(topAngle) * bowRadius;
    const botX = Math.cos(botAngle) * bowRadius;
    const botY = Math.sin(botAngle) * bowRadius;

    ctx.fillStyle = '#4E342E';
    ctx.beginPath();
    ctx.arc(topX, topY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(botX, botY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Bowstring
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    if (pull > 5) {
        ctx.lineTo(-pull, 0);
    }
    ctx.lineTo(botX, botY);
    ctx.stroke();

    // Arrow on bow
    if (pull > 5) {
        ctx.save();
        ctx.translate(-pull + 5, 0);

        // Arrow shaft
        const shaftGrad = ctx.createLinearGradient(0, 0, 50, 0);
        shaftGrad.addColorStop(0, '#8D6E63');
        shaftGrad.addColorStop(0.5, '#A1887F');
        shaftGrad.addColorStop(1, '#6D4C41');
        ctx.fillStyle = shaftGrad;
        ctx.fillRect(0, -3, 55, 6);

        // Arrow head
        ctx.fillStyle = '#B71C1C';
        ctx.beginPath();
        ctx.moveTo(60, 0);
        ctx.lineTo(50, -8);
        ctx.lineTo(52, 0);
        ctx.lineTo(50, 8);
        ctx.closePath();
        ctx.fill();

        // Arrow head shine
        ctx.fillStyle = '#E53935';
        ctx.beginPath();
        ctx.moveTo(58, -2);
        ctx.lineTo(52, -6);
        ctx.lineTo(53, -1);
        ctx.closePath();
        ctx.fill();

        // Fletching
        ctx.fillStyle = '#FF6F00';
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(-8, -10);
        ctx.lineTo(0, -2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFB300';
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(-8, 10);
        ctx.lineTo(0, 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    ctx.restore();
}

function drawFlyingArrow(ctx: CanvasRenderingContext2D, arrow: ArrowState) {
    if (!arrow.active && !arrow.stuck) return;

    ctx.save();

    // Trail effect
    if (arrow.active) {
        arrow.trail.forEach((p, i) => {
            const alpha = 1 - i / arrow.trail.length;
            ctx.fillStyle = `rgba(255, 152, 0, ${alpha * 0.4})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4 - i * 0.2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.rotation);

    // Shaft
    const shaftGrad = ctx.createLinearGradient(-25, 0, 25, 0);
    shaftGrad.addColorStop(0, '#8D6E63');
    shaftGrad.addColorStop(0.5, '#A1887F');
    shaftGrad.addColorStop(1, '#6D4C41');
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(-25, -3, 50, 6);

    // Arrow head
    ctx.fillStyle = '#B71C1C';
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(20, -10);
    ctx.lineTo(22, 0);
    ctx.lineTo(20, 10);
    ctx.closePath();
    ctx.fill();

    // Fletching
    ctx.fillStyle = '#FF6F00';
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-35, -12);
    ctx.lineTo(-18, -2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FFB300';
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-35, 12);
    ctx.lineTo(-18, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawTrajectory(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, power: number) {
    ctx.save();
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();

    const speed = (power / 100) * ARROW_SPEED;
    let px = x, py = y;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;

    ctx.moveTo(px, py);
    for (let i = 0; i < 50; i++) {
        px += vx;
        py += vy;
        vy += GRAVITY;
        if (py > 600 || px > 500) break;
        ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Target circle at end
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px - 20, py);
    ctx.lineTo(px + 20, py);
    ctx.moveTo(px, py - 20);
    ctx.lineTo(px, py + 20);
    ctx.stroke();

    ctx.restore();
}

function drawHitEffect(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, correct: boolean) {
    const progress = Math.min(frame / 25, 1);
    const radius = progress * 60;
    const alpha = 1 - progress;

    ctx.save();
    ctx.globalAlpha = alpha;

    if (correct) {
        // Green success burst
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Sparkles
        for (let i = 0; i < 8; i++) {
            const sparkAngle = (i / 8) * Math.PI * 2 + frame * 0.1;
            const sparkDist = radius * 1.2;
            const sparkX = x + Math.cos(sparkAngle) * sparkDist;
            const sparkY = y + Math.sin(sparkAngle) * sparkDist;
            ctx.fillStyle = '#FFD700';
            ctx.font = `${16 + frame * 0.3}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('✨', sparkX, sparkY);
        }

        // +100 text
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 32px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+100', x, y - radius - 10);
    } else {
        // Red miss effect
        ctx.strokeStyle = '#F44336';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = `${24 + frame}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('❌', x, y);
    }

    ctx.restore();
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function MonkeyArrow() {
    const sfx = useGameSFX();
    const tutorial = useTutorial('forest-archer-v3');

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
    const birdsRef = useRef<Bird[]>([]);
    const butterfliesRef = useRef<Butterfly[]>([]);
    const canShootRef = useRef(true);
    const pullBackRef = useRef(0);
    const aimAngleRef = useRef(-0.15);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const hitEffectRef = useRef<{ x: number; y: number; frame: number; correct: boolean } | null>(null);

    const BOW_X = 70;
    const BOW_Y_RATIO = 0.72;

    // Initialize birds and butterflies
    useEffect(() => {
        birdsRef.current = [
            { x: 100, y: 80, vx: 1.5, wingPhase: 0, size: 0.8 },
            { x: 300, y: 60, vx: -1.2, wingPhase: 2, size: 0.6 },
        ];
        butterfliesRef.current = [
            { x: 150, y: 200, phase: 0, color: '#E91E63' },
            { x: 280, y: 180, phase: 1.5, color: '#9C27B0' },
            { x: 350, y: 220, phase: 3, color: '#2196F3' },
        ];
    }, []);

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

    const generateRounds = useCallback(() => {
        if (allWords.length < 4) return [];
        const questions = shuffle(allWords).slice(0, TOTAL_ROUNDS);
        return questions.map(q => ({
            question: q,
            options: generateOptions(q, allWords, 3)
        }));
    }, [allWords]);

    const spawnTargets = useCallback((roundData: RoundData, w: number, h: number) => {
        const positions = [
            { x: w * 0.45, y: h * 0.20 },
            { x: w * 0.72, y: h * 0.35 },
            { x: w * 0.55, y: h * 0.52 },
        ];
        const targets: Target[] = roundData.options.map((opt, i) => ({
            x: positions[i].x,
            y: positions[i].y,
            word: opt,
            isCorrect: opt.id === roundData.question.id,
            hit: false,
            wobble: Math.random() * Math.PI * 2,
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
        pullBackRef.current = 0;
        hitEffectRef.current = null;
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
        pullBackRef.current = 0;
        hitEffectRef.current = null;
        setPhase('playing');
        sfx.startBGM();
    }, [tutorial, generateRounds, sfx]);

    const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
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
        pullBackRef.current = 0;
    }, [getCanvasCoords]);

    const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        const coords = getCanvasCoords(e);
        const { w, h } = dims.current;
        const bowY = h * BOW_Y_RATIO;

        // Pull back based on horizontal drag
        const dx = dragStartRef.current.x - coords.x;
        pullBackRef.current = Math.max(0, Math.min(dx, 100));

        // Angle based on vertical position relative to bow
        const dy = bowY - coords.y;
        aimAngleRef.current = Math.max(-0.6, Math.min(0.4, -dy / (h * 0.4)));
    }, [getCanvasCoords]);

    const handlePointerUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDraggingRef.current || !canShootRef.current) return;
        e.preventDefault();
        isDraggingRef.current = false;

        if (pullBackRef.current < 20) {
            pullBackRef.current = 0;
            return;
        }

        const { h } = dims.current;
        const bowY = h * BOW_Y_RATIO;
        const angle = aimAngleRef.current;
        const speed = (pullBackRef.current / 100) * ARROW_SPEED;

        sfx.playShoot();
        arrowRef.current = {
            x: BOW_X + 60,
            y: bowY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rotation: angle,
            active: true,
            stuck: false,
            trail: []
        };
        canShootRef.current = false;
        pullBackRef.current = 0;
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
        dims.current = { w, h };

        const bowY = h * BOW_Y_RATIO;

        // Spawn targets
        if (phase === 'playing' && rounds[currentRound]) {
            spawnTargets(rounds[currentRound], w, h);
        } else if (phase === 'tutorial') {
            targetsRef.current = [
                { x: w * 0.45, y: h * 0.20, word: { id: '1', english: 'Word 1', toto: 'शब्द १', transliteration: '', imageUrl: '', audioToto: '', audioEnglish: '', category: '' }, isCorrect: false, hit: false, wobble: 0 },
                { x: w * 0.72, y: h * 0.35, word: { id: '2', english: 'Target', toto: 'लक्ष्य', transliteration: '', imageUrl: '', audioToto: '', audioEnglish: '', category: '' }, isCorrect: true, hit: false, wobble: 1 },
                { x: w * 0.55, y: h * 0.52, word: { id: '3', english: 'Word 3', toto: 'शब्द ३', transliteration: '', imageUrl: '', audioToto: '', audioEnglish: '', category: '' }, isCorrect: false, hit: false, wobble: 2 },
            ];
        }

        const loop = () => {
            if (!ctx) return;
            frameRef.current++;
            const f = frameRef.current;

            // Draw environment
            drawSky(ctx, w, h, f);
            drawMountains(ctx, w, h);

            // Back layer trees
            TREE_CONFIGS.filter(t => t.layer === 0).forEach(t => {
                drawTree(ctx, t.x * w, t.y * h, t.scale, f);
            });

            // Honeycomb on a tree
            drawHoneycomb(ctx, w * 0.08, h * 0.28, f);

            // Update and draw birds
            birdsRef.current.forEach(bird => {
                bird.x += bird.vx;
                if (bird.x > w + 50) bird.x = -50;
                if (bird.x < -50) bird.x = w + 50;
                drawBird(ctx, bird, f);
            });

            // Draw butterflies
            butterfliesRef.current.forEach(bf => {
                bf.x += Math.sin(f * 0.02 + bf.phase) * 0.5;
                drawButterfly(ctx, bf, f);
            });

            // Draw targets
            targetsRef.current.forEach(t => drawTarget(ctx, t, f));

            // Front layer trees
            TREE_CONFIGS.filter(t => t.layer === 1).forEach(t => {
                drawTree(ctx, t.x * w, t.y * h, t.scale, f);
            });

            // Bushes
            BUSH_CONFIGS.forEach(b => drawBush(ctx, b.x * w, b.y * h, f));

            // Ground
            drawGround(ctx, w, h, f);

            // Update arrow
            const arrow = arrowRef.current;
            if (arrow && arrow.active) {
                arrow.x += arrow.vx;
                arrow.y += arrow.vy;
                arrow.vy += GRAVITY;
                arrow.rotation = Math.atan2(arrow.vy, arrow.vx);

                arrow.trail.unshift({ x: arrow.x, y: arrow.y });
                if (arrow.trail.length > 12) arrow.trail.pop();

                // Check collision with targets
                for (const t of targetsRef.current) {
                    if (t.hit) continue;
                    const dx = arrow.x - t.x;
                    const dy = arrow.y - t.y;
                    if (Math.abs(dx) < 55 && Math.abs(dy) < 30) {
                        arrow.active = false;
                        arrow.stuck = true;
                        t.hit = true;
                        hitEffectRef.current = { x: t.x, y: t.y, frame: 0, correct: t.isCorrect };

                        if (t.isCorrect) {
                            sfx.playHit();
                            sfx.playCorrect();
                            setScore(s => s + 100);
                            setCorrectCount(c => c + 1);

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

            // Draw flying arrow
            if (arrow) drawFlyingArrow(ctx, arrow);

            // Hit effect
            if (hitEffectRef.current) {
                hitEffectRef.current.frame++;
                drawHitEffect(ctx, hitEffectRef.current.x, hitEffectRef.current.y, hitEffectRef.current.frame, hitEffectRef.current.correct);
            }

            // Draw bow
            drawBow(ctx, BOW_X, bowY, aimAngleRef.current, pullBackRef.current, f);

            // Trajectory preview
            if (isDraggingRef.current && pullBackRef.current > 20 && canShootRef.current) {
                const speed = (pullBackRef.current / 100) * ARROW_SPEED;
                drawTrajectory(ctx, BOW_X + 60 + Math.cos(aimAngleRef.current) * 30, bowY + Math.sin(aimAngleRef.current) * 30, aimAngleRef.current, pullBackRef.current);
            }

            // Tutorial overlay
            if (phase === 'tutorial') {
                drawTutorialOverlay(ctx, w, h, f, tutorialStep);
            }

            animRef.current = requestAnimationFrame(loop);
        };

        const drawTutorialOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number, frame: number, step: number) => {
            // Semi-transparent overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fillRect(0, 0, w, h);

            const arrowBob = Math.sin(frame * 0.1) * 8;
            const pulse = 1 + Math.sin(frame * 0.15) * 0.1;

            if (step === 0) {
                // Point to bow
                drawTutorialArrow(ctx, w * 0.25, h * 0.55 + arrowBob, BOW_X + 30, bowY - 20, pulse, '#FFD700');
                drawTutorialBox(ctx, w * 0.5, h * 0.35, '🏹', 'Drag back to aim!');
            } else if (step === 1) {
                // Point to targets
                drawTutorialArrow(ctx, w * 0.35, h * 0.15 + arrowBob, w * 0.55, h * 0.35, pulse, '#FFD700');
                drawTutorialBox(ctx, w * 0.5, h * 0.65, '🎯', 'Find the correct word!');
                // Highlight correct target
                const correct = targetsRef.current.find(t => t.isCorrect);
                if (correct) {
                    ctx.strokeStyle = '#4CAF50';
                    ctx.lineWidth = 4;
                    ctx.setLineDash([10, 5]);
                    ctx.beginPath();
                    ctx.arc(correct.x, correct.y, 70, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            } else if (step === 2) {
                drawTutorialBox(ctx, w * 0.5, h * 0.4, '🚀', 'Release to shoot!');
            } else if (step === 3) {
                drawTutorialBox(ctx, w * 0.5, h * 0.4, '🎉', "You're ready to play!");
            }
        };

        const drawTutorialArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, scale: number, color: string) => {
            const angle = Math.atan2(toY - fromY, toX - fromX);
            const length = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);

            ctx.save();
            ctx.translate(fromX, fromY);
            ctx.rotate(angle);
            ctx.scale(scale, scale);

            // Glow
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;

            // Arrow body
            ctx.fillStyle = color;
            ctx.fillRect(0, -10, length - 25, 20);

            // Arrow head
            ctx.beginPath();
            ctx.moveTo(length, 0);
            ctx.lineTo(length - 30, -25);
            ctx.lineTo(length - 30, 25);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        };

        const drawTutorialBox = (ctx: CanvasRenderingContext2D, x: number, y: number, emoji: string, text: string) => {
            ctx.save();

            // Box shadow
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetY = 5;

            // Box
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.roundRect(x - 110, y - 55, 220, 110, 20);
            ctx.fill();

            ctx.shadowBlur = 0;

            // Emoji
            ctx.font = '48px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, x, y - 15);

            // Text
            ctx.fillStyle = '#333';
            ctx.font = 'bold 18px Nunito, sans-serif';
            ctx.fillText(text, x, y + 30);

            ctx.restore();
        };

        animRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animRef.current);
    }, [phase, currentRound, rounds, tutorialStep, spawnTargets, sfx]);

    // Update targets when round changes
    useEffect(() => {
        if (phase === 'playing' && rounds[currentRound]) {
            spawnTargets(rounds[currentRound], dims.current.w, dims.current.h);
        }
    }, [currentRound, phase, rounds, spawnTargets]);

    // Tutorial interaction
    const handleTutorialTap = useCallback(() => {
        if (tutorialStep === 0) setTutorialStep(1);
        else if (tutorialStep === 1) { setTutorialStep(2); canShootRef.current = true; }
        else if (tutorialStep === 3) handleTutorialDone();
    }, [tutorialStep, handleTutorialDone]);

    useEffect(() => () => { sfx.stopBGM(); }, [sfx]);

    // ==========================================
    // SCREENS
    // ==========================================
    if (phase === 'loading') {
        return (
            <PlayGameShell title="Forest Archer" icon="🏹" gradient="from-green-500 to-emerald-600">
                <div className="flex flex-col items-center justify-center min-h-[65vh]">
                    <Loader2 className="w-12 h-12 animate-spin text-green-500 mb-4" />
                    <p className="text-gray-500">Loading words from database...</p>
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
                        onClick={tutorialStep !== 2 ? handleTutorialTap : undefined}
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
                        Shoot arrows at targets with the correct Toto words in the magical forest!
                    </p>
                    {allWords.length > 0 && (
                        <p className="text-xs text-green-600 mb-4">{allWords.length} words loaded</p>
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
                    <Mascot mood="happy" size="sm" message="Amazing archery! 🎯" className="mt-4" />
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
                            <img src={round.question.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        )}
                        <div className="text-center">
                            <span className="text-sm font-bold text-green-800">Find: {round?.question.english}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < correctCount ? 'bg-green-500' : i === currentRound ? 'bg-amber-400 animate-pulse' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div
                    className="flex-1 relative overflow-hidden"
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={() => { isDraggingRef.current = false; pullBackRef.current = 0; }}
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
