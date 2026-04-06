import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WordItem } from '@/types/content';
import { AudioPlayer } from './AudioPlayer';
import { ChevronUp, Heart, X } from 'lucide-react';

interface SwipeableWordCardProps {
  word: WordItem;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  showTransliteration?: boolean;
}

export const SwipeableWordCard = ({
  word,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  showTransliteration = false,
}: SwipeableWordCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPosition({
      x: clientX - startPos.x,
      y: clientY - startPos.y,
    });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;

    if (Math.abs(position.y) > threshold && Math.abs(position.y) > Math.abs(position.x)) {
      if (position.y < 0) {
        onSwipeUp();
      }
    } else if (Math.abs(position.x) > threshold) {
      if (position.x > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }

    setPosition({ x: 0, y: 0 });
  };

  const getRotation = () => {
    return position.x * 0.1;
  };

  const getOpacity = (direction: 'left' | 'right' | 'up') => {
    const distance = direction === 'up' ? Math.abs(position.y) : Math.abs(position.x);
    return Math.min(distance / 100, 1);
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-[500px]">
      <Card
        ref={cardRef}
        className="absolute inset-0 card-elevated cursor-grab active:cursor-grabbing touch-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) rotate(${getRotation()}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease',
        }}
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          handleDragStart(touch.clientX, touch.clientY);
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          handleDragMove(touch.clientX, touch.clientY);
        }}
        onTouchEnd={handleDragEnd}
      >
        <CardContent className="p-8 flex flex-col items-center justify-center h-full gap-6">
          <div className="absolute top-4 right-4 text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {word.category}
          </div>

          <img
            src={word.imageUrl}
            alt={word.english}
            className="w-48 h-48 object-contain rounded-lg pointer-events-none"
          />

          <div className="text-center space-y-3">
            <h3 className="text-4xl font-bold text-primary">{word.toto}</h3>
            {showTransliteration && word.transliteration && word.transliteration.trim() !== '' && (
              <p className="text-lg text-muted-foreground italic">({word.transliteration})</p>
            )}
            {word.toto !== word.english && (
              <p className="text-2xl text-foreground font-medium">{word.english}</p>
            )}
          </div>

          {word.usageSentenceToto && (
            <div className="text-center space-y-1 bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-primary font-medium">{word.usageSentenceToto}</p>
              <p className="text-xs text-muted-foreground">{word.usageSentenceEnglish}</p>
            </div>
          )}

          <div className="flex gap-4">
            <AudioPlayer audioUrl={word.audioToto} label="Toto" variant="toto" />
            <AudioPlayer audioUrl={word.audioEnglish} label="English" variant="english" />
          </div>
        </CardContent>
      </Card>

      {/* Swipe indicators */}
      <div
        className="absolute top-20 left-8 pointer-events-none"
        style={{ opacity: position.x < -50 ? getOpacity('left') : 0 }}
      >
        <div className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg font-bold text-2xl rotate-[-20deg]">
          SKIP
        </div>
      </div>
      <div
        className="absolute top-20 right-8 pointer-events-none"
        style={{ opacity: position.x > 50 ? getOpacity('right') : 0 }}
      >
        <div className="bg-success text-success-foreground px-6 py-3 rounded-lg font-bold text-2xl rotate-[20deg]">
          SAVED
        </div>
      </div>
      <div
        className="absolute top-8 left-0 right-0 flex justify-center pointer-events-none"
        style={{ opacity: position.y < -50 ? getOpacity('up') : 0 }}
      >
        <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold text-2xl">
          LEARN MORE
        </div>
      </div>
    </div>
  );
};
