import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { CoinPopup } from "@/components/effects/CoinPopup";
import { useCoins } from "@/contexts/CoinContext";
import { COIN_REWARDS } from "@/types/gamification";
import { Story } from "@/types/content";
import { fetchConcepts, fetchConceptSlides, fetchStories } from "@/lib/supabaseQueries";
import { transformConceptToStory, transformStoryRowToStory } from "@/lib/dataTransformers";

export default function StoryViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const coinSystem = useCoins();
  const [story, setStory] = useState<Story | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [loading, setLoading] = useState(true);
  const [coinPopup, setCoinPopup] = useState<number | null>(null);

  useEffect(() => {
    const loadStory = async () => {
      if (!id) return;
      try {
        setLoading(true);
        
        // Try to find in concepts first
        const concepts = await fetchConcepts();
        const foundConcept = concepts.find(c => c.id === id);
        
        if (foundConcept) {
          const slides = await fetchConceptSlides(foundConcept.id);
          if (slides.length > 0) {
            setStory(transformConceptToStory(foundConcept, slides));
            setLoading(false);
            return;
          }
        }

        // Try to find in folk stories
        const folkStories = await fetchStories();
        const foundStory = folkStories.find(s => s.id === id);
        if (foundStory) {
          setStory(transformStoryRowToStory(foundStory));
        }
      } catch (error) {
        console.error('Failed to load story:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Story not found</p>
      </div>
    );
  }

  const slide = story.slides[currentSlide];
  const isLastSlide = currentSlide === story.slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      if (id) {
        coinSystem.completeStory(id);
        setCoinPopup(COIN_REWARDS.COMPLETE_STORY);
      }
      setTimeout(() => navigate('/stories'), 1500);
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {coinPopup !== null && (
        <CoinPopup amount={coinPopup} onDone={() => setCoinPopup(null)} />
      )}
      <Card className="max-w-4xl w-full animate-fade-in">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">{story.title}</h2>
            <Button variant="ghost" size="icon" onClick={() => navigate('/stories')}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={slide.imageUrl}
                alt={`Slide ${slide.slideNumber}`}
                className="w-full h-full object-contain bg-muted"
              />
            </div>

            <div className="text-center space-y-4">
              <p className="text-2xl font-semibold text-primary">{slide.toto}</p>
              {showTransliteration && (
                <p className="text-sm text-muted-foreground italic">
                  (Transliteration would go here)
                </p>
              )}
              <p className="text-xl text-foreground">{slide.english}</p>
            </div>

            <div className="flex justify-center gap-8">
              <AudioPlayer
                audioUrl={slide.audioToto}
                label="Toto narration"
                variant="toto"
              />
              <AudioPlayer
                audioUrl={slide.audioEnglish}
                label="English narration"
                variant="english"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {story.slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button onClick={handleNext}>
              {isLastSlide ? 'Finish' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => setShowTransliteration(!showTransliteration)}
            className="w-full text-sm"
          >
            {showTransliteration ? 'Hide' : 'Show'} Transliteration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
