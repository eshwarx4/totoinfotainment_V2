import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Tutorial step types for interactive learning
 */
export type TutorialActionType =
    | 'tap'           // Tap anywhere
    | 'tap-area'      // Tap specific area
    | 'drag'          // Drag gesture
    | 'hold'          // Hold/long press
    | 'wait'          // Just wait/watch
    | 'complete';     // Action completed by game

export interface InteractiveTutorialStep {
    id: string;
    action: TutorialActionType;
    icon: string;           // Big emoji/icon to show
    message: string;        // Short message (max 5-6 words)
    targetArea?: {          // Optional highlight area (percentage of screen)
        x: number;          // 0-100
        y: number;          // 0-100
        width: number;      // 0-100
        height: number;     // 0-100
    };
    highlightBottom?: boolean;  // Highlight bottom area (for bow/controls)
    highlightTop?: boolean;     // Highlight top area (for targets)
    showHand?: boolean;         // Show animated hand gesture
    handPosition?: { x: number; y: number };  // Hand position (percentage)
    completionMessage?: string; // Message after completing step
}

interface TutorialState {
    currentStep: number;
    completed: boolean;
    showingFeedback: boolean;
    feedbackMessage: string;
}

interface Props {
    gameId: string;
    steps: InteractiveTutorialStep[];
    onComplete: () => void;
    onStepAction?: (stepId: string) => void;  // Called when user performs action
    gameElement?: React.ReactNode;  // The actual game to show in background
}

/**
 * Hook to check if tutorial should show for a game
 */
export function useTutorial(gameId: string) {
    const key = `tutorial-seen-${gameId}`;
    const [seen, setSeen] = useState(() => {
        try { return localStorage.getItem(key) === '1'; } catch { return false; }
    });

    const markSeen = useCallback(() => {
        try { localStorage.setItem(key, '1'); } catch { }
        setSeen(true);
    }, [key]);

    const resetTutorial = useCallback(() => {
        try { localStorage.removeItem(key); } catch { }
        setSeen(false);
    }, [key]);

    return { shouldShow: !seen, markSeen, resetTutorial };
}

/**
 * Animated hand component for gestures
 */
