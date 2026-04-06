import { Lock, Coins } from 'lucide-react';
import type { MapZone as MapZoneType } from '@/config/mapZones';

interface MapZoneProps {
  zone: MapZoneType;
  isUnlocked: boolean;
  onClick: () => void;
}

export function MapZone({ zone, isUnlocked, onClick }: MapZoneProps) {
  return (
    <button
      onClick={onClick}
      className="absolute flex flex-col items-center gap-1 group -translate-x-1/2 -translate-y-1/2"
      style={{ top: zone.position.top, left: zone.position.left }}
    >
      <div
        className={`
          relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center
          text-2xl md:text-3xl shadow-lg transition-all duration-300
          ${
            isUnlocked
              ? `bg-gradient-to-br ${zone.color} animate-pulse-glow cursor-pointer hover:scale-110`
              : 'bg-gray-300 cursor-pointer hover:bg-gray-400'
          }
        `}
      >
        {isUnlocked ? (
          zone.icon
        ) : (
          <Lock className="h-6 w-6 text-gray-600" />
        )}
        {!isUnlocked && (
          <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 text-xs font-bold text-yellow-900 shadow">
            <Coins className="h-3 w-3" />
            {zone.cost}
          </div>
        )}
      </div>
      <span
        className={`text-xs md:text-sm font-semibold text-center whitespace-nowrap px-2 py-0.5 rounded-full ${
          isUnlocked
            ? 'bg-white/90 text-foreground shadow-sm'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        {zone.name}
      </span>
    </button>
  );
}
