import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/state/GameContext';

const AVATARS = ['🦉', '🐯', '🦋', '🐘', '🦜', '🐒'];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setProfile } = useGame();

  // Get name from Welcome page if passed
  const passedName = (location.state as any)?.name || '';
  const [name, setName] = useState(passedName);
  const [role, setRole] = useState<'child' | 'teacher'>('child');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  // If name was pre-filled, skip to step 2
  const [step, setStep] = useState(passedName ? 2 : 1);

  const handleComplete = () => {
    if (!name.trim()) return;
    setProfile(name.trim(), role);
    navigate('/tutorial');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 screen-enter">
      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${s <= step ? 'bg-game-primary scale-110' : 'bg-game-locked'
              }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="w-full max-w-sm animate-fade-in-scale text-center">
          <div className="text-6xl mb-6">👋</div>
          <h2 className="text-2xl font-bold mb-2">What's your name?</h2>
          <p className="text-muted-foreground mb-6">We'll use this in your adventure!</p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name..."
            className="w-full text-center text-xl font-semibold px-6 py-4 rounded-2xl
                       border-2 border-border bg-white focus:border-game-primary
                       focus:outline-none transition-colors"
            maxLength={20}
            autoFocus
          />
          <button
            onClick={() => name.trim() && setStep(2)}
            disabled={!name.trim()}
            className="btn-game-primary mt-6 w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-sm animate-fade-in-scale text-center">
          <div className="text-6xl mb-6">🎓</div>
          <h2 className="text-2xl font-bold mb-2">I am a...</h2>
          <p className="text-muted-foreground mb-6">This helps us personalize your experience</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setRole('child')}
              className={`card-game p-6 text-center transition-all ${role === 'child' ? 'ring-3 ring-game-primary' : ''
                }`}
            >
              <div className="text-5xl mb-3">👧</div>
              <div className="font-bold text-lg">Student</div>
              <div className="text-sm text-muted-foreground">I want to learn!</div>
            </button>
            <button
              onClick={() => setRole('teacher')}
              className={`card-game p-6 text-center transition-all ${role === 'teacher' ? 'ring-3 ring-game-primary' : ''
                }`}
            >
              <div className="text-5xl mb-3">👨‍🏫</div>
              <div className="font-bold text-lg">Teacher</div>
              <div className="text-sm text-muted-foreground">I want to teach!</div>
            </button>
          </div>
          <button
            onClick={() => setStep(3)}
            className="btn-game-primary mt-6 w-full"
          >
            Next →
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="w-full max-w-sm animate-fade-in-scale text-center">
          <div className="text-6xl mb-4">{AVATARS[selectedAvatar]}</div>
          <h2 className="text-2xl font-bold mb-2">Pick your buddy!</h2>
          <p className="text-muted-foreground mb-6">Choose a companion for your journey</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {AVATARS.map((avatar, i) => (
              <button
                key={i}
                onClick={() => setSelectedAvatar(i)}
                className={`text-4xl p-4 rounded-2xl transition-all ${selectedAvatar === i
                    ? 'bg-game-primary/10 ring-3 ring-game-primary scale-110'
                    : 'bg-white hover:bg-gray-50'
                  }`}
              >
                {avatar}
              </button>
            ))}
          </div>
          <button
            onClick={handleComplete}
            className="btn-game-primary w-full text-xl"
          >
            Start Adventure! 🎉
          </button>
        </div>
      )}

      {/* Back button for steps 2-3 */}
      {step > 1 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-4 text-muted-foreground font-semibold hover:text-foreground transition-colors"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
