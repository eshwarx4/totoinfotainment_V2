import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useGame } from '@/state/GameContext';
import { WorldId } from '@/types/game';
import { getWorldConfig } from '@/config/worlds';
import { fetchStories, StoryRow } from '@/lib/supabaseQueries';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ArrowLeft, Award } from 'lucide-react';

export default function CulturalReward() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const game = useGame();

  const wid = worldId as WorldId;
  const worldConfig = getWorldConfig(wid);
  const worldState = game.worlds[wid];

  const [stories, setStories] = useState<StoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const allStories = await fetchStories();
        // Show cultural content related to this world
        setStories(allStories.slice(0, 3)); // Show up to 3 cultural items
      } catch (e) {
        console.error('Failed to load cultural content:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!worldState?.culturalUnlocked) {
    navigate(`/world/${wid}`);
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 mascot-bounce">🏆</div>
          <p className="text-muted-foreground font-semibold">Loading cultural content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 screen-enter">
      {/* Header */}
      <div className={`bg-gradient-to-br ${worldConfig.bgGradient} text-white px-4 pt-4 pb-8`}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(`/world/${wid}`)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="text-center">
            <Award className="w-12 h-12 mx-auto mb-2 text-yellow-300" />
            <h1 className="text-2xl font-bold">Cultural Insights</h1>
            <p className="text-sm opacity-80">{worldConfig.name} — Reward Unlocked!</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {stories.map(story => (
          <div key={story.id} className="card-game-elevated p-5">
            {story.image_url && (
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-muted mb-4">
                <img
                  src={story.image_url}
                  alt={story.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
              </div>
            )}
            <h3 className="text-lg font-bold mb-2">{story.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {story.cultural_meaning || story.english_narration}
            </p>
            <div className="flex gap-3">
              {story.audio_toto_url && (
                <AudioPlayer audioUrl={story.audio_toto_url} label="Toto" variant="toto" />
              )}
              {story.audio_english_url && (
                <AudioPlayer audioUrl={story.audio_english_url} label="English" variant="english" />
              )}
            </div>
          </div>
        ))}

        {stories.length === 0 && (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">🎊</div>
            <h3 className="text-lg font-bold mb-2">Congratulations!</h3>
            <p className="text-muted-foreground">
              You've completed the {worldConfig.name} world!
              Cultural content for this world will be added soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
