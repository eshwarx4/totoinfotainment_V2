import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useGame } from '@/state/GameContext';
import { WorldId } from '@/types/game';
import { Story } from '@/types/content';
import { getWorldConfig } from '@/config/worlds';
import { fetchConcepts, fetchConceptSlides, fetchStories } from '@/lib/supabaseQueries';
import { transformConceptToStory, transformStoryRowToStory } from '@/lib/dataTransformers';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

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
            // Pick a concept (simple: first one for now)
            const concept = concepts[0];
            const slides = await fetchConceptSlides(concept.id);
            setStory(transformConceptToStory(concept, slides));
          }
        } else {
          const stories = await fetchStories();
          // Pick a folk story
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 mascot-bounce">📖</div>
          <p className="text-muted-foreground font-semibold">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-bold mb-2">No Story Available</h2>
          <p className="text-muted-foreground mb-4">
            This story hasn't been added yet.
          </p>
          <button onClick={() => navigate(`/world/${wid}`)} className="btn-game-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const slide = story.slides[currentSlide];
  const isLastSlide = currentSlide === story.slides.length - 1;

  return (
    <div className="min-h-screen bg-white flex flex-col screen-enter">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/world/${wid}`)}
              className="flex items-center gap-1 text-muted-foreground font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <span className="text-sm font-bold">
              {isConcept ? '📘 Concept Story' : '📜 Folk Story'}
            </span>
            <span className="text-xs text-muted-foreground">
              {currentSlide + 1}/{story.slides.length}
            </span>
          </div>
          {/* Progress */}
          <div className="flex gap-1 mt-2">
            {story.slides.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${i <= currentSlide ? 'bg-game-primary' : 'bg-muted'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Story content */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-6">
        {/* Image */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-muted mb-4">
          <img
            src={slide.imageUrl}
            alt={slide.english}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
        </div>

        {/* Text */}
        <div className="card-game p-5 mb-4 flex-1">
          <p className="text-lg font-bold mb-2 text-foreground leading-relaxed">
            {slide.toto}
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
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
            className="flex-1 btn-game-secondary disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5 inline mr-1" />
            Prev
          </button>
          {!isLastSlide ? (
            <button onClick={handleNext} className="flex-1 btn-game-primary">
              Next
              <ChevronRight className="w-5 h-5 inline ml-1" />
            </button>
          ) : completed ? (
            <button
              onClick={() => navigate(`/world/${wid}`)}
              className="flex-1 btn-game-primary"
            >
              Done! ✅
            </button>
          ) : (
            <button onClick={handleComplete} className="flex-1 btn-game-primary">
              Complete Story! 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
