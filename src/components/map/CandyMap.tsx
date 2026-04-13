import { useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { WORLDS, WorldConfig } from '@/config/worlds';
import { WorldId } from '@/types/game';
import { CandyMapLevel } from './CandyMapLevel';
import { CurrencyPair } from '@/components/ui/CurrencyDisplay';
import { ChevronDown, Star, Lock, Check } from 'lucide-react';

// Candy Crush style positions - zigzag winding path
const LEVEL_POSITIONS = [
  { x: 35, y: 82 },
  { x: 65, y: 68 },
  { x: 35, y: 52 },
  { x: 65, y: 38 },
  { x: 45, y: 22 },
];

// Winding road path
const ROAD_PATH = 'M 35,82 C 40,78 55,72 65,68 C 72,65 45,56 35,52 C 25,48 55,42 65,38 C 72,35 55,26 45,22';

// =============================================
// TOTOPARA LANDSCAPE DECORATIONS (SVG per world)
// =============================================
function TotoparaLandscape({ worldId }: { worldId: string }) {
  switch (worldId) {
    case 'forest': // Toto Village
      return (
        <g>
          {/* Ground */}
          <rect x="0" y="90" width="100" height="10" fill="rgba(139,90,43,0.15)" rx="1" />
          {/* Traditional Toto huts */}
          {[{ x: 10, y: 70 }, { x: 88, y: 55 }, { x: 8, y: 35 }].map((h, i) => (
            <g key={i} transform={`translate(${h.x},${h.y})`}>
              <rect x="-4" y="-2" width="8" height="6" fill="#D4A36A" rx="0.5" />
              <polygon points="-5,-2 0,-7 5,-2" fill="#5D4037" />
              <rect x="-1" y="1" width="2" height="3" fill="#3E2723" />
              <rect x="2" y="-0.5" width="1.5" height="1.5" fill="#FFE0B2" rx="0.2" />
            </g>
          ))}
          {/* Bamboo fencing */}
          {[70, 74, 78, 82].map((x, i) => (
            <g key={`f${i}`}>
              <rect x={x} y="82" width="0.6" height="6" fill="#8D6E63" rx="0.2" />
            </g>
          ))}
          <line x1="70" y1="83.5" x2="82" y2="83.5" stroke="#A1887F" strokeWidth="0.5" />
          <line x1="70" y1="85.5" x2="82" y2="85.5" stroke="#A1887F" strokeWidth="0.5" />
          {/* People figures (tiny) */}
          {[{ x: 22, y: 88 }, { x: 78, y: 70 }].map((p, i) => (
            <g key={`p${i}`} transform={`translate(${p.x},${p.y})`}>
              <circle cx="0" cy="-2" r="1" fill="#8D6E63" />
              <rect x="-0.6" y="-1" width="1.2" height="3" fill="#E91E63" rx="0.3" />
            </g>
          ))}
          {/* Trees along paths */}
          {[{ x: 90, y: 40, s: 0.8 }, { x: 5, y: 55, s: 0.7 }, { x: 92, y: 80, s: 0.9 }].map((t, i) => (
            <g key={`t${i}`} transform={`translate(${t.x},${t.y}) scale(${t.s})`}>
              <rect x="-0.6" y="0" width="1.2" height="4" fill="#5D4037" rx="0.3" />
              <circle cx="0" cy="-2" r="3.5" fill="#4CAF50" opacity="0.7" />
              <circle cx="1.5" cy="-1" r="2.5" fill="#66BB6A" opacity="0.6" />
            </g>
          ))}
          {/* Cooking fire */}
          <g transform="translate(50,92)">
            <circle cx="0" cy="0" r="1.5" fill="#FF6F00" opacity="0.4" />
            <circle cx="0" cy="-0.5" r="0.8" fill="#FFAB00" opacity="0.6" />
          </g>
        </g>
      );
    case 'farm': // Torsha River
      return (
        <g>
          {/* River water */}
          <path d="M-5,88 Q15,82 30,88 Q45,94 60,88 Q75,82 95,88 L105,88 L105,100 L-5,100Z" fill="rgba(33,150,243,0.2)" />
          <path d="M-5,92 Q20,86 40,92 Q60,98 80,92 Q95,86 105,92 L105,100 L-5,100Z" fill="rgba(33,150,243,0.15)" />
          {/* River ripples */}
          {[{ x: 20, y: 94 }, { x: 50, y: 90 }, { x: 75, y: 93 }].map((r, i) => (
            <path key={i} d={`M${r.x - 3},${r.y} Q${r.x},${r.y - 1} ${r.x + 3},${r.y}`} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" />
          ))}
          {/* Bamboo on riverbank */}
          {[{ x: 5, y: 72, s: 1.1 }, { x: 92, y: 60, s: 1 }, { x: 8, y: 45, s: 0.9 }, { x: 95, y: 35, s: 0.8 }].map((b, i) => (
            <g key={i} transform={`translate(${b.x},${b.y}) scale(${b.s})`}>
              <line x1="0" y1="0" x2="0" y2="-10" stroke="#4E7C31" strokeWidth="0.8" />
              <line x1="0" y1="-3" x2="-2" y2="-5" stroke="#66BB6A" strokeWidth="0.4" />
              <line x1="0" y1="-3" x2="2" y2="-5" stroke="#66BB6A" strokeWidth="0.4" />
              <line x1="0" y1="-6" x2="-2.5" y2="-8" stroke="#66BB6A" strokeWidth="0.4" />
              <line x1="0" y1="-6" x2="2.5" y2="-8" stroke="#66BB6A" strokeWidth="0.4" />
            </g>
          ))}
          {/* Rocks in river */}
          {[{ x: 30, y: 95 }, { x: 65, y: 93 }, { x: 85, y: 96 }].map((r, i) => (
            <ellipse key={`rock${i}`} cx={r.x} cy={r.y} rx="2" ry="1" fill="rgba(158,158,158,0.4)" />
          ))}
          {/* Clouds */}
          {[{ x: 15, y: 12 }, { x: 80, y: 8 }].map((c, i) => (
            <g key={`c${i}`} opacity="0.3">
              <ellipse cx={c.x} cy={c.y} rx="7" ry="2.5" fill="white" />
              <ellipse cx={c.x + 3} cy={c.y - 1.5} rx="4" ry="2" fill="white" />
            </g>
          ))}
          {/* Fish */}
          <g transform="translate(45,95)" opacity="0.25">
            <ellipse cx="0" cy="0" rx="2" ry="0.8" fill="#FF9800" />
            <polygon points="2,0 3.5,1 3.5,-1" fill="#FF9800" />
          </g>
        </g>
      );
    case 'nature': // Toto Forest
      return (
        <g>
          {/* Dense forest floor */}
          <ellipse cx="50" cy="97" rx="55" ry="6" fill="rgba(27,94,32,0.2)" />
          {/* Large trees */}
          {[{ x: 8, y: 75, s: 1.3 }, { x: 92, y: 65, s: 1.2 }, { x: 5, y: 40, s: 1.1 }, { x: 95, y: 30, s: 1 }, { x: 10, y: 18, s: 0.9 }, { x: 88, y: 85, s: 1.1 }].map((t, i) => (
            <g key={i} transform={`translate(${t.x},${t.y}) scale(${t.s})`}>
              <rect x="-1" y="0" width="2" height="6" fill="#5D4037" rx="0.5" />
              <polygon points="0,-10 -5,0 5,0" fill="#1B5E20" opacity="0.8" />
              <polygon points="0,-7 -4,1 4,1" fill="#2E7D32" opacity="0.8" />
              <polygon points="0,-4.5 -3,2 3,2" fill="#388E3C" opacity="0.8" />
            </g>
          ))}
          {/* Animals silhouettes */}
          <g transform="translate(80,82)" opacity="0.2">
            <ellipse cx="0" cy="0" rx="3" ry="1.5" fill="#3E2723" />
            <ellipse cx="-2.5" cy="-1.5" rx="1.2" ry="1" fill="#3E2723" />
          </g>
          {/* Butterflies */}
          {[{ x: 25, y: 60 }, { x: 70, y: 45 }].map((b, i) => (
            <g key={`b${i}`} transform={`translate(${b.x},${b.y})`} opacity="0.35">
              <ellipse cx="-1.5" cy="0" rx="1.5" ry="1" fill="#FF9800" />
              <ellipse cx="1.5" cy="0" rx="1.5" ry="1" fill="#FF9800" />
              <rect x="-0.2" y="-1.5" width="0.4" height="3" fill="#5D4037" rx="0.2" />
            </g>
          ))}
          {/* Mushrooms */}
          {[{ x: 22, y: 90 }, { x: 78, y: 80 }, { x: 18, y: 60 }].map((m, i) => (
            <g key={`m${i}`} transform={`translate(${m.x},${m.y})`}>
              <rect x="-0.5" y="0" width="1" height="2" fill="#D7CCC8" rx="0.3" />
              <ellipse cx="0" cy="-0.5" rx="2" ry="1.5" fill="#E53935" />
              <circle cx="-0.6" cy="-0.8" r="0.4" fill="white" opacity="0.7" />
            </g>
          ))}
        </g>
      );
    case 'village': // Hill Fields
      return (
        <g>
          {/* Terraced hills */}
          <path d="M0,95 Q25,80 50,90 Q75,85 100,95 L100,100 L0,100Z" fill="rgba(139,195,74,0.15)" />
          <path d="M0,90 Q30,75 55,85 Q80,78 100,90" fill="none" stroke="rgba(139,195,74,0.2)" strokeWidth="0.5" />
          <path d="M0,85 Q35,70 60,80 Q85,73 100,85" fill="none" stroke="rgba(139,195,74,0.15)" strokeWidth="0.5" />
          {/* Crop rows */}
          {[72, 76, 80, 84, 88].map((y, i) => (
            <g key={i}>
              {[10, 18, 26, 74, 82, 90].map((x, j) => (
                <g key={`c${j}`} transform={`translate(${x},${y})`}>
                  <line x1="0" y1="0" x2="0" y2="-3" stroke="#7CB342" strokeWidth="0.4" />
                  <ellipse cx="0" cy="-3.5" rx="1" ry="0.8" fill="#8BC34A" opacity="0.6" />
                </g>
              ))}
            </g>
          ))}
          {/* Mountains in background */}
          <polygon points="0,45 15,15 30,45" fill="rgba(100,100,100,0.08)" />
          <polygon points="70,40 90,10 100,35 100,45" fill="rgba(100,100,100,0.06)" />
          {/* Sun */}
          <circle cx="85" cy="12" r="5" fill="#FFD54F" opacity="0.3" />
        </g>
      );
    case 'bodyLand': // Sacred Grove
      return (
        <g>
          {/* Mystical mist */}
          {[{ x: 20, y: 85, r: 12 }, { x: 70, y: 90, r: 10 }, { x: 45, y: 92, r: 15 }].map((m, i) => (
            <ellipse key={i} cx={m.x} cy={m.y} rx={m.r} ry="3" fill="rgba(255,255,255,0.08)" />
          ))}
          {/* Ancient trees with hanging vines */}
          {[{ x: 8, y: 60, s: 1.4 }, { x: 92, y: 50, s: 1.3 }, { x: 7, y: 25, s: 1.1 }].map((t, i) => (
            <g key={i} transform={`translate(${t.x},${t.y}) scale(${t.s})`}>
              <rect x="-1.2" y="0" width="2.4" height="7" fill="#4E342E" rx="0.5" />
              <circle cx="0" cy="-3" r="5" fill="#2E7D32" opacity="0.5" />
              <circle cx="2" cy="-1" r="3.5" fill="#388E3C" opacity="0.4" />
              {/* Hanging vines */}
              <line x1="-3" y1="-1" x2="-3.5" y2="4" stroke="#4CAF50" strokeWidth="0.3" opacity="0.4" />
              <line x1="3" y1="0" x2="3.5" y2="5" stroke="#4CAF50" strokeWidth="0.3" opacity="0.4" />
            </g>
          ))}
          {/* Glowing flowers */}
          {[{ x: 25, y: 85, c: '#E1BEE7' }, { x: 75, y: 78, c: '#CE93D8' }, { x: 50, y: 88, c: '#F3E5F5' }, { x: 80, y: 30, c: '#E1BEE7' }].map((f, i) => (
            <g key={`f${i}`}>
              <circle cx={f.x} cy={f.y} r="1.5" fill={f.c} opacity="0.5" />
              <circle cx={f.x} cy={f.y} r="0.6" fill="white" opacity="0.4" />
            </g>
          ))}
          {/* Fireflies */}
          {[{ x: 30, y: 50 }, { x: 60, y: 65 }, { x: 85, y: 72 }, { x: 20, y: 40 }].map((ff, i) => (
            <circle key={`ff${i}`} cx={ff.x} cy={ff.y} r="0.5" fill="#FFEB3B" opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      );
    default:
      return null;
  }
}

// =============================================
// MILESTONE GATE between worlds
// =============================================
interface MilestoneGateProps {
  fromWorld: WorldConfig;
  toWorld: WorldConfig;
  isUnlocked: boolean;
  completedLevels: number;
  requiredLevels: number;
  t: (key: string) => string;
}

function MilestoneGate({ fromWorld, toWorld, isUnlocked, completedLevels, requiredLevels, t }: MilestoneGateProps) {
  return (
    <div className="candy-milestone-gate">
      <div className="candy-milestone-path">
        <div className="candy-milestone-line" />
      </div>
      <div className={`candy-milestone-badge ${isUnlocked ? 'candy-milestone-unlocked' : 'candy-milestone-locked'}`}>
        {isUnlocked ? (
          <>
            <Check className="w-5 h-5" />
            <span className="candy-milestone-text">
              {toWorld.icon} {toWorld.name}
            </span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span className="candy-milestone-text">
              {completedLevels}/{requiredLevels} to unlock {toWorld.name}
            </span>
          </>
        )}
      </div>
      <div className="candy-milestone-path">
        <div className="candy-milestone-line" />
      </div>
    </div>
  );
}

// =============================================
// WORLD SECTION
// =============================================
interface WorldSectionProps {
  world: WorldConfig;
  worldIndex: number;
  isUnlocked: boolean;
  levels: {
    levelNum: number;
    stars: number;
    unlocked: boolean;
    completed: boolean;
  }[];
  currentLevel: number | null;
  onLevelClick: (levelNum: number) => void;
  t: (key: string) => string;
}

function WorldSection({ world, worldIndex, isUnlocked, levels, currentLevel, onLevelClick, t }: WorldSectionProps) {
  return (
    <div className={`candy-world-section ${!isUnlocked ? 'candy-world-locked' : ''}`}>
      <div className={`candy-world-bg bg-gradient-to-b ${world.bgGradient}`}>

        {/* SVG Landscape + Road */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <TotoparaLandscape worldId={world.id} />

          {/* Road shadow */}
          <path d={ROAD_PATH} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="7" strokeLinecap="round" />
          {/* Road base */}
          <path d={ROAD_PATH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="5.5" strokeLinecap="round" />
          {/* Road surface */}
          <path d={ROAD_PATH} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeLinecap="round" />
          {/* Road center dashes */}
          <path d={ROAD_PATH} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 4" />
        </svg>

        {/* World title banner */}
        <div className="candy-world-banner">
          <span className="text-2xl drop-shadow-md">{world.icon}</span>
          <div>
            <h3 className="font-extrabold text-white text-sm drop-shadow-sm">{world.name}</h3>
            <p className="text-white/70 text-[10px]">{world.description}</p>
          </div>
          {!isUnlocked && (
            <div className="ml-auto bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] text-white font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" /> {t('map.locked')}
            </div>
          )}
        </div>

        {/* Level nodes */}
        <div className="relative w-full h-full" style={{ zIndex: 15 }}>
          {levels.map((level, i) => (
            <CandyMapLevel
              key={level.levelNum}
              levelNum={level.levelNum}
              worldConfig={world}
              stars={level.stars}
              isUnlocked={level.unlocked && isUnlocked}
              isCompleted={level.completed}
              isCurrent={level.levelNum === currentLevel}
              position={LEVEL_POSITIONS[i]}
              onClick={() => onLevelClick(level.levelNum)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================
// MAIN MAP COMPONENT
// =============================================
export function CandyMap() {
  const navigate = useNavigate();
  const game = useGame();
  const { t } = useLanguage();
  const totalProgress = game.getTotalProgress();

  const isWorldUnlocked = (worldId: WorldId, index: number): boolean => {
    if (index === 0) return true;
    const prevWorldId = WORLDS[index - 1].id;
    const prevProgress = game.getWorldProgress(prevWorldId);
    return prevProgress.completedLevels >= 3;
  };

  const getCurrentLevel = (worldId: WorldId): number | null => {
    const worldState = game.worlds[worldId];
    if (!worldState) return null;
    for (let i = 1; i <= 5; i++) {
      if (worldState.levels[i].unlocked && !worldState.levels[i].completed) {
        return i;
      }
    }
    return null;
  };

  const handleLevelClick = (worldId: WorldId, levelNum: number) => {
    navigate(`/level/${worldId}/${levelNum}/intro`);
  };

  return (
    <div className="candy-map-container">
      {/* Fixed header */}
      <div className="candy-map-header">
        <div className="flex items-center gap-3">
          <div className="candy-avatar">
            <span className="text-lg">{game.playerAvatar || '🦉'}</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">
              {game.playerName || t('map.explorer')}
            </h1>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-white/70 text-[11px]">
                {totalProgress.maxStars}/{WORLDS.length * 15}
              </span>
            </div>
          </div>
        </div>
        <CurrencyPair
          coins={totalProgress.totalCoins}
          diamonds={totalProgress.totalDiamonds}
        />
      </div>

      {/* Map title banner */}
      <div className="candy-map-title">
        <h2 className="text-white font-extrabold text-lg tracking-tight">🏔️ Totopara</h2>
        <p className="text-white/60 text-[11px]">Explore the Toto homeland</p>
      </div>

      {/* Scrollable map area */}
      <div className="candy-map-scroll">
        {WORLDS.map((world, index) => {
          const worldState = game.worlds[world.id];
          const unlocked = isWorldUnlocked(world.id, index);
          const currentLevel = getCurrentLevel(world.id);

          const levels = [1, 2, 3, 4, 5].map((levelNum) => ({
            levelNum,
            stars: worldState?.levels[levelNum]?.stars || 0,
            unlocked: worldState?.levels[levelNum]?.unlocked || false,
            completed: worldState?.levels[levelNum]?.completed || false,
          }));

          // Get previous world progress for milestone gate
          const prevWorldProgress = index > 0
            ? game.getWorldProgress(WORLDS[index - 1].id)
            : null;

          return (
            <div key={world.id}>
              {/* Milestone gate before each world (except first) */}
              {index > 0 && prevWorldProgress && (
                <MilestoneGate
                  fromWorld={WORLDS[index - 1]}
                  toWorld={world}
                  isUnlocked={unlocked}
                  completedLevels={prevWorldProgress.completedLevels}
                  requiredLevels={3}
                  t={t}
                />
              )}
              <WorldSection
                world={world}
                worldIndex={index}
                isUnlocked={unlocked}
                levels={levels}
                currentLevel={currentLevel}
                onLevelClick={(levelNum) => handleLevelClick(world.id, levelNum)}
                t={t}
              />
            </div>
          );
        })}

        {/* End celebration */}
        <div className="candy-map-end">
          <div className="text-5xl mb-3">🏆</div>
          <p className="text-white/80 font-bold text-lg">{t('map.masterToto')}</p>
          <p className="text-white/50 text-sm mt-1">You explored all of Totopara!</p>
        </div>
      </div>
    </div>
  );
}
