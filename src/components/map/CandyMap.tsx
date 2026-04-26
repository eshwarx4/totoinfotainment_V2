import { useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { WORLDS, WorldConfig } from '@/config/worlds';
import { WorldId } from '@/types/game';
import { CandyMapLevel } from './CandyMapLevel';
import { CurrencyPair } from '@/components/ui/CurrencyDisplay';
import { Star, Lock, Check } from 'lucide-react';

// Realistic village-map positions - winding path through each location
const LEVEL_POSITIONS = [
  { x: 34, y: 82 },
  { x: 62, y: 68 },
  { x: 38, y: 52 },
  { x: 67, y: 38 },
  { x: 48, y: 22 },
];

// Winding road path
const ROAD_PATH = 'M 34,82 C 45,79 54,73 62,68 C 72,62 49,57 38,52 C 27,47 57,42 67,38 C 76,34 60,27 48,22';

type BuildingKind = 'hut' | 'school' | 'tower' | 'well' | 'field' | 'grove' | 'market' | 'bridge' | 'granary';

const WORLD_ASSETS: Record<string, Array<{ kind: BuildingKind; x: number; y: number; scale: number }>> = {
  forest: [
    { kind: 'hut', x: 16, y: 71, scale: 0.98 },
    { kind: 'school', x: 75, y: 55, scale: 0.92 },
    { kind: 'well', x: 25, y: 35, scale: 0.85 },
    { kind: 'granary', x: 86, y: 78, scale: 0.82 },
  ],
  farm: [
    { kind: 'bridge', x: 30, y: 73, scale: 0.9 },
    { kind: 'hut', x: 78, y: 56, scale: 0.84 },
    { kind: 'well', x: 25, y: 28, scale: 0.78 },
    { kind: 'market', x: 87, y: 22, scale: 0.76 },
  ],
  nature: [
    { kind: 'tower', x: 16, y: 72, scale: 0.82 },
    { kind: 'hut', x: 78, y: 61, scale: 0.78 },
    { kind: 'well', x: 29, y: 29, scale: 0.76 },
    { kind: 'grove', x: 84, y: 22, scale: 0.82 },
  ],
  village: [
    { kind: 'field', x: 17, y: 75, scale: 1.02 },
    { kind: 'granary', x: 78, y: 57, scale: 0.86 },
    { kind: 'market', x: 30, y: 30, scale: 0.86 },
    { kind: 'field', x: 86, y: 25, scale: 0.76 },
  ],
  bodyLand: [
    { kind: 'grove', x: 18, y: 70, scale: 0.9 },
    { kind: 'well', x: 78, y: 55, scale: 0.8 },
    { kind: 'hut', x: 30, y: 30, scale: 0.78 },
    { kind: 'tower', x: 86, y: 24, scale: 0.7 },
  ],
};

function IsoBuilding({ kind, x, y, scale }: { kind: BuildingKind; x: number; y: number; scale: number }) {
  const roof = kind === 'school' ? '#3f5f78' : kind === 'market' ? '#8f5d35' : kind === 'tower' ? '#59636b' : '#5e4634';
  const wall = kind === 'field' ? '#b7a35f' : kind === 'granary' ? '#c2a16f' : '#c6b395';

  if (kind === 'well') {
    return (
      <g transform={`translate(${x},${y}) scale(${scale})`}>
        <ellipse cx="0" cy="7" rx="8" ry="3.5" fill="rgba(0,0,0,0.18)" />
        <ellipse cx="0" cy="0" rx="7" ry="4" fill="#8a8f88" />
        <ellipse cx="0" cy="-1" rx="4.5" ry="2.3" fill="#3e7f92" opacity="0.75" />
        <path d="M-8,0 L-6,7 L6,7 L8,0" fill="#646962" opacity="0.9" />
      </g>
    );
  }

  if (kind === 'bridge') {
    return (
      <g transform={`translate(${x},${y}) scale(${scale}) rotate(-18)`}>
        <ellipse cx="0" cy="9" rx="17" ry="4.5" fill="rgba(0,0,0,0.15)" />
        <rect x="-16" y="-3" width="32" height="7" rx="1.4" fill="#7b5a3b" />
        {[-11, -4, 3, 10].map((offset) => (
          <line key={offset} x1={offset} y1="-5" x2={offset} y2="5" stroke="#c7a178" strokeWidth="1.2" />
        ))}
        <line x1="-16" y1="-5" x2="16" y2="-5" stroke="#4e3828" strokeWidth="1" />
        <line x1="-16" y1="5" x2="16" y2="5" stroke="#4e3828" strokeWidth="1" />
      </g>
    );
  }

  if (kind === 'field') {
    return (
      <g transform={`translate(${x},${y}) scale(${scale})`}>
        <ellipse cx="0" cy="8" rx="13" ry="5" fill="rgba(0,0,0,0.14)" />
        <polygon points="0,-8 16,0 0,9 -16,0" fill={wall} opacity="0.95" />
        {[-8, -4, 0, 4, 8].map((offset) => (
          <path key={offset} d={`M${offset - 7},1 L${offset},-3 L${offset + 7},1`} stroke="#7b6f38" strokeWidth="0.7" fill="none" opacity="0.72" />
        ))}
        <polygon points="0,-8 16,0 0,9 -16,0" fill="none" stroke="rgba(63,98,18,0.45)" strokeWidth="0.7" />
      </g>
    );
  }

  if (kind === 'grove') {
    return (
      <g transform={`translate(${x},${y}) scale(${scale})`}>
        <ellipse cx="0" cy="12" rx="15" ry="5" fill="rgba(0,0,0,0.16)" />
        <ellipse cx="0" cy="2" rx="12" ry="7" fill="#6e756d" opacity="0.72" />
        {[{ x: -6, y: 0 }, { x: 0, y: -4 }, { x: 6, y: 1 }].map((tree, i) => (
          <g key={i} transform={`translate(${tree.x},${tree.y})`}>
            <rect x="-0.7" y="0" width="1.4" height="6" fill="#6d4c36" />
            <circle cx="0" cy="-2" r="3.4" fill="#475844" />
          </g>
        ))}
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx="0" cy="12" rx="13" ry="5" fill="rgba(0,0,0,0.16)" />
      <polygon points="0,-15 16,-5 0,6 -16,-5" fill={roof} />
      <polygon points="-16,-5 0,6 0,20 -16,8" fill="#a8845e" />
      <polygon points="16,-5 0,6 0,20 16,8" fill={wall} />
      <polygon points="0,6 16,-5 16,8 0,20" fill="rgba(0,0,0,0.08)" />
      {kind === 'tower' && (
        <>
          <rect x="-5" y="-26" width="10" height="12" rx="1.5" fill="#6b7280" />
          <polygon points="0,-34 8,-25 -8,-25" fill="#8b6b45" />
        </>
      )}
      <rect x="-3" y="10" width="6" height="9" rx="1" fill="#5b3a29" />
    </g>
  );
}

// =============================================
// TOTOPARA LANDSCAPE DECORATIONS (SVG per world)
// =============================================
function TotoparaLandscape({ worldId }: { worldId: string }) {
  const assets = WORLD_ASSETS[worldId] || WORLD_ASSETS.forest;
  const riverPath = worldId === 'farm'
    ? 'M-8,78 C18,64 36,87 56,71 C75,56 83,72 108,57'
    : worldId === 'forest'
      ? 'M-5,92 C20,88 38,99 58,91 C76,84 88,92 105,86'
      : 'M-8,96 C20,94 36,101 58,94 C80,88 91,95 108,91';

  const treeSet = worldId === 'nature'
    ? [{ x: 8, y: 55, s: 1.05 }, { x: 91, y: 45, s: 1 }, { x: 13, y: 18, s: 0.9 }, { x: 92, y: 88, s: 0.8 }, { x: 55, y: 12, s: 0.72 }, { x: 73, y: 83, s: 0.76 }]
    : worldId === 'village'
      ? [{ x: 8, y: 58, s: 0.7 }, { x: 92, y: 88, s: 0.64 }]
      : [{ x: 7, y: 55, s: 0.84 }, { x: 91, y: 45, s: 0.78 }, { x: 12, y: 18, s: 0.7 }, { x: 92, y: 88, s: 0.64 }];

  return (
    <g>
      <rect x="0" y="0" width="100" height="100" fill="rgba(255,255,255,0.02)" />
      <path d="M-5,13 C19,5 34,16 50,9 C72,0 89,10 105,3 L105,0 L-5,0Z" fill="rgba(232,226,208,0.18)" />

      {worldId === 'forest' && (
        <>
          <path d="M8,67 C20,60 33,64 44,58 C54,52 66,56 77,50" fill="none" stroke="rgba(121,85,55,0.34)" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="20" cy="74" rx="20" ry="10" fill="rgba(150,117,80,0.16)" />
          <ellipse cx="77" cy="57" rx="18" ry="9" fill="rgba(93,101,75,0.2)" />
        </>
      )}

      {worldId === 'farm' && (
        <>
          <path d={riverPath} fill="none" stroke="rgba(83,122,136,0.72)" strokeWidth="18" strokeLinecap="round" />
          <path d={riverPath} fill="none" stroke="rgba(174,202,204,0.72)" strokeWidth="10" strokeLinecap="round" />
          <path d={riverPath} fill="none" stroke="rgba(235,225,196,0.85)" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 7" />
          <path d="M-6,87 C19,74 33,94 55,80 C75,67 86,82 106,67" fill="none" stroke="rgba(195,173,134,0.72)" strokeWidth="5" strokeLinecap="round" />
          {[12, 48, 69, 94].map((x, i) => (
            <ellipse key={x} cx={x} cy={i % 2 ? 82 : 63} rx="2.8" ry="1.3" fill="rgba(103,99,88,0.42)" />
          ))}
        </>
      )}

      {worldId === 'nature' && (
        <>
          <path d="M-5,20 C16,10 34,18 48,9 C68,-3 86,10 106,0 L106,0 L-5,0Z" fill="rgba(48,64,46,0.34)" />
          <path d="M5,84 C22,72 31,78 45,67 C58,57 73,63 94,48" fill="none" stroke="rgba(94,75,54,0.46)" strokeWidth="4.5" strokeLinecap="round" />
          <ellipse cx="76" cy="30" rx="22" ry="13" fill="rgba(48,67,45,0.28)" />
          <ellipse cx="22" cy="66" rx="20" ry="14" fill="rgba(48,67,45,0.24)" />
        </>
      )}

      {worldId === 'village' && (
        <>
          {[16, 25, 34, 43, 52].map((y, i) => (
            <path key={y} d={`M-4,${y + 30} C16,${y + 22} 35,${y + 30} 54,${y + 21} C72,${y + 14} 86,${y + 20} 104,${y + 12}`} fill="none" stroke={i % 2 ? 'rgba(126,96,54,0.42)' : 'rgba(176,142,74,0.48)'} strokeWidth="4.2" strokeLinecap="round" />
          ))}
          <path d="M6,86 L28,73 L53,80 L78,63 L101,70" fill="none" stroke="rgba(89,75,54,0.42)" strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {worldId === 'bodyLand' && (
        <>
          <ellipse cx="50" cy="55" rx="34" ry="24" fill="rgba(102,95,88,0.2)" />
          <ellipse cx="50" cy="55" rx="20" ry="12" fill="rgba(209,201,184,0.17)" />
          <path d="M21,81 C36,70 38,61 51,55 C65,48 72,36 85,24" fill="none" stroke="rgba(95,82,68,0.42)" strokeWidth="4.2" strokeLinecap="round" />
          {[35, 43, 57, 65].map((x, i) => (
            <ellipse key={x} cx={x} cy={i % 2 ? 48 : 61} rx="3.4" ry="1.5" fill="rgba(83,80,73,0.42)" />
          ))}
        </>
      )}

      {worldId !== 'farm' && (
        <>
          <path d={riverPath} fill="none" stroke="rgba(88,124,135,0.42)" strokeWidth="7" strokeLinecap="round" />
          <path d={riverPath} fill="none" stroke="rgba(198,215,211,0.45)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="5 6" />
        </>
      )}

      <path d="M0,96 C16,91 28,95 43,91 C62,86 80,90 100,82 L100,100 L0,100Z" fill="rgba(120,83,54,0.12)" />
      <path d="M0,88 L17,83 L31,86 L47,78 L62,81 L78,73 L100,78" fill="none" stroke="rgba(103,87,66,0.52)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 2" />
      <path d="M3,30 L22,24 L38,28" fill="none" stroke="rgba(103,87,66,0.5)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M69,88 L85,80 L101,82" fill="none" stroke="rgba(103,87,66,0.5)" strokeWidth="2.6" strokeLinecap="round" />

      {[10, 16, 22, 77, 83, 89, 95].map((x) => (
        <rect key={x} x={x} y={x < 40 ? 23 : 79} width="2.2" height="4.4" rx="0.5" fill="#b9a98e" stroke="rgba(87,83,78,0.35)" strokeWidth="0.35" />
      ))}
      {assets.map((asset) => (
        <IsoBuilding key={`${asset.kind}-${asset.x}-${asset.y}`} {...asset} />
      ))}
      {treeSet.map((tree, index) => (
        <g key={index} transform={`translate(${tree.x},${tree.y}) scale(${tree.s})`}>
          <ellipse cx="0" cy="5" rx="4" ry="1.6" fill="rgba(0,0,0,0.14)" />
          <rect x="-0.7" y="0" width="1.4" height="5" rx="0.5" fill="#735239" />
          <circle cx="0" cy="-2" r="4" fill="#4f6649" />
          <circle cx="2.2" cy="-1" r="3" fill="#6f8056" opacity="0.82" />
        </g>
      ))}
      <ellipse cx="50" cy="52" rx="45" ry="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.7" strokeDasharray="1 5" />
    </g>
  );
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

function WorldSection({ world, isUnlocked, levels, currentLevel, onLevelClick, t }: WorldSectionProps) {
  return (
    <div className={`candy-world-section ${!isUnlocked ? 'candy-world-locked' : ''}`}>
      <div className={`candy-world-bg candy-world-${world.id}`}>

        {/* SVG Landscape + Road */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <TotoparaLandscape worldId={world.id} />

          {/* Road shadow */}
          <path d={ROAD_PATH} fill="none" stroke="rgba(64,49,36,0.28)" strokeWidth="7" strokeLinecap="round" />
          {/* Road base */}
          <path d={ROAD_PATH} fill="none" stroke="rgba(114,89,61,0.5)" strokeWidth="5.5" strokeLinecap="round" />
          {/* Road surface */}
          <path d={ROAD_PATH} fill="none" stroke="rgba(203,182,145,0.72)" strokeWidth="4" strokeLinecap="round" />
          {/* Road center dashes */}
          <path d={ROAD_PATH} fill="none" stroke="rgba(118,97,70,0.52)" strokeWidth="0.9" strokeLinecap="round" strokeDasharray="3 4" />
        </svg>

        {/* World title banner */}
        <div className="candy-world-banner">
          <span className={`candy-world-dot candy-world-dot-${world.id}`} />
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
        <h2 className="text-white font-extrabold text-lg tracking-tight">Totopara</h2>
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
