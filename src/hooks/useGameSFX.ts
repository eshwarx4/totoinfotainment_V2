// ==========================================
// GAME SFX SYSTEM — Web Audio API Synthesizer
// No external audio files needed
// ==========================================
import { useCallback, useRef, useEffect, useState } from 'react';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
    try {
        if (!audioCtx || audioCtx.state === 'closed') {
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => { });
        }
        return audioCtx;
    } catch {
        return null;
    }
}

// --- Utility helpers ---
function playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.15, detune = 0) {
    try {
        const ctx = getCtx();
        if (!ctx || ctx.state !== 'running') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.detune.value = detune;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration + 0.05);
        // Auto-cleanup
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch { } };
    } catch { /* ignore audio errors silently */ }
}

function playNoise(duration: number, vol = 0.06) {
    try {
        const ctx = getCtx();
        if (!ctx || ctx.state !== 'running') return;
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        if (bufferSize <= 0) return;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 0.5;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
        source.stop(ctx.currentTime + duration + 0.05);
        source.onended = () => { try { source.disconnect(); filter.disconnect(); gain.disconnect(); } catch { } };
    } catch { /* ignore */ }
}

// --- BGM refs ---
let bgmNodes: { oscs: OscillatorNode[]; lfos: OscillatorNode[]; gain: GainNode } | null = null;

// ==========================================
// SFX Functions
// ==========================================

/** Short UI click */
export function sfxClick() { playTone(800, 0.06, 'sine', 0.08); }

/** Correct answer — ascending happy chime */
export function sfxCorrect() {
    playTone(523, 0.12, 'sine', 0.13);
    setTimeout(() => playTone(659, 0.12, 'sine', 0.13), 80);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.15), 160);
}

/** Wrong answer — descending buzz */
export function sfxWrong() {
    playTone(300, 0.15, 'square', 0.06);
    setTimeout(() => playTone(220, 0.2, 'square', 0.05), 120);
}

/** Jump whoosh */
export function sfxJump() {
    try {
        const ctx = getCtx();
        if (!ctx || ctx.state !== 'running') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch { } };
    } catch { /* ignore */ }
    playNoise(0.08, 0.04);
}

/** Bow string release / shoot */
export function sfxShoot() {
    playTone(180, 0.08, 'sawtooth', 0.07);
    setTimeout(() => {
        playTone(350, 0.15, 'sine', 0.06);
        playNoise(0.1, 0.05);
    }, 30);
}

/** Arrow / object hit target */
export function sfxHit() {
    playTone(200, 0.1, 'triangle', 0.12);
    playNoise(0.08, 0.08);
}

/** Collect coin / item */
export function sfxCollect() {
    playTone(988, 0.08, 'sine', 0.1);
    setTimeout(() => playTone(1318, 0.15, 'sine', 0.12), 60);
}

/** Countdown beep */
export function sfxCountdown(final = false) {
    playTone(final ? 880 : 440, final ? 0.3 : 0.15, 'sine', 0.12);
}

/** Game over — sad descending */
export function sfxGameOver() {
    playTone(440, 0.2, 'triangle', 0.1);
    setTimeout(() => playTone(370, 0.2, 'triangle', 0.1), 200);
    setTimeout(() => playTone(330, 0.2, 'triangle', 0.1), 400);
    setTimeout(() => playTone(262, 0.4, 'triangle', 0.08), 600);
}

/** Victory fanfare */
export function sfxVictory() {
    playTone(523, 0.15, 'sine', 0.12);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 120);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 240);
    setTimeout(() => playTone(1047, 0.35, 'sine', 0.15), 360);
    setTimeout(() => playTone(784, 0.1, 'sine', 0.08), 500);
    setTimeout(() => playTone(1047, 0.5, 'sine', 0.15), 580);
}

/** Piece placement snap */
export function sfxSnap() {
    playTone(600, 0.06, 'sine', 0.1);
    playTone(900, 0.08, 'sine', 0.06);
}

/** Timer warning tick */
export function sfxTick() { playTone(660, 0.04, 'sine', 0.07); }

/** Streak bonus sparkle */
export function sfxStreak() {
    playTone(1047, 0.08, 'sine', 0.1);
    setTimeout(() => playTone(1319, 0.08, 'sine', 0.1), 60);
    setTimeout(() => playTone(1568, 0.15, 'sine', 0.12), 120);
}

/** Start gentle ambient BGM */
export function startBGM() {
    try {
        stopBGM();
        const ctx = getCtx();
        if (!ctx || ctx.state !== 'running') return;
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.03;
        masterGain.connect(ctx.destination);

        const notes = [261.63, 329.63, 392.00, 349.23]; // C E G F
        const oscs: OscillatorNode[] = [];
        const lfos: OscillatorNode[] = [];

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.detune.value = (i % 2 === 0 ? 1 : -1) * 3;
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.value = 0.15 + i * 0.05;
            lfoGain.gain.value = 2;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();
            osc.connect(masterGain);
            osc.start();
            oscs.push(osc);
            lfos.push(lfo);
        });

        bgmNodes = { oscs, lfos, gain: masterGain };
    } catch { /* ignore */ }
}

/** Stop BGM — properly cleanup all nodes */
export function stopBGM() {
    if (bgmNodes) {
        try {
            bgmNodes.oscs.forEach(o => { try { o.stop(); o.disconnect(); } catch { } });
            bgmNodes.lfos.forEach(o => { try { o.stop(); o.disconnect(); } catch { } });
            bgmNodes.gain.disconnect();
        } catch { /* ignore */ }
        bgmNodes = null;
    }
}

// ==========================================
// React Hook
// ==========================================
export function useGameSFX() {
    const [muted, setMuted] = useState(() => {
        try { return localStorage.getItem('game-sfx-muted') === 'true'; } catch { return false; }
    });
    const bgmStarted = useRef(false);

    useEffect(() => {
        try { localStorage.setItem('game-sfx-muted', String(muted)); } catch { }
    }, [muted]);

    // Cleanup BGM on unmount
    useEffect(() => {
        return () => { stopBGM(); bgmStarted.current = false; };
    }, []);

    const wrap = useCallback(<T extends (...args: any[]) => void>(fn: T) => {
        return ((...args: any[]) => {
            if (!muted) fn(...args);
        }) as unknown as T;
    }, [muted]);

    return {
        muted,
        setMuted,
        toggleMute: useCallback(() => setMuted(m => !m), []),
        playClick: wrap(sfxClick),
        playCorrect: wrap(sfxCorrect),
        playWrong: wrap(sfxWrong),
        playJump: wrap(sfxJump),
        playShoot: wrap(sfxShoot),
        playHit: wrap(sfxHit),
        playCollect: wrap(sfxCollect),
        playCountdown: wrap(sfxCountdown),
        playGameOver: wrap(sfxGameOver),
        playVictory: wrap(sfxVictory),
        playSnap: wrap(sfxSnap),
        playTick: wrap(sfxTick),
        playStreak: wrap(sfxStreak),
        startBGM: useCallback(() => { if (!muted && !bgmStarted.current) { startBGM(); bgmStarted.current = true; } }, [muted]),
        stopBGM: useCallback(() => { stopBGM(); bgmStarted.current = false; }, []),
    };
}
