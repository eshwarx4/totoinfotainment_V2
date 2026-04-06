interface LetterTileProps {
  letter: string;
  isUsed: boolean;
  onClick: () => void;
}

export function LetterTile({ letter, isUsed, onClick }: LetterTileProps) {
  return (
    <button
      onClick={onClick}
      disabled={isUsed}
      className={`
        w-10 h-10 md:w-12 md:h-12 rounded-lg font-bold text-lg md:text-xl
        flex items-center justify-center transition-all duration-200
        ${
          isUsed
            ? 'bg-muted text-muted-foreground scale-90 opacity-50'
            : 'bg-primary text-primary-foreground shadow-md hover:scale-110 hover:shadow-lg active:scale-95'
        }
      `}
    >
      {letter.toUpperCase()}
    </button>
  );
}
