import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { getWorldConfig, CONCEPT_STORY_UNLOCK_AFTER, FOLK_STORY_UNLOCK_AFTER } from '@/config/worlds';
import { WorldId } from '@/types/game';
import { ArrowLeft, Star, Lock, BookOpen, Scroll, Award } from 'lucide-react';

export default function WorldScreen() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const game = useGame();

  if (!worldId) return null;
  const wid = worldId as WorldId;
  const worldConfig = getWorldConfig(wid);
  const worldState = game.worlds[wid];
  const progress = game.getWorldProgress(wid);

  if (!worldConfig || !worldState) {
    navigate('/map');
    return null;
  }

  const levels = worldState.levels;

  return (
    <div className="min-h-screen pb-20 screen-enter">
      {/* Header */}
      <div className={`bg-gradient-to-br ${worldConfig.bgGradient} text-white px-4 pt-4 pb-8`}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Map
          </button>
          <div className="flex items-center gap-3">
            <span className="text-5xl">{worldConfig.icon}</span>
            <div>
              <h1 className="text-2xl font-bold">{worldConfig.name}</h1>
              <p className="text-sm opacity-80">{worldConfig.description}</p>
            </div>
          </div>
          {/* Star progress */}
          <div className="flex items-center gap-2 mt-4">
            <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
            <span className="text-sm font-semibold">{progress.totalStars}/{progress.maxStars} stars</span>
            <span className="text-sm opacity-60 ml-2">{progress.completedLevels}/5 levels</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        {/* Level path */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-8 bottom-8 w-1 bg-border rounded-full" />

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((levelNum) => {
              const level = levels[levelNum];
              const isPlayable = level.unlocked && !level.completed;
              const isCompleted = level.completed;
              const isLocked = !level.unlocked;

              return (
                <div key={levelNum}>
                  {/* Level node */}
                  <button
                    onClick={() => {
                      if (isPlayable) navigate(`/level/${wid}/${levelNum}/intro`);
                      else if (isCompleted) navigate(`/level/${wid}/${levelNum}/intro`);
                    }}
                    disabled={isLocked}
                    className="relative flex items-center gap-4 w-full text-left group"
                  >
                    {/* Node circle */}
                    <div className={`relative z-10 ${
                      isPlayable ? 'map-node-active' : isCompleted ? 'map-node-completed' : 'map-node-locked'
                    }`}>
                      {isLocked ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <span>{levelNum}</span>
                      )}
                    </div>

                    {/* Level info card */}
                    <div className={`flex-1 card-game p-4 ${isLocked ? 'opacity-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-base">
                            Level {levelNum}
                            {isPlayable && (
                              <span className="ml-2 text-xs bg-game-primary/10 text-game-primary px-2 py-0.5 rounded-full font-semibold">
                                PLAY
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {levelNum <= 2 ? `${levelNum === 1 ? 3 : 4} new words` : '5 words (with review)'}
                          </p>
                        </div>
                        {/* Stars */}
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(s => (
                            <Star
                              key={s}
                              className={`w-5 h-5 ${
                                s <= level.stars
                                  ? 'fill-game-star text-game-star'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Story unlock marker after level 2 */}
                  {levelNum === CONCEPT_STORY_UNLOCK_AFTER && (
                    <button
                      onClick={() => {
                        if (worldState.conceptStoryUnlocked) {
                          navigate(`/story/${wid}/concept`);
                        }
                      }}
                      disabled={!worldState.conceptStoryUnlocked}
                      className="ml-20 mt-2 mb-2 flex items-center gap-3"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        worldState.conceptStoryUnlocked
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-semibold ${
                          worldState.conceptStoryUnlocked ? 'text-blue-600' : 'text-muted-foreground'
                        }`}>
                          Concept Story
                          {worldState.conceptStoryCompleted && ' ✅'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {worldState.conceptStoryUnlocked ? 'Tap to read!' : 'Complete Level 2 to unlock'}
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Folk story unlock marker after level 4 */}
                  {levelNum === FOLK_STORY_UNLOCK_AFTER && (
                    <button
                      onClick={() => {
                        if (worldState.folkStoryUnlocked) {
                          navigate(`/story/${wid}/folk`);
                        }
                      }}
                      disabled={!worldState.folkStoryUnlocked}
                      className="ml-20 mt-2 mb-2 flex items-center gap-3"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        worldState.folkStoryUnlocked
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Scroll className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-semibold ${
                          worldState.folkStoryUnlocked ? 'text-purple-600' : 'text-muted-foreground'
                        }`}>
                          Folk Story
                          {worldState.folkStoryCompleted && ' ✅'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {worldState.folkStoryUnlocked ? 'Tap to read!' : 'Complete Level 4 to unlock'}
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cultural reward card at bottom */}
        <div className="mt-6">
          <button
            onClick={() => {
              if (worldState.culturalUnlocked) {
                navigate(`/cultural/${wid}`);
              }
            }}
            disabled={!worldState.culturalUnlocked}
            className={`w-full card-game p-5 text-center ${
              !worldState.culturalUnlocked ? 'opacity-50' : ''
            }`}
          >
            <Award className={`w-8 h-8 mx-auto mb-2 ${
              worldState.culturalUnlocked ? 'text-game-star' : 'text-muted-foreground'
            }`} />
            <h3 className="font-bold">
              {worldState.culturalUnlocked ? '🎉 Cultural Insight Unlocked!' : '🔒 Cultural Insight'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {worldState.culturalUnlocked
                ? 'Discover the culture behind the words!'
                : 'Complete all 5 levels to unlock'}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
