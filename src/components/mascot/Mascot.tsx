import { useState, useEffect } from 'react';

export type MascotMood = 'idle' | 'happy' | 'excited' | 'sad' | 'thinking';

interface MascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  showMessage?: boolean;
  className?: string;
}

const MOOD_EMOJI: Record<MascotMood, string> = {
  idle: '🦉',
  happy: '🦉',
  excited: '🦉',
  sad: '🦉',
  thinking: '🦉',
};

const MOOD_EYES: Record<MascotMood, string> = {
  idle: '',
  happy: '✨',
  excited: '🎉',
  sad: '💧',
  thinking: '💭',
};

const SIZE_CLASSES = {
  sm: 'text-4xl',
  md: 'text-6xl',
  lg: 'text-8xl',
};

export default function Mascot({
  mood = 'idle',
  size = 'md',
  message,
  showMessage = true,
  className = '',
}: MascotProps) {
  const [blink, setBlink] = useState(false);

  // Idle blink animation
  useEffect(() => {
    if (mood !== 'idle') return;
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [mood]);

  const moodAnimation =
    mood === 'excited' ? 'animate-bounce-in' :
      mood === 'happy' ? '' :
        mood === 'sad' ? 'animate-shake' :
          mood === 'thinking' ? '' :
            '';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Speech bubble */}
      {message && showMessage && (
        <div className="speech-bubble max-w-[240px] mb-3 animate-fade-in">
          <p className="text-sm font-semibold text-center leading-snug">{message}</p>
        </div>
      )}

      {/* Mascot body */}
      <div className="relative inline-block">
        <span
          className={`${SIZE_CLASSES[size]} ${moodAnimation} inline-block transition-transform duration-200 ${blink ? 'opacity-80' : ''
            }`}
          role="img"
          aria-label="Owl mascot"
        >
          {MOOD_EMOJI[mood]}
        </span>

        {/* Mood indicator */}
        {mood !== 'idle' && (
          <span className="absolute -top-1 -right-1 text-lg animate-bounce-in">
            {MOOD_EYES[mood]}
          </span>
        )}
      </div>
    </div>
  );
}
