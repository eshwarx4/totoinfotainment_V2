import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useGame } from '@/state/GameContext';

interface Props {
    title: string;
    icon: string;
    gradient: string;
    children: React.ReactNode;
}

export default function PlayGameShell({ title, icon, gradient, children }: Props) {
    const navigate = useNavigate();
    const game = useGame();
    const totalProgress = game.getTotalProgress();

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
            <div className="play-zone-bg opacity-50" />

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Top bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-xl border-b border-white/30">
                    <button
                        onClick={() => navigate('/play')}
                        className="w-10 h-10 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center active:scale-90 transition-transform shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{icon}</span>
                        <h1 className="text-lg font-extrabold text-gray-800">{title}</h1>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-bold text-amber-600">{totalProgress.totalCoins}</span>
                    </div>
                </div>

                {/* Game content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
