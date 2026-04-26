import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { getWorldConfig, CONCEPT_STORY_UNLOCK_AFTER, FOLK_STORY_UNLOCK_AFTER } from '@/config/worlds';
import { WorldId } from '@/types/game';
import { ArrowLeft, Star, Lock, BookOpen, Scroll, Trophy, Sparkles, ChevronRight } from 'lucide-react';

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
    <div className={`min-h-screen pb-8 screen-enter bg-gradient-to-b ${worldConfig.bgGradient}`}>

      {/* Header — matches LevelIntro style */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/10 border-b border-white/20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 font-semibold text-sm
                       bg-black/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Map
          </button>
          <div className="bg-black/10 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
            <span className="text-gray-800 text-sm font-bold">{progress.totalStars}/{progress.maxStars}</span>
          </div>
        </div>
      </div>

      {/* World Title Card */}
      <div className="max-w-lg mx-auto px-4 pt-5">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/80 flex items-center gap-4 shadow-md">
          <div className="text-4xl shrink-0">{worldConfig.icon}</div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold text-gray-800 truncate">{worldConfig.name}</h1>
            <p className="text-gray-500 text-xs mt-0.5 truncate">{worldConfig.description}</p>
            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${i <= progress.completedLevels ? 'w-5 bg-green-500' : 'w-2 bg-gray-300'
                    }`}
                />
              ))}
              <span className="text-gray-500 text-xs ml-1">{progress.completedLevels}/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== LEVEL PATH ===== */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="relative" style={{ height: '460px' }}>

          {/* SVG path connecting levels */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Road shadow */}
            <path d="M 30,82 Q 50,74 70,66 Q 50,58 30,50 Q 50,42 70,34 Q 60,26 50,18"
              fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="6" strokeLinecap="round" />
            {/* Road surface */}
            <path d="M 30,82 Q 50,74 70,66 Q 50,58 30,50 Q 50,42 70,34 Q 60,26 50,18"
              fill="none" stroke="rgba(200,170,130,0.7)" strokeWidth="4.5" strokeLinecap="round" />
            {/* Center dashes */}
            <path d="M 30,82 Q 50,74 70,66 Q 50,58 30,50 Q 50,42 70,34 Q 60,26 50,18"
              fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 5" />
          </svg>

          {/* Level Nodes */}
          {[1, 2, 3, 4, 5].map((levelNum, idx) => {
            const level = levels[levelNum];
            const isCompleted = level.completed;
            const isPlayable = level.unlocked && !level.completed;
            const isLocked = !level.unlocked;
            const pos = LEVEL_POSITIONS[idx];

            return (
              <button
                key={levelNum}
                onClick={() => { if (level.unlocked) navigate(`/level/${wid}/${levelNum}/intro`); }}
                disabled={isLocked}
                className="absolute focus:outline-none"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {/* Pulse ring for current playable level */}
                {isPlayable && (
                  <span className="absolute rounded-full animate-ping"
                    style={{
                      background: 'rgba(59,130,246,0.35)',
                      width: 62, height: 62,
                      top: -7, left: -7,
                      animationDuration: '1.4s',
                    }} />
                )}

                {/* Node circle */}
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-base shadow-lg transition-transform active:scale-90 border-2 ${isLocked
                  ? 'bg-gray-400/70 border-gray-300 text-gray-200'
                  : isCompleted
                    ? 'bg-white/90 border-white text-emerald-600'
                    : 'bg-white border-white/80 text-blue-600 shadow-xl'
                  }`}>
                  {isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <span>{levelNum}</span>
                  )}
                </div>

                {/* Stars under completed node */}
                {isCompleted && (
                  <div className="flex justify-center gap-0.5 mt-1">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= level.stars ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`}
                      />
                    ))}
                  </div>
                )}

                {/* Label tag */}
                <div className={`mt-0.5 text-center text-[10px] font-bold px-2 py-0.5 rounded-full ${isPlayable
                  ? 'bg-blue-500 text-white'
                  : isCompleted
                    ? 'bg-white/80 text-green-700'
                    : 'bg-black/25 text-white'
                  }`}>
                  {isPlayable ? 'PLAY!' : `Lv.${levelNum}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== UNLOCKABLES — clean list cards ===== */}
      <div className="max-w-lg mx-auto px-4 mt-2 space-y-3">

        {/* Concept Story */}
        <button
          onClick={() => worldState.conceptStoryUnlocked && navigate(`/story/${wid}/concept`)}
          disabled={!worldState.conceptStoryUnlocked}
          className={`w-full rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-[0.98] border ${worldState.conceptStoryUnlocked
            ? 'bg-white/80 border-white/60 backdrop-blur-sm shadow-sm'
            : 'bg-black/20 border-black/15'
            }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${worldState.conceptStoryUnlocked ? 'bg-blue-500 shadow-md' : 'bg-white/15'
            }`}>
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className={`text-sm font-bold truncate ${worldState.conceptStoryUnlocked ? 'text-gray-800' : 'text-white/80'}`}>
              Story Concept
            </p>
            <p className={`text-xs truncate ${worldState.conceptStoryUnlocked ? 'text-gray-500' : 'text-white/55'}`}>
              {worldState.conceptStoryUnlocked ? 'Unlocked ✓' : `Complete Level ${CONCEPT_STORY_UNLOCK_AFTER} to unlock`}
            </p>
          </div>
          {worldState.conceptStoryUnlocked && <ChevronRight className="w-4 h-4 text-white/70 shrink-0" />}
        </button>

        {/* Folk Story */}
        <button
          onClick={() => worldState.folkStoryUnlocked && navigate(`/story/${wid}/folk`)}
          disabled={!worldState.folkStoryUnlocked}
          className={`w-full rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-[0.98] border ${worldState.folkStoryUnlocked
            ? 'bg-white/80 border-white/60 backdrop-blur-sm shadow-sm'
            : 'bg-black/20 border-black/15'
            }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${worldState.folkStoryUnlocked ? 'bg-purple-500 shadow-md' : 'bg-white/15'
            }`}>
            <Scroll className="w-5 h-5 text-white" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className={`text-sm font-bold truncate ${worldState.folkStoryUnlocked ? 'text-gray-800' : 'text-white/80'}`}>
              Folk Story
            </p>
            <p className={`text-xs truncate ${worldState.folkStoryUnlocked ? 'text-gray-500' : 'text-white/55'}`}>
              {worldState.folkStoryUnlocked ? 'Unlocked ✓' : `Complete Level ${FOLK_STORY_UNLOCK_AFTER} to unlock`}
            </p>
          </div>
          {worldState.folkStoryUnlocked && <ChevronRight className="w-4 h-4 text-white/70 shrink-0" />}
        </button>

        {/* Cultural Insight */}
        <button
          onClick={() => worldState.culturalUnlocked && navigate(`/cultural/${wid}`)}
          disabled={!worldState.culturalUnlocked}
          className={`w-full rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-[0.98] ${worldState.culturalUnlocked
            ? 'bg-gradient-to-r from-yellow-400/90 to-amber-500/90 shadow-lg shadow-amber-500/30 border border-yellow-300/50'
            : 'bg-black/20 border border-black/15'
            }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${worldState.culturalUnlocked ? 'bg-white/25' : 'bg-white/15'
            }`}>
            <Trophy className={`w-5 h-5 ${worldState.culturalUnlocked ? 'text-white' : 'text-white/40'}`} />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className={`text-sm font-bold truncate ${worldState.culturalUnlocked ? 'text-white' : 'text-white/80'}`}>
              Cultural Insight
            </p>
            <p className={`text-xs truncate ${worldState.culturalUnlocked ? 'text-white/85' : 'text-white/55'}`}>
              {worldState.culturalUnlocked ? 'Tap to discover the culture!' : 'Complete all 5 levels to unlock'}
            </p>
          </div>
          {worldState.culturalUnlocked && <Sparkles className="w-5 h-5 text-white/80 shrink-0" />}
        </button>
      </div>
    </div>
  );
}
