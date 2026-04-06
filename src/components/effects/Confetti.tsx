import { useEffect, useState } from 'react';

interface ConfettiProps {
  duration?: number;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

export function Confetti({ duration = 2500 }: ConfettiProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => {
        const color = COLORS[i % COLORS.length];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const size = 6 + Math.random() * 8;
        const drift = (Math.random() - 0.5) * 100;

        return (
          <div
            key={i}
            className="absolute top-0 rounded-sm"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size * 0.6}px`,
              backgroundColor: color,
              animation: `confetti-fall ${1.5 + Math.random()}s ease-in ${delay}s forwards`,
              transform: `translateX(${drift}px) rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