function AnimatedHand({ gesture, position }: { gesture: TutorialActionType; position?: { x: number; y: number } }) {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setFrame(f => f + 1), 50);
        return () => clearInterval(interval);
    }, []);

    const x = position?.x ?? 50;
    const y = position?.y ?? 60;

    if (gesture === 'tap' || gesture === 'tap-area') {
        const scale = 1 + Math.sin(frame * 0.15) * 0.15;
        const tapY = y + Math.sin(frame * 0.2) * 8;
        return (
            <div
                className="absolute pointer-events-none z-50"
                style={{
                    left: `${x}%`,
                    top: `${tapY}%`,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transition: 'transform 0.1s ease-out'
                }}
            >
                <span className="text-5xl drop-shadow-lg">👆</span>
                {/* Tap ripple effect */}
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ opacity: Math.abs(Math.sin(frame * 0.1)) }}
                >
                    <div className="w-16 h-16 rounded-full border-4 border-white/50 animate-ping" />
                </div>
            </div>
        );
    }

    if (gesture === 'drag') {
        const dragX = x + Math.sin(frame * 0.08) * 15;
        const dragY = y + Math.cos(frame * 0.08) * 20;
        return (
            <div
                className="absolute pointer-events-none z-50"
                style={{
                    left: `${dragX}%`,
                    top: `${dragY}%`,
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <span className="text-5xl drop-shadow-lg">👆</span>
                {/* Drag trail */}
                <div
                    className="absolute w-20 h-1 bg-gradient-to-r from-white/60 to-transparent rounded-full"
                    style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(-100%, -50%) rotate(${Math.atan2(Math.cos(frame * 0.08), Math.sin(frame * 0.08)) * 180 / Math.PI}deg)`,
                    }}
                />
            </div>
        );
    }

    if (gesture === 'hold') {
        const pulse = 1 + Math.sin(frame * 0.1) * 0.1;
        return (
            <div
                className="absolute pointer-events-none z-50"
                style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: `translate(-50%, -50%) scale(${pulse})`,
                }}
            >
                <span className="text-5xl drop-shadow-lg">👇</span>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="w-20 h-20 rounded-full border-4 border-yellow-400/70"
                        style={{
                            transform: `scale(${1 + (frame % 30) / 30})`,
                            opacity: 1 - (frame % 30) / 30
                        }}
                    />
                </div>
            </div>
        );
    }

    return null;
}

/**
 * Highlight overlay for specific areas
 */
function HighlightOverlay({ area, pulse }: { area?: { x: number; y: number; width: number; height: number }; pulse?: boolean }) {
    if (!area) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-40">
            {/* Dark overlay with cutout */}
            <svg className="w-full h-full">
                <defs>
                    <mask id="highlight-mask">
                        <rect width="100%" height="100%" fill="white" />
                        <rect
                            x={`${area.x}%`}
                            y={`${area.y}%`}
                            width={`${area.width}%`}
                            height={`${area.height}%`}
                            fill="black"
                            rx="12"
                        />
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0,0,0,0.6)"
                    mask="url(#highlight-mask)"
                />
            </svg>
            {/* Glowing border around highlight area */}
            <div
                className={`absolute border-4 border-yellow-400 rounded-xl ${pulse ? 'animate-pulse' : ''}`}
                style={{
                    left: `${area.x}%`,
                    top: `${area.y}%`,
                    width: `${area.width}%`,
                    height: `${area.height}%`,
                    boxShadow: '0 0 20px rgba(250, 204, 21, 0.5), inset 0 0 20px rgba(250, 204, 21, 0.2)'
                }}
            />
        </div>
    );
}

/**
 * Feedback popup after completing an action
 */
function FeedbackPopup({ message, emoji }: { message: string; emoji: string }) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
            <div
                className="bg-white rounded-3xl px-8 py-6 shadow-2xl text-center animate-bounce"
                style={{ animation: 'popIn 0.4s ease-out' }}
            >
                <span className="text-6xl block mb-2">{emoji}</span>
                <p className="text-xl font-extrabold text-gray-800">{message}</p>
            </div>
            <style>{`
                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

/**
 * Progress indicator showing which step we're on
 */
function TutorialProgress({ current, total }: { current: number; total: number }) {
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i < current
                            ? 'bg-green-500 scale-100'
                            : i === current
                                ? 'bg-yellow-400 scale-125 animate-pulse'
                                : 'bg-gray-300 scale-100'
                    }`}
                />
            ))}
        </div>
    );
}

/**
 * Main instruction banner
 */
function InstructionBanner({ icon, message, position = 'center' }: { icon: string; message: string; position?: 'top' | 'center' | 'bottom' }) {
    const positionClass = {
        top: 'top-20',
        center: 'top-1/2 -translate-y-1/2',
        bottom: 'bottom-32'
    }[position];

    return (
        <div className={`absolute left-1/2 -translate-x-1/2 ${positionClass} z-[100] pointer-events-none`}>
            <div
                className="bg-white rounded-2xl px-6 py-4 shadow-2xl text-center min-w-[200px]"
                style={{ animation: 'slideUp 0.3s ease-out' }}
            >
                <span className="text-5xl block mb-2">{icon}</span>
                <p className="text-lg font-bold text-gray-800">{message}</p>
            </div>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

/**
 * Interactive Tutorial Overlay
 * Shows real game in background with guided actions
 */
export default function GameTutorial({ gameId, steps, onComplete, onStepAction }: Props) {
    const [state, setState] = useState<TutorialState>({
        currentStep: 0,
        completed: false,
        showingFeedback: false,
        feedbackMessage: ''
    });

    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const currentStepData = steps[state.currentStep];
    const isLastStep = state.currentStep === steps.length - 1;

    // Encouragement messages
    const feedbackMessages = [
        { emoji: '🌟', message: 'Great job!' },
        { emoji: '👏', message: 'Well done!' },
        { emoji: '✨', message: 'Perfect!' },
        { emoji: '🎉', message: 'Awesome!' },
        { emoji: '💪', message: "You're doing great!" },
    ];

    const almostThereMessages = [
        { emoji: '🔥', message: "You're almost there!" },
        { emoji: '🚀', message: 'One more step!' },
        { emoji: '⭐', message: "You're ready!" },
    ];

    const handleStepComplete = useCallback(() => {
        if (state.showingFeedback) return;

        // Show feedback
        const isAlmostDone = state.currentStep >= steps.length - 2;
        const feedbackList = isAlmostDone ? almostThereMessages : feedbackMessages;
        const feedback = feedbackList[Math.floor(Math.random() * feedbackList.length)];

        setState(s => ({
            ...s,
            showingFeedback: true,
            feedbackMessage: feedback.message
        }));

        // Notify game of action
        if (onStepAction && currentStepData) {
            onStepAction(currentStepData.id);
        }

        // Move to next step after delay
        setTimeout(() => {
            if (isLastStep) {
                // Tutorial complete!
                try { localStorage.setItem(`tutorial-seen-${gameId}`, '1'); } catch { }
                setState(s => ({ ...s, completed: true, showingFeedback: false }));
                setTimeout(onComplete, 500);
            } else {
                setState(s => ({
                    ...s,
                    currentStep: s.currentStep + 1,
                    showingFeedback: false
                }));
            }
        }, 1200);
    }, [state.currentStep, state.showingFeedback, steps.length, isLastStep, gameId, onComplete, onStepAction, currentStepData]);

    // Handle touch/click interactions
    const handleInteraction = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        if (state.showingFeedback || state.completed) return;

        const action = currentStepData?.action;

        if (action === 'tap' || action === 'tap-area') {
            handleStepComplete();
        }
    }, [state.showingFeedback, state.completed, currentStepData, handleStepComplete]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (state.showingFeedback || state.completed) return;

        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };

        const action = currentStepData?.action;

        if (action === 'hold') {
            actionTimeoutRef.current = setTimeout(() => {
                handleStepComplete();
            }, 800);
        }
    }, [state.showingFeedback, state.completed, currentStepData, handleStepComplete]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (state.showingFeedback || state.completed || !touchStartRef.current) return;

        const touch = e.touches[0];
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const action = currentStepData?.action;

        if (action === 'drag' && distance > 50) {
            handleStepComplete();
        }

        // Cancel hold if moved
        if (action === 'hold' && distance > 20 && actionTimeoutRef.current) {
            clearTimeout(actionTimeoutRef.current);
        }
    }, [state.showingFeedback, state.completed, currentStepData, handleStepComplete]);

    const handleTouchEnd = useCallback(() => {
        touchStartRef.current = null;
        if (actionTimeoutRef.current) {
            clearTimeout(actionTimeoutRef.current);
        }
    }, []);

    // Auto-advance for 'wait' type steps
    useEffect(() => {
        if (currentStepData?.action === 'wait') {
            const timeout = setTimeout(handleStepComplete, 2000);
            return () => clearTimeout(timeout);
        }
    }, [currentStepData, handleStepComplete]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (actionTimeoutRef.current) {
                clearTimeout(actionTimeoutRef.current);
            }
        };
    }, []);

    if (state.completed) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-3xl px-10 py-8 shadow-2xl text-center animate-bounce">
                    <span className="text-7xl block mb-3">🎮</span>
                    <p className="text-2xl font-extrabold text-gray-800">Let's Play!</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-[90]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleInteraction}
        >
            {/* Progress indicator */}
            <TutorialProgress current={state.currentStep} total={steps.length} />

            {/* Highlight area if specified */}
            {currentStepData?.targetArea && (
                <HighlightOverlay area={currentStepData.targetArea} pulse />
            )}

            {/* Bottom highlight */}
            {currentStepData?.highlightBottom && (
                <HighlightOverlay area={{ x: 0, y: 70, width: 100, height: 30 }} pulse />
            )}

            {/* Top highlight */}
            {currentStepData?.highlightTop && (
                <HighlightOverlay area={{ x: 20, y: 10, width: 60, height: 40 }} pulse />
            )}

            {/* Semi-transparent overlay for non-highlighted areas */}
            {!currentStepData?.targetArea && !currentStepData?.highlightBottom && !currentStepData?.highlightTop && (
                <div className="absolute inset-0 bg-black/40 pointer-events-none z-30" />
            )}

            {/* Instruction banner */}
            {!state.showingFeedback && currentStepData && (
                <InstructionBanner
                    icon={currentStepData.icon}
                    message={currentStepData.message}
                    position={currentStepData.highlightBottom ? 'top' : currentStepData.highlightTop ? 'bottom' : 'center'}
                />
            )}

            {/* Animated hand gesture */}
            {!state.showingFeedback && currentStepData?.showHand && (
                <AnimatedHand
                    gesture={currentStepData.action}
                    position={currentStepData.handPosition}
                />
            )}

            {/* Feedback popup */}
            {state.showingFeedback && (
                <FeedbackPopup
                    message={state.feedbackMessage}
                    emoji={feedbackMessages.find(f => f.message === state.feedbackMessage)?.emoji ||
                           almostThereMessages.find(f => f.message === state.feedbackMessage)?.emoji || '🌟'}
                />
            )}
        </div>
    );
}

/**
 * Pre-built tutorial steps for common game types
 */
export const ARCHER_TUTORIAL_STEPS: InteractiveTutorialStep[] = [
    {
        id: 'welcome',
        action: 'tap',
        icon: '🏹',
        message: 'Tap to start!',
        showHand: true,
        handPosition: { x: 50, y: 60 }
    },
    {
        id: 'see-target',
        action: 'wait',
        icon: '🎯',
        message: 'See the targets!',
        highlightTop: true,
    },
    {
        id: 'aim',
        action: 'drag',
        icon: '👆',
        message: 'Drag up to aim!',
        highlightBottom: true,
        showHand: true,
        handPosition: { x: 30, y: 80 }
    },
    {
        id: 'shoot',
        action: 'tap',
        icon: '🚀',
        message: 'Release to shoot!',
        showHand: true,
        handPosition: { x: 30, y: 70 },
        completionMessage: "You're ready!"
    }
];

export const RUNNER_TUTORIAL_STEPS: InteractiveTutorialStep[] = [
    {
        id: 'welcome',
        action: 'tap',
        icon: '🏃',
        message: 'Tap to start!',
        showHand: true,
        handPosition: { x: 50, y: 60 }
    },
    {
        id: 'see-runner',
        action: 'wait',
        icon: '👀',
        message: 'Watch the runner!',
        targetArea: { x: 5, y: 50, width: 25, height: 30 }
    },
    {
        id: 'jump',
        action: 'tap',
        icon: '🦘',
        message: 'Tap to jump!',
        showHand: true,
        handPosition: { x: 50, y: 50 },
        completionMessage: "You're ready!"
    }
];

export const PUZZLE_TUTORIAL_STEPS: InteractiveTutorialStep[] = [
    {
        id: 'welcome',
        action: 'tap',
        icon: '🧩',
        message: 'Tap to start!',
        showHand: true,
        handPosition: { x: 50, y: 60 }
    },
    {
        id: 'see-pieces',
        action: 'wait',
        icon: '👀',
        message: 'See the pieces!',
        highlightBottom: true,
    },
    {
        id: 'pick-piece',
        action: 'tap',
        icon: '👆',
        message: 'Tap a piece!',
        highlightBottom: true,
        showHand: true,
        handPosition: { x: 50, y: 85 }
    },
    {
        id: 'place-piece',
        action: 'tap',
        icon: '📍',
        message: 'Tap to place it!',
        highlightTop: true,
        showHand: true,
        handPosition: { x: 50, y: 40 },
        completionMessage: "You're ready!"
    }
];
