import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useGame } from '@/state/GameContext';
import { WorldId } from '@/types/game';
import { Story } from '@/types/content';
import { getWorldConfig } from '@/config/worlds';
import { fetchConcepts, fetchConceptSlides, fetchStories } from '@/lib/supabaseQueries';
import { transformConceptToStory, transformStoryRowToStory } from '@/lib/dataTransformers';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export default function StoryScreen() {
  const { worldId, storyType } = useParams<{ worldId: string; storyType: string }>();
  const navigate = useNavigate();
  const game = useGame();

  const wid = worldId as WorldId;
  const worldConfig = getWorldConfig(wid);
  const isConcept = storyType === 'concept';

  const [story, setStory] = useState<Story | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function loadStory() {
      try {
        if (isConcept) {
          const concepts = await fetchConcepts();
          if (concepts.length > 0) {
            const concept = concepts[0];
            const slides = await fetchConceptSlides(concept.id);
            setStory(transformConceptToStory(concept, slides));
          }
        } else {
          const stories = await fetchStories();
          const folk = stories.filter(s => s.type?.toLowerCase().includes('folk'));
          if (folk.length > 0) {
            setStory(transformStoryRowToStory(folk[0]));
          } else if (stories.length > 0) {
            setStory(transformStoryRowToStory(stories[0]));
          }
        }
      } catch (e) {
        console.error('Failed to load story:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStory();
  }, [isConcept]);

  const handleComplete = () => {
    if (story && !completed) {
      game.completeStory(wid, isConcept ? 'concept' : 'folk', story.id);
      setCompleted(true);
    }
  };

  const handleNext = () => {
    if (story && currentSlide < story.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${worldConfig.bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-5xl mb-4 mascot-bounce">📖</div>
          <p className="text-white/80 font-bold text-lg drop-shadow">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${worldConfig.bgGradient} flex items-center justify-center px-6`}>
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl max-w-sm border border-white/50">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-bold mb-2 text-gray-800">No Story Available</h2>
          <p className="text-gray-500 mb-4 text-sm">
            This story hasn't been added yet.
          </p>
          <button onClick={() => navigate(`/world/${wid}`)}
            className="bg-gray-800 text-white font-bold px-6 py-3 rounded-xl active:scale-95 transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const slide = story.slides[currentSlide];
  const isLastSlide = currentSlide === story.slides.length - 1;

  return (
    <div className="min-h-screen flex flex-col screen-enter"
      style={{ background: 'linear-gradient(180deg, #fefce8 0%, #fffbeb 40%, #fef3c7 100%)' }}
    >
      {/* Header */}
      <div className={`sticky top-0 z-30 bg-gradient-to-r ${worldConfig.bgGradient} shadow-md`}>
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/world/${wid}`)}
              className="flex items-center gap-1.5 text-white/80 hover:text-white font-semibold text-sm
                         bg-black/10 backdrop-blur-sm px-3 py-1.5 rounded-full active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <span className="text-sm font-bold text-white drop-shadow flex items-center gap-1.5">
              {isConcept ? '📘' : '📜'} {isConcept ? 'Concept Story' : 'Folk Story'}
            </span>
            <span className="bg-black/15 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs text-white font-bold">
              {currentSlide + 1}/{story.slides.length}
            </span>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1 mt-2.5">
            {story.slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= currentSlide ? 'bg-white' : 'bg-white/25'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Story content */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-5">
        {/* Image */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-white shadow-lg mb-4 border border-amber-100">
          <img
            src={slide.imageUrl}
            alt={slide.english}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
        </div>

        {/* Text */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 mb-4 flex-1 shadow-md border border-amber-100/50">
          <p className="text-lg font-bold mb-2 text-gray-800 leading-relaxed">
            {slide.toto}
          </p>
          <p className="text-base text-gray-500 leading-relaxed">
            {slide.english}
          </p>
        </div>

        {/* Audio */}
        <div className="flex gap-3 mb-4">
          {slide.audioToto && (
            <AudioPlayer audioUrl={slide.audioToto} label="Toto" variant="toto" />
          )}
          {slide.audioEnglish && (
            <AudioPlayer audioUrl={slide.audioEnglish} label="English" variant="english" />
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="flex-1 bg-white/60 backdrop-blur-sm text-gray-600 font-bold py-3.5 rounded-2xl
                       border border-gray-200 disabled:opacity-30 active:scale-95 transition-all
                       flex items-center justify-center gap-1"
          >
            <ChevronLeft className="w-5 h-5" />
            Prev
          </button>
          {!isLastSlide ? (
            <button onClick={handleNext}
              className={`flex-1 bg-gradient-to-r ${worldConfig.bgGradient} text-white font-bold py-3.5 rounded-2xl
                         shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1`}>
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : completed ? (
            <button
              onClick={() => navigate(`/world/${wid}`)}
              className="flex-1 bg-emerald-500 text-white font-bold py-3.5 rounded-2xl shadow-lg
                         active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              <CheckCircle className="w-5 h-5" /> Done!
            </button>
          ) : (
            <button onClick={handleComplete}
              className={`flex-1 bg-gradient-to-r ${worldConfig.bgGradient} text-white font-bold py-3.5 rounded-2xl
                         shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1`}>
              Complete! 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
