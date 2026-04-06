import PlayGameShell from '@/components/play/PlayGameShell';
import Mascot from '@/components/mascot/Mascot';

export default function BlockBuilder() {
    return (
        <PlayGameShell title="Block Builder" icon="🏗️" gradient="from-sky-400 to-blue-600">
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
                <div className="game-card-icon-float">
                    <span className="text-7xl block mb-4">🏗️</span>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Block Builder</h2>
                <p className="text-muted-foreground mb-6">Drag blocks to build shapes & learn words!</p>
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 mb-6 max-w-xs">
                    <p className="text-sm text-sky-700 font-semibold">🎯 Coming in Phase 5</p>
                    <p className="text-xs text-sky-500 mt-1">
                        Build houses, trees & more to unlock vocabulary
                    </p>
                </div>
                <Mascot mood="happy" size="sm" message="Build something amazing! 🏠🌳" />
            </div>
        </PlayGameShell>
    );
}
