import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { getWorldConfig, CONCEPT_STORY_UNLOCK_AFTER, FOLK_STORY_UNLOCK_AFTER } from '@/config/worlds';
import { WorldId } from '@/types/game';
import { ArrowLeft, Star, Lock, BookOpen, Scroll, Award, Play, Trophy, Sparkles } from 'lucide-react';

// Zigzag positions for levels (same as CandyMap)
const LEVEL_POSITIONS = [
  { x: 30, y: 82 },
  { x: 70, y: 66 },
  { x: 30, y: 50 },
  { x: 70, y: 34 },
  { x: 50, y: 18 },
];

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
    <div className="min-h-screen pb-24 screen-enter candy-world-detail">
      {/* Gradient Background */}
      <div className={`fixed inset-0 bg-gradient-to-b ${worldConfig.bgGradient} -z-10`} />

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-5">
        <div className="candy-particle candy-particle-1" style={{ top: '15%', left: '10%' }} />
        <div className="candy-particle candy-particle-2" style={{ top: '45%', right: '15%' }} />
        <div className="candy-particle candy-particle-3" style={{ bottom: '25%', left: '20%' }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/map')}
              className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Map
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-white text-sm font-bold">{progress.totalStars}/{progress.maxStars}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* World Title Card */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{worldConfig.icon}</div>
            <div>
              <h1 className="text-2xl font-bold text-white">{worldConfig.name}</h1>
              <p className="text-white/70 text-sm">{worldConfig.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        i <= progress.completedLevels ? 'bg-green-400' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white/60 text-xs ml-1">{progress.completedLevels}/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Level Path */}
      <div className="max-w-lg mx-auto px-4 mt-6">
        <div className="relative" style={{ height: '500px' }}>
          {/* SVG Path connecting levels */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Path shadow */}
            <path
              d="M 30,82 Q 50,74 70,66 Q 50,58 30,50 Q 50,42 70,34 Q 60,26 50,18"
              fill="none"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Main path */}
            <path
              d="M 30,82 Q 50,74 70,66 Q 50,58 30,50 Q 50,42 70,34 Q 60,26 50,18"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Dotted center */}
            <path
              d="M 30,82 Q 50,74 70,66 Q 50,58 30,50 Q 50,42 70,34 Q 60,26 50,18"
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="3 5"
            />
          </svg>

          {/* Level Nodes */}
          {[1, 2, 3, 4, 5].map((levelNum, idx) => {
            const level = levels[levelNum];
            const isPlayable = level.unlocked && !level.completed;
            const isCompleted = level.completed;
            const isLocked = !level.unlocked;
            const pos = LEVEL_POSITIONS[idx];

            return (
              <button
                key={levelNum}
                onClick={() => {
                  if (level.unlocked) navigate(`/level/${wid}/${levelNum}/intro`);
                }}
                disabled={isLocked}
                className="absolute candy-level-wrapper"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Glow for current */}
                {isPlayable && (
                  <div className="absolute inset-0 candy-node-glow" style={{ width: 80, height: 80, transform: 'translate(-12px, -12px)' }} />
                )}

                {/* Node */}
                <div className={`candy-node ${
                  isPlayable ? 'candy-node-current' :
                  isCompleted ? 'candy-node-completed' :
                  'candy-node-locked'
                }`}>
                  {isLocked ? (
                    <Lock className="w-5 h-5 text-gray-400" />
                  ) : isPlayable ? (
                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                  ) : (
                    <span className="text-lg font-bold">{levelNum}</span>
                  )}
                  <div className="candy-node-highlight" />
                  <div className="candy-node-shadow" />
                </div>

                {/* Stars */}
                {isCompleted && (
                  <div className="candy-stars mt-1">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= level.stars
                            ? 'fill-yellow-400 text-yellow-500'
                            : 'fill-gray-400 text-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Label */}
                <div className={`candy-level-label ${isLocked ? 'opacity-50' : ''}`}>
                  {isPlayable ? 'PLAY!' : `Lv.${levelNum}`}
                </div>
              </button>
            );
          })}

          {/* Story markers */}
          {/* Concept Story after Level 2 */}
          <button
            onClick={() => worldState.conceptStoryUnlocked && navigate(`/story/${wid}/concept`)}
            disabled={!worldState.conceptStoryUnlocked}
            className="absolute"
            style={{ left: '85%', top: '58%', transform: 'translate(-50%, -50%)' }}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              worldState.conceptStoryUnlocked
                ? 'bg-blue-500 shadow-lg shadow-blue-500/40'
                : 'bg-white/20'
            }`}>
              <BookOpen className={`w-6 h-6 ${worldState.conceptStoryUnlocked ? 'text-white' : 'text-white/50'}`} />
            </div>
            {worldState.conceptStoryCompleted && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            )}
          </button>

          {/* Folk Story after Level 4 */}
          <button
            onClick={() => worldState.folkStoryUnlocked && navigate(`/story/${wid}/folk`)}
            disabled={!worldState.folkStoryUnlocked}
            className="absolute"
            style={{ left: '15%', top: '26%', transform: 'translate(-50%, -50%)' }}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              worldState.folkStoryUnlocked
                ? 'bg-purple-500 shadow-lg shadow-purple-500/40'
                : 'bg-white/20'
            }`}>
              <Scroll className={`w-6 h-6 ${worldState.folkStoryUnlocked ? 'text-white' : 'text-white/50'}`} />
            </div>
            {worldState.folkStoryCompleted && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Cultural Reward Card */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <button
          onClick={() => worldState.culturalUnlocked && navigate(`/cultural/${wid}`)}
          disabled={!worldState.culturalUnlocked}
          className={`w-full rounded-2xl p-5 text-center transition-all ${
            worldState.culturalUnlocked
              ? 'bg-gradient-to-r from-yellow-500 to-amber-500 shadow-lg shadow-amber-500/30'
              : 'bg-white/10'
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            {worldState.culturalUnlocked ? (
              <>
                <Trophy className="w-8 h-8 text-white" />
                <div className="text-left">
                  <h3 className="font-bold text-white">Cultural Insight Unlocked!</h3>
                  <p className="text-white/80 text-xs">Tap to discover the culture!</p>
                </div>
                <Sparkles className="w-6 h-6 text-white/80" />
              </>
            ) : (
              <>
                <Lock className="w-6 h-6 text-white/50" />
                <div className="text-left">
                  <h3 className="font-semibold text-white/70">Cultural Insight</h3>
                  <p className="text-white/50 text-xs">Complete all 5 levels to unlock</p>
                </div>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
