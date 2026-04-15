import PlayGameShell from '@/components/play/PlayGameShell';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ALL_WORDS, WordItem } from '@/data/wordData';
import { shuffle, generateOptions } from '@/lib/gameUtils';
import { Confetti } from '@/components/effects/Confetti';
import Mascot from '@/components/mascot/Mascot';
import GameTutorial, { useTutorial, RUNNER_TUTORIAL_STEPS } from '@/components/play/GameTutorial';
import { useGameSFX } from '@/hooks/useGameSFX';

// ==========================================
// CONSTANTS — Subway Surfers style
// ==========================================
const GRAVITY = 0.85;
const JUMP_FORCE = -10;
const GROUND_Y_PCT = 0.72;
const PLAYER_W = 52;
const PLAYER_H = 72;
const GAME_SPEED_INIT = 2.0;
const OBS_MIN = 260, OBS_MAX = 420;
const COIN_MIN = 70, COIN_MAX = 120;
const CHECKPOINT_DIST = 1200;
const MAX_CP = 5;
const MAX_JUMPS = 2;
const COIN_R = 12;

type ObsType = 'rock' | 'log' | 'bush';
const OBS_TYPES: ObsType[] = ['rock', 'log', 'bush'];

type PowerType = 'jetpack' | 'shield' | 'magnet' | 'dhol';
interface PowerUp { x: number; y: number; type: PowerType; collected: boolean; }
interface Obs { x: number; w: number; h: number; passed: boolean; type: ObsType; }
interface Coin { x: number; y: number; collected: boolean; f: number; }

interface GD {
    p: { y: number; vy: number; jc: number; f: number; dust: number; };
    obs: Obs[]; coins: Coin[]; pups: PowerUp[];
    dist: number; spd: number; nObs: number; nCoin: number; nPup: number;
    gOff: number; bgOff: number; coinCt: number;
    activePower: PowerType | null; powerTimer: number;
    zoneIdx: number; zoneTimer: number;
}

const ZONES = [
    { name: 'Village', sky1: '#89CFF0', sky2: '#E8F5E9', ground: '#6B8E23', path: '#8B7355' },
    { name: 'Rice Fields', sky1: '#B3E5FC', sky2: '#DCEDC8', ground: '#7CB342', path: '#A1887F' },
    { name: 'River Bank', sky1: '#80DEEA', sky2: '#B2EBF2', ground: '#5D8A3C', path: '#607D8B' },
    { name: 'Market', sky1: '#FFCC80', sky2: '#FFF3E0', ground: '#8D6E63', path: '#D7CCC8' },
    { name: 'Festival', sky1: '#CE93D8', sky2: '#F3E5F5', ground: '#66BB6A', path: '#BCAAA4' },
];

const POWER_COLORS: Record<PowerType, string> = { jetpack: '#FF6F00', shield: '#1565C0', magnet: '#E91E63', dhol: '#6A1B9A' };
const POWER_ICONS: Record<PowerType, string> = { jetpack: '🎋', shield: '🛡️', magnet: '🧲', dhol: '🥁' };
const POWER_NAMES: Record<PowerType, string> = { jetpack: 'Bamboo Jetpack', shield: 'Toto Shield', magnet: 'Coin Magnet', dhol: 'Speed Dhol' };
const POWER_DUR = 300; // frames

// Tutorial steps now imported from GameTutorial

function getCPWords(): { question: WordItem; options: WordItem[] }[] {
    const w = shuffle(ALL_WORDS.filter(w => w.imageUrl)).slice(0, MAX_CP);
    return w.map(q => ({ question: q, options: generateOptions(q, ALL_WORDS, 3) }));
}

// ==========================================
// DRAWING — Full immersive scene
// ==========================================

