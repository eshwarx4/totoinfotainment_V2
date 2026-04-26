import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useGame } from '@/state/GameContext';
import { WorldId } from '@/types/game';
import { getWorldConfig } from '@/config/worlds';
import { fetchStories, StoryRow } from '@/lib/supabaseQueries';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ArrowLeft, Award, Sparkles } from 'lucide-react';

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
        setStories(allStories.slice(0, 3));
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
      <div className={`min-h-screen bg-gradient-to-br ${worldConfig.bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-5xl mb-4 mascot-bounce">🏆</div>
          <p className="text-white/80 font-bold text-lg drop-shadow">Loading cultural content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 screen-enter"
      style={{ background: 'linear-gradient(180deg, #fef3c7 0%, #fffbeb 40%, #fefce8 100%)' }}
    >
      {/* Header */}
      <div className={`bg-gradient-to-br ${worldConfig.bgGradient} text-white px-4 pt-4 pb-10 shadow-lg`}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(`/world/${wid}`)}
            className="flex items-center gap-1.5 text-white/80 hover:text-white mb-4 font-semibold text-sm
                       bg-black/10 backdrop-blur-sm px-3 py-1.5 rounded-full active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 w-20 h-20 -ml-4 -mt-4 rounded-full opacity-30"
                style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 70%)' }} />
              <Award className="w-12 h-12 mx-auto mb-2 text-yellow-300 drop-shadow-lg relative z-10" />
            </div>
            <h1 className="text-2xl font-black drop-shadow-lg">Cultural Insights</h1>
            <p className="text-sm text-white/70 font-medium mt-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {worldConfig.name} — Reward Unlocked!
            </p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-lg mx-auto px-4 -mt-5 space-y-4">
        {stories.map(story => (
          <div key={story.id}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-amber-100/50
                       transition-all hover:shadow-xl">
            {story.image_url && (
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100 mb-4 shadow-sm">
                <img
                  src={story.image_url}
                  alt={story.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
              </div>
            )}
            <h3 className="text-lg font-bold mb-2 text-gray-800">{story.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
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
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-amber-100/50">
            <div className="text-5xl mb-4">🎊</div>
            <h3 className="text-lg font-bold mb-2 text-gray-800">Congratulations!</h3>
            <p className="text-gray-500 text-sm">
              You've completed the {worldConfig.name} world!
              Cultural content for this world will be added soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
