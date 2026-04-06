import { MAP_ZONES } from '@/config/mapZones';
import { MapZone } from './MapZone';

interface VillageMapViewProps {
  unlockedZones: string[];
  onZoneClick: (zoneId: string) => void;
}

export function VillageMapView({ unlockedZones, onZoneClick }: VillageMapViewProps) {
  return (
    <div className="relative w-full aspect-[16/10] max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl village-map-bg">
      {/* SVG village scene */}
      <svg
        viewBox="0 0 800 500"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Sky gradient */}
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="100%" stopColor="#E0F4FF" />
          </linearGradient>
          <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6DBF6D" />
            <stop offset="100%" stopColor="#4A8B4A" />
          </linearGradient>
          <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#81C784" />
            <stop offset="100%" stopColor="#5B9B5B" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="800" height="500" fill="url(#sky)" />

        {/* Sun */}
        <circle cx="700" cy="80" r="50" fill="#FFD54F" opacity="0.9" />

        {/* Clouds */}
        <g opacity="0.8">
          <ellipse cx="150" cy="70" rx="60" ry="25" fill="white" />
          <ellipse cx="190" cy="60" rx="40" ry="20" fill="white" />
          <ellipse cx="120" cy="65" rx="35" ry="18" fill="white" />
        </g>
        <g opacity="0.6">
          <ellipse cx="500" cy="100" rx="50" ry="20" fill="white" />
          <ellipse cx="530" cy="90" rx="35" ry="16" fill="white" />
        </g>

        {/* Far hills */}
        <path d="M0 250 Q200 150 400 220 Q600 170 800 240 L800 500 L0 500Z" fill="url(#hill1)" opacity="0.6" />

        {/* Near hills */}
        <path d="M0 320 Q150 260 300 300 Q450 250 600 290 Q700 270 800 310 L800 500 L0 500Z" fill="url(#hill2)" />

        {/* Ground */}
        <path d="M0 380 Q200 360 400 375 Q600 350 800 370 L800 500 L0 500Z" fill="#5D8A3C" />

        {/* Winding path */}
        <path
          d="M100 480 Q150 420 200 400 Q300 350 400 370 Q500 330 550 310 Q650 330 700 300"
          fill="none"
          stroke="#D4A574"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M100 480 Q150 420 200 400 Q300 350 400 370 Q500 330 550 310 Q650 330 700 300"
          fill="none"
          stroke="#C49A6C"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="8 12"
          opacity="0.5"
        />

        {/* Trees */}
        {[
          { x: 50, y: 350 }, { x: 250, y: 310 }, { x: 450, y: 280 },
          { x: 620, y: 310 }, { x: 750, y: 340 }, { x: 350, y: 400 },
          { x: 180, y: 370 }, { x: 520, y: 360 },
        ].map((tree, i) => (
          <g key={i}>
            <rect x={tree.x - 3} y={tree.y} width="6" height="20" fill="#8B6914" rx="2" />
            <ellipse cx={tree.x} cy={tree.y - 8} rx="18" ry="22" fill="#2E7D32" opacity="0.8" />
            <ellipse cx={tree.x} cy={tree.y - 14} rx="14" ry="16" fill="#388E3C" opacity="0.9" />
          </g>
        ))}

        {/* Small huts */}
        {[{ x: 130, y: 405 }, { x: 500, y: 355 }].map((hut, i) => (
          <g key={i}>
            <rect x={hut.x - 12} y={hut.y - 10} width="24" height="18" fill="#D7CCC8" rx="2" />
            <polygon points={`${hut.x - 16},${hut.y - 10} ${hut.x},${hut.y - 28} ${hut.x + 16},${hut.y - 10}`} fill="#A1887F" />
          </g>
        ))}
      </svg>

      {/* Zone markers overlaid on the map */}
      {MAP_ZONES.map((zone) => (
        <MapZone
          key={zone.id}
          zone={zone}
          isUnlocked={unlockedZones.includes(zone.id)}
          onClick={() => onZoneClick(zone.id)}
        />
      ))}
    </div>
  );
}
