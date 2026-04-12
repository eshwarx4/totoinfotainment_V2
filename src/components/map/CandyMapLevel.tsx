import { Star, Lock, Play } from 'lucide-react';
import { WorldConfig } from '@/config/worlds';

interface CandyMapLevelProps {
  levelNum: number;
  worldConfig: WorldConfig;
  stars: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  position: { x: number; y: number };
  onClick: () => void;
}

export function CandyMapLevel({
  levelNum,
  worldConfig,
  stars,
  isUnlocked,
  isCompleted,
  isCurrent,
  position,
  onClick,
}: CandyMapLevelProps) {
  const getNodeStyle = () => {
    if (isCurrent) return 'candy-node-current';
    if (isCompleted) return 'candy-node-completed';
    if (isUnlocked) return 'candy-node-unlocked';
    return 'candy-node-locked';
  };

  return (
    <button
      onClick={onClick}
      disabled={!isUnlocked}
      className="absolute candy-level-wrapper"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Glow effect for current level */}
      {isCurrent && (
        <div className="absolute inset-0 candy-node-glow" />
      )}

      {/* Main node */}
      <div className={`candy-node ${getNodeStyle()}`}>
        {!isUnlocked ? (
          <Lock className="w-5 h-5 text-gray-500" />
        ) : isCurrent ? (
          <Play className="w-6 h-6 text-white fill-white ml-0.5" />
        ) : (
          <span className="text-lg font-bold">{levelNum}</span>
        )}

        {/* 3D effect layers */}
        <div className="candy-node-highlight" />
        <div className="candy-node-shadow" />
      </div>

      {/* Stars display for completed levels */}
      {isCompleted && (
        <div className="candy-stars">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`w-4 h-4 ${
                s <= stars
                  ? 'fill-yellow-400 text-yellow-500 drop-shadow-sm'
                  : 'fill-gray-300 text-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Level label */}
      <div className={`candy-level-label ${isUnlocked ? 'opacity-100' : 'opacity-50'}`}>
        Lv.{levelNum}
      </div>
    </button>
  );
}
