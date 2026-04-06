import PlayGameShell from '@/components/play/PlayGameShell';
import Mascot from '@/components/mascot/Mascot';

export default function QuickChallenge() {
    return (
        <PlayGameShell title="Quick Challenge" icon="⚡" gradient="from-red-400 to-orange-500">
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
                <div className="game-card-icon-float">
                    <span className="text-7xl block mb-4">⚡</span>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Quick Challenge</h2>
                <p className="text-muted-foreground mb-6">Rapid-fire questions — beat the clock!</p>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 max-w-xs">
                    <p className="text-sm text-red-700 font-semibold">🎯 Coming in Phase 5</p>
                    <p className="text-xs text-red-500 mt-1">
                        Timer-based speed rounds for max XP
                    </p>
                </div>
                <Mascot mood="excited" size="sm" message="How fast can you go? ⚡🔥" />
            </div>
        </PlayGameShell>
    );
}
