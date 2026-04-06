import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2 } from "lucide-react";
import { Story } from "@/types/content";
import { fetchConcepts, fetchConceptSlides, fetchStories } from "@/lib/supabaseQueries";
import { transformConceptToStory, transformStoryRowToStory } from "@/lib/dataTransformers";

export default function Stories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStories = async () => {
      try {
        setLoading(true);
        const allStories: Story[] = [];

        const concepts = await fetchConcepts();
        for (const concept of concepts) {
          const slides = await fetchConceptSlides(concept.id);
          if (slides.length > 0) {
            allStories.push(transformConceptToStory(concept, slides));
          }
        }

        const folkStories = await fetchStories();
        const transformedFolkStories = folkStories.map(transformStoryRowToStory);
        allStories.push(...transformedFolkStories);

        setStories(allStories);
      } catch (error) {
        console.error('Failed to load stories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Concept Stories</h1>
        <p className="text-lg text-muted-foreground">
          Explore fun educational stories about science and nature
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {stories.map((story) => (
            <Card
              key={story.id}
              className="card-elevated cursor-pointer hover:scale-105 transition-transform animate-slide-in"
              onClick={() => navigate(`/story/${story.id}`)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <img
                    src={story.thumbnail}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                    <BookOpen className="h-8 w-8 text-white m-4" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">{story.title}</h3>
                  <p className="text-muted-foreground text-sm">{story.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary font-medium">
                    {story.slides.length} slides
                  </span>
                  <Button size="sm">Read Story</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
