import PlayGameShell from '@/components/play/PlayGameShell';
import Mascot from '@/components/mascot/Mascot';

export default function TreasureHunt() {
    return (
        <PlayGameShell title="Treasure Hunt" icon="🗺️" gradient="from-amber-400 to-orange-500">
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
                <div className="game-card-icon-float">
                    <span className="text-7xl block mb-4">🗺️</span>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Treasure Hunt</h2>
                <p className="text-muted-foreground mb-6">Explore scenes and find hidden objects!</p>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 max-w-xs">
                    <p className="text-sm text-amber-700 font-semibold">🎯 Coming in Phase 4</p>
                    <p className="text-xs text-amber-500 mt-1">
                        Timed exploration with increasing difficulty
                    </p>
                </div>
                <Mascot mood="thinking" size="sm" message="Hidden treasures await! 🔍✨" />
            </div>
        </PlayGameShell>
    );
}
