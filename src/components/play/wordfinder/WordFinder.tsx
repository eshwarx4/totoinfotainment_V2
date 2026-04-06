import PlayGameShell from '@/components/play/PlayGameShell';
import Mascot from '@/components/mascot/Mascot';

export default function WordFinder() {
    return (
        <PlayGameShell title="Word Finder" icon="🔍" gradient="from-pink-400 to-rose-500">
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
                <div className="game-card-icon-float">
                    <span className="text-7xl block mb-4">🔍</span>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Word Finder</h2>
                <p className="text-muted-foreground mb-6">Find all the words hidden in scenes!</p>
                <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 mb-6 max-w-xs">
                    <p className="text-sm text-pink-700 font-semibold">🎯 Coming in Phase 5</p>
                    <p className="text-xs text-pink-500 mt-1">
                        "Find: Sun, Tree, Water" — tap the right objects!
                    </p>
                </div>
                <Mascot mood="thinking" size="sm" message="Can you spot them all? 👀" />
            </div>
        </PlayGameShell>
    );
}
