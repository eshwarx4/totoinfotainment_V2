interface MemoryCardProps {
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

export function MemoryCard({ content, isFlipped, isMatched, onClick }: MemoryCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={isFlipped || isMatched}
      className="perspective-500 w-full aspect-square"
    >
      <div
        className={`
          relative w-full h-full transition-transform duration-500 transform-style-3d
          ${isFlipped || isMatched ? 'rotate-y-180' : ''}
        `}
      >
        {/* Front (hidden) */}
        <div className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <span className="text-3xl text-white font-bold">?</span>
        </div>
        {/* Back (revealed) */}
        <div
          className={`
            absolute inset-0 backface-hidden rotate-y-180 rounded-xl flex items-center justify-center p-2 shadow-md
            ${isMatched ? 'bg-success/20 border-2 border-success' : 'bg-white border-2 border-primary/30'}
          `}
        >
          <span className="text-sm md:text-base font-semibold text-center leading-tight">
            {content}
          </span>
        </div>
      </div>
    </button>
  );
}
