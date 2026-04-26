import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { ArrowLeft, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { fetchConceptSlides } from '@/lib/supabaseQueries';
import type { ConceptSlideRow } from '@/lib/supabaseQueries';

const CONCEPT_NAMES: Record<string, string> = {
    '770e8400-e29b-41d4-a716-446655440001': 'Evaporation',
    '770e8400-e29b-41d4-a716-446655440002': 'Plant Growth',
    '770e8400-e29b-41d4-a716-446655440003': 'Food Sources',
    '770e8400-e29b-41d4-a716-446655440004': 'Seasons & Monsoon',
    '770e8400-e29b-41d4-a716-446655440005': 'Water Cycle',
    '770e8400-e29b-41d4-a716-446655440006': 'Photosynthesis',
    '770e8400-e29b-41d4-a716-446655440007': 'Seasons',
};

export default function ConceptViewer() {
    const { conceptId } = useParams<{ conceptId: string }>();
    const navigate = useNavigate();
    const game = useGame();
    const [slides, setSlides] = useState<ConceptSlideRow[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);

    const conceptTitle = CONCEPT_NAMES[conceptId || ''] || 'Concept';

    useEffect(() => {
        if (!conceptId) return;
        setLoading(true);
        fetchConceptSlides(conceptId)
            .then(data => setSlides(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [conceptId]);

    const slide = slides[currentSlide];
    const isLast = currentSlide === slides.length - 1;
    const isCompleted = (game.completedConcepts || []).includes(conceptId || '');

    const playAudio = (url: string, type: string) => {
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(url);
        audioRef.current = audio;
        setPlayingAudio(type);
        audio.play().catch(() => { });
        audio.onended = () => setPlayingAudio(null);
    };

    const handleComplete = () => {
        if (conceptId) game.markConceptCompleted(conceptId);
        navigate('/learn');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ background: 'linear-gradient(180deg, #ede9fe 0%, #f5f3ff 50%, #ede9fe 100%)' }}>
                <div className="text-center">
                    <div className="text-5xl mb-3 animate-pulse">📖</div>
                    <p className="text-violet-400 font-bold">Loading concept...</p>
                </div>
            </div>
        );
    }

    if (!slide) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6"
                style={{ background: 'linear-gradient(180deg, #ede9fe 0%, #f5f3ff 50%, #ede9fe 100%)' }}>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl max-w-sm border border-violet-100">
                    <p className="text-gray-500 mb-4">No slides available for this concept yet.</p>
                    <button onClick={() => navigate('/learn')}
                        className="bg-violet-600 text-white font-bold px-6 py-3 rounded-xl active:scale-95 transition-all">
                        Back to Learn
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen screen-enter flex flex-col"
            style={{ background: 'linear-gradient(180deg, #ede9fe 0%, #f5f3ff 40%, #faf5ff 100%)' }}>
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white px-4 pt-4 pb-3 shadow-lg">
                <div className="max-w-lg mx-auto">
                    <button
                        onClick={() => navigate('/learn')}
                        className="flex items-center gap-1.5 text-white/80 hover:text-white mb-2 text-sm font-semibold
                                   bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <h1 className="text-xl font-bold drop-shadow">{conceptTitle}</h1>
                    <div className="flex items-center gap-2 mt-2.5">
                        {slides.map((_, i) => (
                            <div
                                key={i}
                                className={`flex-1 h-1.5 rounded-full transition-all duration-300
                                    ${i <= currentSlide ? 'bg-white' : 'bg-white/25'}`}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-white/60 mt-1.5">
                        Slide {currentSlide + 1} of {slides.length}
                    </p>
                </div>
            </div>

            {/* Slide content */}
            <div className="flex-1 max-w-lg mx-auto w-full px-4 py-5">
                {/* Image */}
                {slide.image_url && (
                    <div className="rounded-2xl overflow-hidden mb-4 bg-white shadow-lg border border-violet-100/50">
                        <img
                            src={slide.image_url}
                            alt={conceptTitle}
                            className="w-full aspect-[4/3] object-contain bg-white"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Narration text */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 mb-4 shadow-md border border-violet-100/30">
                    <p className="text-base leading-relaxed text-gray-700">
                        {slide.english_narration}
                    </p>
                    {slide.toto_narration && slide.toto_narration !== slide.english_narration && (
                        <p className="text-sm text-violet-600 mt-3 pt-3 border-t border-violet-100 italic">
                            {slide.toto_narration}
                        </p>
                    )}
                </div>

                {/* Audio buttons */}
                <div className="flex gap-3 mb-4">
                    {slide.audio_english_url && (
                        <button
                            onClick={() => playAudio(slide.audio_english_url!, 'eng')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all
                                shadow-sm active:scale-95
                                ${playingAudio === 'eng'
                                    ? 'bg-blue-500 text-white shadow-blue-200'
                                    : 'bg-white/80 backdrop-blur-sm text-blue-600 border border-blue-100 hover:bg-blue-50'}`}
                        >
                            <Volume2 className="w-4 h-4" />
                            English
                        </button>
                    )}
                    {slide.audio_toto_url && (
                        <button
                            onClick={() => playAudio(slide.audio_toto_url!, 'toto')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all
                                shadow-sm active:scale-95
                                ${playingAudio === 'toto'
                                    ? 'bg-emerald-500 text-white shadow-emerald-200'
                                    : 'bg-white/80 backdrop-blur-sm text-emerald-600 border border-emerald-100 hover:bg-emerald-50'}`}
                        >
                            <Volume2 className="w-4 h-4" />
                            Toto
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-violet-100/30 px-4 py-3 shadow-up">
                <div className="max-w-lg mx-auto flex gap-3">
                    <button
                        onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                        disabled={currentSlide === 0}
                        className="flex items-center justify-center gap-1 px-5 py-3 rounded-xl
                                   bg-gray-100 text-gray-600 font-bold text-sm disabled:opacity-30
                                   transition-all active:scale-95"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Prev
                    </button>
                    {isLast ? (
                        <button
                            onClick={handleComplete}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white
                                       font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all"
                        >
                            {isCompleted ? 'Review Complete ✅' : 'Complete (+20 🪙)'}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentSlide(currentSlide + 1)}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white
                                       font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all
                                       flex items-center justify-center gap-1"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