function drawScene(ctx: CanvasRenderingContext2D, s: GD, w: number, h: number) {
    const gy = h * GROUND_Y_PCT;
    const z = ZONES[s.zoneIdx % ZONES.length];

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, gy);
    sky.addColorStop(0, z.sky1); sky.addColorStop(0.7, z.sky2); sky.addColorStop(1, z.ground + '33');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, gy);

    // Sun/moon
    ctx.fillStyle = 'rgba(255,200,50,0.3)'; ctx.beginPath();
    ctx.arc(w * 0.8, 50, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,220,80,0.6)'; ctx.beginPath();
    ctx.arc(w * 0.8, 50, 18, 0, Math.PI * 2); ctx.fill();

    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    for (let i = 0; i < 4; i++) {
        const cx = ((i * 120 + s.bgOff * 0.08) % (w + 100)) - 50;
        ctx.beginPath(); ctx.ellipse(cx, 30 + i * 15, 35, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 20, 25 + i * 15, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
    }

    // Far hills
    ctx.fillStyle = z.ground + '55'; ctx.beginPath(); ctx.moveTo(0, gy);
    for (let x = 0; x <= w; x += 30) ctx.lineTo(x, gy - 80 - Math.sin(x * 0.007 + s.bgOff * 0.0002) * 40);
    ctx.lineTo(w, gy); ctx.closePath(); ctx.fill();

    // Mid trees
    ctx.fillStyle = z.ground + '88'; ctx.beginPath(); ctx.moveTo(0, gy);
    for (let x = 0; x <= w; x += 20) ctx.lineTo(x, gy - 50 - Math.sin(x * 0.015 + s.bgOff * 0.0005) * 25);
    ctx.lineTo(w, gy); ctx.closePath(); ctx.fill();

    // Zone-specific decorations
    drawZoneDecor(ctx, s, w, h, gy, z);

    // Ground
    const grd = ctx.createLinearGradient(0, gy, 0, h);
    grd.addColorStop(0, z.ground); grd.addColorStop(0.2, z.path); grd.addColorStop(1, '#3E4F1F');
    ctx.fillStyle = grd; ctx.fillRect(0, gy, w, h - gy);

    // Path lane markers
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 8; i++) {
        const lx = ((i * 60 + s.gOff * 2) % (w + 60)) - 30;
        ctx.fillRect(lx, gy + 2, 30, 3);
    }

    // Grass
    ctx.strokeStyle = z.ground; ctx.lineWidth = 1.5;
    for (let i = 0; i < 15; i++) {
        const gx = ((i * 30 + s.gOff * 1.5) % (w + 40)) - 20;
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx - 3, gy - 8); ctx.moveTo(gx, gy); ctx.lineTo(gx + 4, gy - 9); ctx.stroke();
    }

    // Coins
    for (const c of s.coins) {
        if (c.collected) continue;
        const bounce = Math.sin(c.f * 0.06) * 3;
        const cy = c.y + bounce;
        ctx.fillStyle = 'rgba(255,215,0,0.15)'; ctx.beginPath(); ctx.arc(c.x, cy, COIN_R, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(c.x, cy, COIN_R * 0.7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#FFA000'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(c.x, cy, COIN_R * 0.45, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(c.x - 2, cy - 3, 2.5, 0, Math.PI * 2); ctx.fill();
    }

    // Power-ups
    for (const pu of s.pups) {
        if (pu.collected) continue;
        const bob = Math.sin(s.p.f * 0.04) * 5;
        const py = pu.y + bob;
        ctx.fillStyle = POWER_COLORS[pu.type] + '30'; ctx.beginPath(); ctx.arc(pu.x, py, 20, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = POWER_COLORS[pu.type]; ctx.beginPath(); ctx.arc(pu.x, py, 14, 0, Math.PI * 2); ctx.fill();
        ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(POWER_ICONS[pu.type], pu.x, py);
    }

    // Obstacles
    for (const o of s.obs) drawObs(ctx, o, gy);

    // Player
    drawPlayer(ctx, s, gy, w);

    // Active power effect
    if (s.activePower) drawPowerEffect(ctx, s, gy);

    // Dust
    if (s.p.dust > 0) {
        const da = s.p.dust / 12;
        ctx.fillStyle = `rgba(139,115,85,${da * 0.4})`;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath(); ctx.arc(70 + PLAYER_W / 2 + (i - 3) * 10, gy - 3 + Math.random() * 5, 3 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
        }
    }

    // Zone name banner
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.font = 'bold 11px Nunito,sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`📍 ${z.name}`, 8, 18);

    // HUD right
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.font = 'bold 14px Nunito,sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(`${Math.floor(s.dist)}m`, w - 10, 18);

    // Power indicator
    if (s.activePower) {
        const pct = s.powerTimer / POWER_DUR;
        ctx.fillStyle = POWER_COLORS[s.activePower] + '60';
        ctx.fillRect(10, h - 18, (w - 20) * pct, 6);
        ctx.fillStyle = POWER_COLORS[s.activePower];
        ctx.fillRect(10, h - 18, (w - 20) * pct, 6);
        ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'white';
        ctx.fillText(`${POWER_ICONS[s.activePower]} ${POWER_NAMES[s.activePower]}`, w / 2, h - 8);
    }
}

function drawZoneDecor(ctx: CanvasRenderingContext2D, s: GD, w: number, h: number, gy: number, z: typeof ZONES[0]) {
    const idx = s.zoneIdx % ZONES.length;
    if (idx === 0 || idx === 3) { // Village / Market — huts
        for (let i = 0; i < 3; i++) {
            const hx = ((i * 150 + 40 + s.bgOff * 0.12) % (w + 100)) - 50;
            ctx.fillStyle = '#D7B377'; ctx.fillRect(hx, gy - 50, 40, 28);
            ctx.fillStyle = '#8D6E36'; ctx.beginPath(); ctx.moveTo(hx - 6, gy - 22); ctx.lineTo(hx + 20, gy - 58); ctx.lineTo(hx + 46, gy - 22); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#5C3A14'; ctx.fillRect(hx + 14, gy - 36, 12, 14);
        }
        if (idx === 3) { // Market — stalls
            ctx.fillStyle = '#E65100'; ctx.fillRect(((200 + s.bgOff * 0.1) % w), gy - 35, 50, 20);
            ctx.fillStyle = '#BF360C'; ctx.fillRect(((200 + s.bgOff * 0.1) % w) - 2, gy - 40, 54, 6);
        }
    } else if (idx === 1) { // Rice fields — green rows
        ctx.strokeStyle = '#81C784'; ctx.lineWidth = 2;
        for (let r = 0; r < 4; r++) {
            const ry = gy - 30 - r * 15;
            ctx.beginPath();
            for (let x = 0; x <= w; x += 15) ctx.lineTo(x, ry + Math.sin(x * 0.03 + s.bgOff * 0.001 + r) * 3);
            ctx.stroke();
        }
    } else if (idx === 2) { // River
        ctx.fillStyle = 'rgba(33,150,243,0.2)'; ctx.fillRect(0, gy - 15, w, 15);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const rx = ((i * 70 + s.bgOff * 0.5) % (w + 40)) - 20;
            ctx.beginPath(); ctx.moveTo(rx, gy - 8); ctx.lineTo(rx + 20, gy - 8); ctx.stroke();
        }
    } else if (idx === 4) { // Festival — flags
        const colors = ['#F44336', '#FF9800', '#FFEB3B', '#4CAF50', '#2196F3'];
        for (let i = 0; i < 8; i++) {
            const fx = ((i * 55 + s.bgOff * 0.15) % (w + 60)) - 30;
            ctx.fillStyle = colors[i % colors.length]; ctx.beginPath();
            ctx.moveTo(fx, gy - 65); ctx.lineTo(fx + 12, gy - 55); ctx.lineTo(fx, gy - 45); ctx.closePath(); ctx.fill();
        }
        ctx.strokeStyle = '#795548'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, gy - 65); ctx.lineTo(w, gy - 65); ctx.stroke();
    }
}

