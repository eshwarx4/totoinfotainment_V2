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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-3 animate-pulse">📖</div>
                    <p className="text-muted-foreground">Loading concept...</p>
                </div>
            </div>
        );
    }

    if (!slide) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-6">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">No slides available for this concept yet.</p>
                    <button onClick={() => navigate('/learn')} className="btn-game-primary">Back to Learn</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white screen-enter flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white px-4 pt-4 pb-3">
                <div className="max-w-lg mx-auto">
                    <button
                        onClick={() => navigate('/learn')}
                        className="flex items-center gap-1 text-white/80 hover:text-white mb-2 text-sm font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <h1 className="text-xl font-bold">{conceptTitle}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        {slides.map((_, i) => (
                            <div
                                key={i}
                                className={`flex-1 h-1.5 rounded-full transition-all
                  ${i <= currentSlide ? 'bg-white' : 'bg-white/30'}`}
                            />
                        ))}
                    </div>
                    <p className="text-xs opacity-70 mt-1">Slide {currentSlide + 1} of {slides.length}</p>
                </div>
            </div>

            {/* Slide content */}
            <div className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
                {/* Image — large and clear */}
                {slide.image_url && (
                    <div className="rounded-2xl overflow-hidden mb-4 bg-gray-50 border border-gray-100">
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

                {/* Narration text only — clean, no scene/tagline noise */}
                <div className="card-game p-4 mb-4">
                    <p className="text-base leading-relaxed text-foreground">
                        {slide.english_narration}
                    </p>
                    {slide.toto_narration && slide.toto_narration !== slide.english_narration && (
                        <p className="text-sm text-game-primary mt-3 pt-3 border-t border-border italic">
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
                ${playingAudio === 'eng'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                        >
                            <Volume2 className="w-4 h-4" />
                            English
                        </button>
                    )}
                    {slide.audio_toto_url && (
                        <button
                            onClick={() => playAudio(slide.audio_toto_url!, 'toto')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all
                ${playingAudio === 'toto'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        >
                            <Volume2 className="w-4 h-4" />
                            Toto
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="sticky bottom-0 bg-white border-t border-border px-4 py-3">
                <div className="max-w-lg mx-auto flex gap-3">
                    <button
                        onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                        disabled={currentSlide === 0}
                        className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl border-2 border-border
                     font-bold text-sm disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Prev
                    </button>
                    {isLast ? (
                        <button
                            onClick={handleComplete}
                            className="flex-1 btn-game-primary text-base"
                        >
                            {isCompleted ? 'Review Complete ✅' : 'Complete (+20 🪙)'}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentSlide(currentSlide + 1)}
                            className="flex-1 btn-game-primary text-base flex items-center justify-center gap-1"
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
