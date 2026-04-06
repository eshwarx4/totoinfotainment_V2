import { useState, useEffect } from 'react';
import Mascot, { MascotMood } from './Mascot';

interface MascotReactionProps {
  trigger: 'correct' | 'wrong' | 'complete' | null;
  className?: string;
}

const CORRECT_MESSAGES = [
  'Great job! 🎉',
  'You got it! ✨',
  'Amazing! 🌟',
  'Perfect! 💯',
  'Well done! 👏',
];

const WRONG_MESSAGES = [
  'Try again! 💪',
  'Almost there!',
  'Keep going!',
  'You can do it!',
  'Don\'t give up!',
];

const COMPLETE_MESSAGES = [
  'Level complete! 🏆',
  'You\'re a star! ⭐',
  'Incredible work! 🎊',
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function MascotReaction({ trigger, className = '' }: MascotReactionProps) {
  const [mood, setMood] = useState<MascotMood>('idle');
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) {
      setVisible(false);
      return;
    }

    setVisible(true);

    if (trigger === 'correct') {
      setMood('happy');
      setMessage(pickRandom(CORRECT_MESSAGES));
    } else if (trigger === 'wrong') {
      setMood('sad');
      setMessage(pickRandom(WRONG_MESSAGES));
    } else if (trigger === 'complete') {
      setMood('excited');
      setMessage(pickRandom(COMPLETE_MESSAGES));
    }

    // Auto-hide after delay
    const timer = setTimeout(() => {
      setVisible(false);
    }, trigger === 'complete' ? 3000 : 1500);

    return () => clearTimeout(timer);
  }, [trigger]);

  if (!visible) return null;

  return (
    <div className={`fixed bottom-24 right-4 z-30 animate-fade-in-scale ${className}`}>
      <Mascot mood={mood} size="sm" message={message} />
    </div>
  );
}