function drawObs(ctx: CanvasRenderingContext2D, o: Obs, gy: number) {
    if (o.type === 'rock') {
        ctx.fillStyle = '#8B8682'; ctx.beginPath();
        ctx.moveTo(o.x + 4, gy); ctx.quadraticCurveTo(o.x, gy - o.h, o.x + o.w / 2, gy - o.h - 3);
        ctx.quadraticCurveTo(o.x + o.w, gy - o.h, o.x + o.w - 2, gy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(o.x + o.w * 0.35, gy - o.h * 0.7, 5, 0, Math.PI * 2); ctx.fill();
    } else if (o.type === 'log') {
        ctx.fillStyle = '#6D4C21'; const r = o.h * 0.4;
        ctx.beginPath(); ctx.ellipse(o.x + o.w / 2, gy - r, o.w / 2, r, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#8B6914'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(o.x + o.w / 2, gy - r, o.w * 0.3, r * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
    } else {
        ctx.fillStyle = '#2E7D32'; ctx.beginPath(); ctx.arc(o.x + o.w / 2, gy - o.h * 0.6, o.h * 0.55, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#388E3C'; ctx.beginPath(); ctx.arc(o.x + o.w * 0.3, gy - o.h * 0.4, o.h * 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(o.x + o.w * 0.7, gy - o.h * 0.45, o.h * 0.42, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.beginPath(); ctx.ellipse(o.x + o.w / 2, gy + 2, o.w / 2 + 4, 3, 0, 0, Math.PI * 2); ctx.fill();
}

function drawPlayer(ctx: CanvasRenderingContext2D, s: GD, gy: number, cw: number) {
    const px = 60, py = s.p.y, f = s.p.f, jumping = s.p.jc > 0;
    const jetpack = s.activePower === 'jetpack';
    const shield = s.activePower === 'shield';

    // Shadow
    const ss = jumping ? 0.6 : 1;
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath();
    ctx.ellipse(px + PLAYER_W / 2, gy + 3, (PLAYER_W / 2 + 4) * ss, 5 * ss, 0, 0, Math.PI * 2); ctx.fill();

    ctx.save();

    // Jetpack flames
    if (jetpack && jumping) {
        ctx.fillStyle = '#FF6F00'; ctx.globalAlpha = 0.6 + Math.sin(f * 0.3) * 0.3;
        ctx.beginPath(); ctx.moveTo(px + 8, py + PLAYER_H * 0.7); ctx.lineTo(px + 2, py + PLAYER_H + 10 + Math.sin(f * 0.5) * 8);
        ctx.lineTo(px + 14, py + PLAYER_H * 0.7); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#FFCA28'; ctx.beginPath(); ctx.moveTo(px + 8, py + PLAYER_H * 0.75);
        ctx.lineTo(px + 5, py + PLAYER_H + Math.sin(f * 0.5) * 5); ctx.lineTo(px + 11, py + PLAYER_H * 0.75); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Shield glow
    if (shield) {
        ctx.strokeStyle = '#42A5F5'; ctx.lineWidth = 3; ctx.globalAlpha = 0.4 + Math.sin(f * 0.05) * 0.2;
        ctx.beginPath(); ctx.ellipse(px + PLAYER_W / 2, py + PLAYER_H / 2, PLAYER_W * 0.7, PLAYER_H * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
    }

    // BODY — bigger, more detailed character
    // Legs
    ctx.strokeStyle = '#C68642'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    if (!jumping) {
        const lp = Math.sin(f * 0.18);
        ctx.beginPath(); ctx.moveTo(px + 16, py + PLAYER_H * 0.62); ctx.lineTo(px + 16 + lp * 8, py + PLAYER_H - 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px + PLAYER_W - 16, py + PLAYER_H * 0.62); ctx.lineTo(px + PLAYER_W - 16 - lp * 8, py + PLAYER_H - 2); ctx.stroke();
        // Feet
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(px + 10 + lp * 8, py + PLAYER_H - 6, 12, 6);
        ctx.fillRect(px + PLAYER_W - 22 - lp * 8, py + PLAYER_H - 6, 12, 6);
    } else {
        ctx.beginPath(); ctx.moveTo(px + 16, py + PLAYER_H * 0.62); ctx.lineTo(px + 10, py + PLAYER_H * 0.78); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px + PLAYER_W - 16, py + PLAYER_H * 0.62); ctx.lineTo(px + PLAYER_W - 10, py + PLAYER_H * 0.78); ctx.stroke();
    }

    // Torso
    ctx.fillStyle = '#FFF8E1'; ctx.beginPath();
    ctx.roundRect(px + 10, py + PLAYER_H * 0.28, PLAYER_W - 20, PLAYER_H * 0.38, 4); ctx.fill();
    // Toto traditional pattern
    ctx.strokeStyle = '#FF8F00'; ctx.lineWidth = 2;
    ctx.strokeRect(px + 10, py + PLAYER_H * 0.28, PLAYER_W - 20, PLAYER_H * 0.38);
    ctx.strokeStyle = '#E65100'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px + 12, py + PLAYER_H * 0.4); ctx.lineTo(px + PLAYER_W - 12, py + PLAYER_H * 0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + 12, py + PLAYER_H * 0.52); ctx.lineTo(px + PLAYER_W - 12, py + PLAYER_H * 0.52); ctx.stroke();

    // Arms
    ctx.strokeStyle = '#C68642'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    const arm = jumping ? 0 : Math.sin(f * 0.18) * 6;
    ctx.beginPath(); ctx.moveTo(px + 10, py + PLAYER_H * 0.35); ctx.lineTo(px - 2 - arm, py + PLAYER_H * 0.55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + PLAYER_W - 10, py + PLAYER_H * 0.35); ctx.lineTo(px + PLAYER_W + 2 + arm, py + PLAYER_H * 0.55); ctx.stroke();

    // Jetpack on back
    if (jetpack) {
        ctx.fillStyle = '#5D4037'; ctx.fillRect(px + 2, py + PLAYER_H * 0.3, 8, PLAYER_H * 0.35);
        ctx.fillStyle = '#FF8F00'; ctx.fillRect(px + 1, py + PLAYER_H * 0.32, 10, 8);
    }

    // Head
    ctx.fillStyle = '#C68642'; ctx.beginPath();
    ctx.arc(px + PLAYER_W / 2, py + PLAYER_H * 0.16, PLAYER_H * 0.16, 0, Math.PI * 2); ctx.fill();

    // Hair
    ctx.fillStyle = '#1A1A1A'; ctx.beginPath();
    ctx.arc(px + PLAYER_W / 2, py + PLAYER_H * 0.12, PLAYER_H * 0.14, Math.PI, 2 * Math.PI); ctx.fill();

    // Headband
    ctx.fillStyle = '#FF5722'; ctx.fillRect(px + PLAYER_W / 2 - 14, py + PLAYER_H * 0.09, 28, 4);
    ctx.fillStyle = '#FF8A65';
    ctx.beginPath(); ctx.moveTo(px + PLAYER_W / 2 + 14, py + PLAYER_H * 0.09);
    ctx.lineTo(px + PLAYER_W / 2 + 22, py + PLAYER_H * 0.05); ctx.lineTo(px + PLAYER_W / 2 + 14, py + PLAYER_H * 0.13); ctx.closePath(); ctx.fill();

    // Eyes
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath(); ctx.ellipse(px + PLAYER_W / 2 - 6, py + PLAYER_H * 0.15, 2.5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(px + PLAYER_W / 2 + 6, py + PLAYER_H * 0.15, 2.5, 3, 0, 0, Math.PI * 2); ctx.fill();
    // Shine
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(px + PLAYER_W / 2 - 5, py + PLAYER_H * 0.13, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px + PLAYER_W / 2 + 7, py + PLAYER_H * 0.13, 1, 0, Math.PI * 2); ctx.fill();

    // Determined smile
    ctx.strokeStyle = '#8D4925'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(px + PLAYER_W / 2, py + PLAYER_H * 0.2, 6, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();

    ctx.restore();
}

function drawPowerEffect(ctx: CanvasRenderingContext2D, s: GD, gy: number) {
    if (s.activePower === 'magnet') {
        // Magnetic field lines
        ctx.strokeStyle = 'rgba(233,30,99,0.2)'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
        for (let i = 0; i < 3; i++) {
            ctx.beginPath(); ctx.arc(60 + PLAYER_W / 2, s.p.y + PLAYER_H / 2, 40 + i * 25, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.setLineDash([]);
    } else if (s.activePower === 'dhol') {
        // Speed lines
        ctx.strokeStyle = 'rgba(106,27,154,0.15)'; ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const ly = s.p.y + 10 + i * 14;
            ctx.beginPath(); ctx.moveTo(10, ly); ctx.lineTo(50, ly); ctx.stroke();
        }
    }
}

// ==========================================
// CHECKPOINT QUIZ
// ==========================================
function CPQuiz({ question, options, num, total, onAnswer, sfx }: {
    question: WordItem; options: WordItem[]; num: number; total: number;
    onAnswer: (c: boolean) => void; sfx: ReturnType<typeof useGameSFX>;
}) {
    const [sel, setSel] = useState<string | null>(null);
    const [fb, setFb] = useState<'correct' | 'wrong' | null>(null);
    const pick = (id: string) => {
        if (fb === 'correct') return;
        setSel(id); const ok = id === question.id;
        setFb(ok ? 'correct' : 'wrong');
        if (ok) { sfx.playCorrect(); if (question.audioTotoUrl) try { new Audio(question.audioTotoUrl).play().catch(() => { }); } catch { } setTimeout(() => onAnswer(true), 1200); }
        else { sfx.playWrong(); setTimeout(() => { setSel(null); setFb(null); }, 900); }
    };
    return (
        <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
            <div className="bg-amber-100 text-amber-700 rounded-full px-4 py-1 text-xs font-bold mb-3">🏁 Checkpoint {num}/{total}</div>
            <Mascot mood="thinking" size="sm" message="What is this word in Toto? 🤔" />
            <div className="mt-3 bg-white rounded-2xl shadow-lg p-4 w-full max-w-xs">
                <img src={question.imageUrl} alt="quiz" className="w-24 h-24 object-cover rounded-xl mx-auto mb-3 shadow-sm" />
                <p className="text-sm font-bold text-gray-600 mb-3">What is this?</p>
                <div className="grid gap-2">
                    {options.map(o => (
                        <button key={o.id} onClick={() => pick(o.id)} disabled={fb === 'correct'}
                            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${fb && o.id === question.id ? 'bg-green-100 text-green-700 ring-2 ring-green-400' : sel === o.id && o.id !== question.id ? 'bg-red-100 text-red-700 ring-2 ring-red-400 animate-shake' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95'}`}>
                            {o.english} {fb && o.id === question.id && '✅'} {sel === o.id && o.id !== question.id && '❌'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Countdown({ onDone, sfx }: { onDone: () => void; sfx: ReturnType<typeof useGameSFX> }) {
    const [c, setC] = useState(3);
    useEffect(() => {
        sfx.playCountdown(false);
        const iv = setInterval(() => setC(v => { const n = v - 1; if (n > 0) sfx.playCountdown(false); else sfx.playCountdown(true); return n; }), 800);
        const t = setTimeout(() => { clearInterval(iv); onDone(); }, 3 * 800);
        return () => { clearInterval(iv); clearTimeout(t); };
    }, [onDone, sfx]);
    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <span className="text-7xl font-black text-white drop-shadow-2xl" style={{ animation: 'pulse 0.8s ease-in-out infinite' }}>{c > 0 ? c : 'GO!'}</span>
        </div>
    );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function RunnerGame() {
    const sfx = useGameSFX();
    const sfxRef = useRef(sfx); sfxRef.current = sfx;
    const tutorial = useTutorial('toto-runner');
    const [phase, setPhase] = useState<'menu' | 'countdown' | 'playing' | 'checkpoint' | 'gameover' | 'results'>('menu');
    const [score, setScore] = useState(0);
    const [distance, setDistance] = useState(0);
    const [cpCleared, setCpCleared] = useState(0);
    const [curCP, setCurCP] = useState(0);
    const [cpData, setCpData] = useState<ReturnType<typeof getCPWords>>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showTut, setShowTut] = useState(false);
    const [powerLabel, setPowerLabel] = useState('');
    const [coinCount, setCoinCount] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        try { return parseInt(localStorage.getItem('totoRunnerHighScore') || '0', 10); } catch { return 0; }
    });
    const [isNewHighScore, setIsNewHighScore] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<GD | null>(null);
    const animRef = useRef<number>(0);
    const nextCPAt = useRef(CHECKPOINT_DIST);
    const isRunning = useRef(false);
    const dims = useRef({ w: 400, h: 550 });
    const curCPRef = useRef(0);

    const jump = useCallback(() => {
        if (!gameRef.current || phase !== 'playing') return;
        const p = gameRef.current.p;
        // Every tap gives upward boost — unlimited jumps
        p.vy = JUMP_FORCE * 0.85;
        p.jc++;
        sfxRef.current.playJump();
    }, [phase]);

    const gameLoopRef = useRef<(() => void) | null>(null);
    gameLoopRef.current = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const s = gameRef.current;
        if (!canvas || !ctx || !s || !isRunning.current) return;
        const { w, h } = dims.current;
        const gy = h * GROUND_Y_PCT;

        // Physics
        if (s.activePower === 'jetpack' && s.p.jc > 0) {
            s.p.vy += GRAVITY * 0.3; // Float gently with jetpack
        } else {
            s.p.vy += GRAVITY;
        }
        s.p.y += s.p.vy; s.p.f++;
        if (s.p.dust > 0) s.p.dust--;

        // Ground
        if (s.p.y >= gy - PLAYER_H) {
            if (s.p.jc > 0 && s.p.vy > 2) s.p.dust = 12;
            s.p.y = gy - PLAYER_H; s.p.vy = 0; s.p.jc = 0;
        }

        // Speed boost from dhol
        const spdMult = s.activePower === 'dhol' ? 1.6 : 1;
        const curSpd = s.spd * spdMult;

        // Move obstacles
        for (const o of s.obs) { o.x -= curSpd; if (!o.passed && o.x + o.w < 60) { o.passed = true; setScore(sc => sc + 10); } }
        s.obs = s.obs.filter(o => o.x > -50);

        // Spawn obstacles
        s.nObs -= curSpd;
        if (s.nObs <= 0) {
            const t = OBS_TYPES[Math.floor(Math.random() * OBS_TYPES.length)];
            const bh = t === 'rock' ? 30 : t === 'log' ? 22 : 38;
            s.obs.push({ x: w + 20, w: t === 'log' ? 40 + Math.random() * 10 : 30 + Math.random() * 12, h: bh + Math.random() * 18, passed: false, type: t });
            s.nObs = OBS_MIN + Math.random() * (OBS_MAX - OBS_MIN);
        }

        // Move coins
        for (const c of s.coins) { c.x -= curSpd; c.f++; }
        s.coins = s.coins.filter(c => c.x > -20 && !c.collected);
        s.nCoin -= curSpd;
        if (s.nCoin <= 0) {
            const cx = w + 20, cy = gy - PLAYER_H - 10 - Math.random() * 50;
            s.coins.push({ x: cx, y: cy, collected: false, f: 0 });
            // Coin cluster (3_coins in a row)
            if (Math.random() < 0.4) { s.coins.push({ x: cx + 25, y: cy, collected: false, f: 0 }); s.coins.push({ x: cx + 50, y: cy, collected: false, f: 0 }); }
            s.nCoin = COIN_MIN + Math.random() * (COIN_MAX - COIN_MIN);
        }

        // Move power-ups
        for (const pu of s.pups) pu.x -= curSpd;
        s.pups = s.pups.filter(p => p.x > -30 && !p.collected);
        s.nPup -= curSpd;
        if (s.nPup <= 0) {
            const types: PowerType[] = ['jetpack', 'shield', 'magnet', 'dhol'];
            s.pups.push({ x: w + 30, y: gy - PLAYER_H - 30 - Math.random() * 30, type: types[Math.floor(Math.random() * types.length)], collected: false });
            s.nPup = 500 + Math.random() * 400;
        }

        // Power-up timer
        if (s.activePower) {
            s.powerTimer--;
            if (s.powerTimer <= 0) { s.activePower = null; setPowerLabel(''); }
        }

        // Coin collection
        const px = 60, py = s.p.y;
        const magnetRange = s.activePower === 'magnet' ? 100 : 0;
        for (const c of s.coins) {
            if (c.collected) continue;
            const dx = (px + PLAYER_W / 2) - c.x, dy = (py + PLAYER_H / 2) - c.y;
            const d2 = dx * dx + dy * dy;
            // Magnet pull
            if (magnetRange > 0 && d2 < magnetRange * magnetRange) { c.x += dx * 0.1; c.y += dy * 0.1; }
            if (d2 < (PLAYER_W * 0.5) * (PLAYER_W * 0.5)) {
                c.collected = true; s.coinCt++;
                const mult = s.activePower === 'dhol' ? 50 : 25;
                setScore(sc => sc + mult); sfxRef.current.playCollect();
            }
        }

        // Power-up collection
        for (const pu of s.pups) {
            if (pu.collected) continue;
            const dx = (px + PLAYER_W / 2) - pu.x, dy = (py + PLAYER_H / 2) - pu.y;
            if (dx * dx + dy * dy < 35 * 35) {
                pu.collected = true; s.activePower = pu.type; s.powerTimer = POWER_DUR;
                setPowerLabel(POWER_NAMES[pu.type]); sfxRef.current.playCollect(); sfxRef.current.playStreak();
            }
        }

        // Collision — only if no shield
        if (s.activePower !== 'shield') {
            for (const o of s.obs) {
                const m = 10;
                if (px + PLAYER_W - m > o.x + m && px + m < o.x + o.w - m && py + PLAYER_H > gy - o.h + m + 3) {
                    isRunning.current = false;
                    sfxRef.current.playGameOver();
                    sfxRef.current.stopBGM();
                    setCoinCount(s.coinCt);
                    // Check high score
                    setScore(prev => {
                        const finalScore = prev; // score already set
                        if (finalScore > highScore) {
                            setHighScore(finalScore);
                            setIsNewHighScore(true);
                            try { localStorage.setItem('totoRunnerHighScore', String(finalScore)); } catch { }
                        }
                        return prev;
                    });
                    setPhase('gameover');
                    return;
                }
            }
        } else {
            // Shield absorbs one hit then breaks
            for (const o of s.obs) {
                const m = 10;
                if (px + PLAYER_W - m > o.x + m && px + m < o.x + o.w - m && py + PLAYER_H > gy - o.h + m + 3) {
                    s.activePower = null; s.powerTimer = 0; setPowerLabel('');
                    o.passed = true; o.x = -100;
                    sfxRef.current.playHit(); break;
                }
            }
        }

        // Progress
        s.dist += curSpd * 0.08; s.spd = GAME_SPEED_INIT + s.dist * 0.0004;
        s.gOff += curSpd; s.bgOff += curSpd;
        setDistance(s.dist);

        // Zone transition every 800m
        s.zoneTimer += curSpd * 0.08;
        if (s.zoneTimer > 800) { s.zoneTimer = 0; s.zoneIdx = (s.zoneIdx + 1) % ZONES.length; }

        // Checkpoint
        if (s.dist >= nextCPAt.current && curCPRef.current < MAX_CP) {
            isRunning.current = false; sfxRef.current.playCorrect();
            sfxRef.current.stopBGM();
            setPhase('checkpoint'); return;
        }

        drawScene(ctx, s, w, h);
        animRef.current = requestAnimationFrame(() => gameLoopRef.current?.());
    };

    const initGame = useCallback(() => {
        setCpData(getCPWords()); setCurCP(0); curCPRef.current = 0; setCpCleared(0);
        setScore(0); setDistance(0); setShowConfetti(false); setPowerLabel(''); setCoinCount(0); setIsNewHighScore(false);
        nextCPAt.current = CHECKPOINT_DIST; setPhase('countdown'); sfxRef.current.startBGM();
    }, []);

    const startGame = useCallback(() => {
        if (tutorial.shouldShow) { setShowTut(true); return; }
        initGame();
    }, [tutorial.shouldShow, initGame]);

    const tutDone = useCallback(() => { tutorial.markSeen(); setShowTut(false); initGame(); }, [tutorial, initGame]);
    const countdownDone = useCallback(() => setPhase('playing'), []);

    const cpAnswer = useCallback((ok: boolean) => {
        if (!ok) return;
        setCpCleared(c => c + 1); setScore(sc => sc + 50);
        const next = curCPRef.current + 1; setCurCP(next); curCPRef.current = next;
        nextCPAt.current += CHECKPOINT_DIST;
        if (next >= MAX_CP) {
            setShowConfetti(true); sfxRef.current.playVictory(); setPhase('results');
        } else {
            setPhase('countdown'); sfxRef.current.startBGM();
        }
    }, []);

    useEffect(() => { return () => { isRunning.current = false; cancelAnimationFrame(animRef.current); sfxRef.current.stopBGM(); }; }, []);

    // Init canvas
    useEffect(() => {
        if (phase !== 'playing') return;
        const canvas = canvasRef.current; if (!canvas) return;
        const parent = canvas.parentElement; if (!parent) return;
        const w = parent.clientWidth || 400, h = parent.clientHeight || 550;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr; canvas.height = h * dpr;
        canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        dims.current = { w, h };
        const gy = h * GROUND_Y_PCT;
        gameRef.current = {
            p: { y: gy - PLAYER_H, vy: 0, jc: 0, f: 0, dust: 0 },
            obs: [], coins: [], pups: [], dist: 0, spd: GAME_SPEED_INIT,
            nObs: 180, nCoin: 60, nPup: 300, gOff: 0, bgOff: 0, coinCt: 0,
            activePower: null, powerTimer: 0, zoneIdx: 0, zoneTimer: 0,
        };
        if (ctx) drawScene(ctx, gameRef.current, w, h);
        isRunning.current = true;
        animRef.current = requestAnimationFrame(() => gameLoopRef.current?.());
        return () => { isRunning.current = false; cancelAnimationFrame(animRef.current); };
    }, [phase]);

    useEffect(() => {
        if (phase !== 'playing') return;
        const kh = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); jump(); } };
        document.addEventListener('keydown', kh); return () => document.removeEventListener('keydown', kh);
    }, [phase, jump]);

    // ==========================================
    // SCREENS
    // ==========================================
    if (showTut) return (
        <PlayGameShell title="Totopara Runner" icon="🏃" gradient="from-emerald-400 to-green-600">
            <div className="flex flex-col relative" style={{ height: 'calc(100vh - 56px)' }}>
                {/* Demo scene with animated runner */}
                <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-sky-300 to-green-400">
                    <div className="absolute bottom-[28%] left-[15%] animate-bounce" style={{ animationDuration: '0.5s' }}>
                        <span className="text-5xl">🏃</span>
                    </div>
                    <div className="absolute bottom-[30%] right-[20%] animate-pulse">
                        <span className="text-4xl">🪙</span>
                    </div>
                    <div className="absolute bottom-[28%] w-full h-[30%] bg-gradient-to-t from-green-600 to-green-500" />
                </div>
                {/* Interactive tutorial overlay */}
                <GameTutorial
                    gameId="toto-runner"
                    steps={RUNNER_TUTORIAL_STEPS}
                    onComplete={tutDone}
                />
            </div>
        </PlayGameShell>
    );

    if (phase === 'menu') return (
        <PlayGameShell title="Totopara Runner" icon="🏃" gradient="from-emerald-400 to-green-600">
            <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center">
                <Mascot mood="excited" size="md" message="Run through Totopara! 🏃🌿" />
                <h2 className="text-xl font-extrabold text-gray-800 mt-4 mb-2">Totopara Runner</h2>
                <p className="text-sm text-muted-foreground mb-2 max-w-xs">Sprint through villages, rice fields, rivers & festivals! Collect power-ups and learn Toto words!</p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-xs text-emerald-700 max-w-xs">
                    <p className="font-semibold">How to play:</p>
                    <p className="mt-1">• Tap / Space to jump (double jump!)</p>
                    <p>• Collect coins 🪙 and power-ups!</p>
                    <p>• 🎋 Bamboo Jetpack — fly high!</p>
                    <p>• 🛡️ Toto Shield — block one hit!</p>
                    <p>• 🧲 Coin Magnet — pull coins in!</p>
                    <p>• 🥁 Speed Dhol — 2x speed & coins!</p>
                </div>
                <button onClick={() => { sfxRef.current.playClick(); startGame(); }} className="btn-game bg-gradient-to-r from-emerald-500 to-green-600 text-white px-12 py-3 text-lg">
                    Start Running! 🌿
                </button>
            </div>
        </PlayGameShell>
    );

    if (phase === 'checkpoint' && cpData[curCP]) return (
        <PlayGameShell title="Totopara Runner" icon="🏃" gradient="from-emerald-400 to-green-600">
            <CPQuiz question={cpData[curCP].question} options={cpData[curCP].options} num={curCP + 1} total={MAX_CP} onAnswer={cpAnswer} sfx={sfx} />
        </PlayGameShell>
    );

    if (phase === 'gameover') return (
        <PlayGameShell title="Totopara Runner" icon="🏃" gradient="from-emerald-400 to-green-600">
            <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
                <Mascot mood="sad" size="md" message="Oops! You tripped! 💫" />
                <h2 className="text-2xl font-extrabold text-gray-800 mt-4 mb-2">Game Over!</h2>
                {isNewHighScore && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-2 mb-2 animate-bounce-in">
                        <span className="text-sm font-extrabold text-amber-600">🏆 New High Score!</span>
                    </div>
                )}
                <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-center"><p className="text-2xl font-extrabold text-amber-500">{score}</p><p className="text-xs text-muted-foreground">Score</p></div>
                        <div className="text-center"><p className="text-2xl font-extrabold text-blue-500">{Math.floor(distance)}m</p><p className="text-xs text-muted-foreground">Distance</p></div>
                        <div className="text-center"><p className="text-2xl font-extrabold text-yellow-500">🪙 {coinCount}</p><p className="text-xs text-muted-foreground">Coins</p></div>
                        <div className="text-center"><p className="text-2xl font-extrabold text-green-500">{cpCleared}/{MAX_CP}</p><p className="text-xs text-muted-foreground">Words</p></div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-muted-foreground">Best Score: <span className="font-bold text-amber-600">{Math.max(score, highScore)}</span></p>
                    </div>
                </div>
                <div className="mt-6 flex gap-3">
                    <button onClick={() => { sfxRef.current.playClick(); startGame(); }} className="btn-game bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3">Try Again 🔄</button>
                    <button onClick={() => setPhase('menu')} className="btn-game bg-white text-gray-700 border-2 border-gray-200 px-6 py-3">Menu</button>
                </div>
            </div>
        </PlayGameShell>
    );

    if (phase === 'results') return (
        <PlayGameShell title="Totopara Runner" icon="🏃" gradient="from-emerald-400 to-green-600">
            <div className="flex flex-col items-center justify-center min-h-[65vh] px-5 text-center animate-fade-in">
                {showConfetti && <Confetti />}
                <span className="text-6xl mb-3">🏆</span>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Totopara Champion!</h2>
                <p className="text-muted-foreground mb-4">You explored all {MAX_CP} checkpoints!</p>
                <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-xs">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center"><p className="text-3xl font-extrabold text-amber-500">{score}</p><p className="text-xs text-muted-foreground">Score</p></div>
                        <div className="text-center"><p className="text-3xl font-extrabold text-blue-500">{Math.floor(distance)}m</p><p className="text-xs text-muted-foreground">Distance</p></div>
                        <div className="text-center"><p className="text-3xl font-extrabold text-yellow-500">🪙 {coinCount}</p><p className="text-xs text-muted-foreground">Coins</p></div>
                        <div className="text-center"><p className="text-3xl font-extrabold text-green-500">{cpCleared}/{MAX_CP}</p><p className="text-xs text-muted-foreground">Words</p></div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-muted-foreground">Best Score: <span className="font-bold text-amber-600">{Math.max(score, highScore)}</span></p>
                    </div>
                </div>
                <Mascot mood="happy" size="sm" message="You're a Totopara explorer! ⭐🌿" className="mt-4" />
                <div className="mt-5 flex gap-3">
                    <button onClick={() => { sfxRef.current.playClick(); startGame(); }} className="btn-game bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3">Play Again 🔄</button>
                    <button onClick={() => window.history.back()} className="btn-game bg-white text-gray-700 border-2 border-gray-200 px-6 py-3">Back</button>
                </div>
            </div>
        </PlayGameShell>
    );

    // Countdown / Playing
    return (
        <PlayGameShell title="Totopara Runner" icon="🏃" gradient="from-emerald-400 to-green-600">
            <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
                <div className="flex items-center justify-between px-4 py-2 bg-white/60 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">🪙 {score}</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">🌿 {Math.floor(distance)}m</span>
                        {powerLabel && <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full animate-pulse">⚡ {powerLabel}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: MAX_CP }).map((_, i) => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < cpCleared ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        ))}
                    </div>
                </div>
                <div className="flex-1 relative overflow-hidden bg-sky-100" onClick={jump} onTouchStart={e => { e.preventDefault(); jump(); }}>
                    <canvas ref={canvasRef} className="block cursor-pointer absolute inset-0" style={{ touchAction: 'none' }} />
                    {phase === 'countdown' && <Countdown onDone={countdownDone} sfx={sfx} />}
                    {phase === 'playing' && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                            Tap to jump! Double tap for double jump
                        </div>
                    )}
                </div>
            </div>
        </PlayGameShell>
    );
}
