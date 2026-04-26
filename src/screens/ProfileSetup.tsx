import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';

const AVATARS = ['🦉', '🐯', '🦋', '🐘', '🦜', '🐒'];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setProfile } = useGame();
  const { t } = useLanguage();

  // Get name from Welcome page if passed
  const passedName = (location.state as any)?.name || '';
  const [name, setName] = useState(passedName);
  const [role, setRole] = useState<'child' | 'teacher'>('child');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  // Start with language selection (step 1), if name was pre-filled skip name step
  const [step, setStep] = useState(1);

  const handleComplete = () => {
    if (!name.trim()) return;
    // Pass the selected avatar to setProfile
    setProfile(name.trim(), role, AVATARS[selectedAvatar]);
    navigate('/tutorial');
  };

  const totalSteps = passedName ? 3 : 4; // Language, (Name if needed), Role, Avatar

  const getActualStep = () => {
    if (passedName) {
      // Steps: 1=Language, 2=Role, 3=Avatar
      return step;
    }
    // Steps: 1=Language, 2=Name, 3=Role, 4=Avatar
    return step;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 screen-enter">
      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${s <= step ? 'bg-game-primary scale-110' : 'bg-game-locked'
              }`}
          />
        ))}
      </div>

      {/* Step 1: Language Selection */}
      {step === 1 && (
        <div className="w-full max-w-sm animate-fade-in-scale text-center">
          <LanguageSelector showTitle={true} />
          <button
            onClick={() => setStep(2)}
            className="btn-game-primary mt-6 w-full"
          >
            {t('profile.next')} →
          </button>
        </div>
      )}

      {/* Step 2: Name (only if not passed) */}
      {step === 2 && !passedName && (
        <div className="w-full max-w-sm animate-fade-in-scale text-center">
          <div className="text-6xl mb-6">👋</div>
          <h2 className="text-2xl font-bold mb-2">{t('welcome.whatsYourName')}</h2>
          <p className="text-muted-foreground mb-6">We'll use this in your adventure!</p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('welcome.enterName')}
            className="w-full text-center text-xl font-semibold px-6 py-4 rounded-2xl
                       border-2 border-border bg-white focus:border-game-primary
                       focus:outline-none transition-colors"
            maxLength={20}
            autoFocus
          />
          <button
            onClick={() => name.trim() && setStep(3)}
            disabled={!name.trim()}
            className="btn-game-primary mt-6 w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('profile.next')} →
          </button>
        </div>
      )}

      {/* Step 2 (if name passed) or Step 3: Role */}
      {((step === 2 && passedName) || (step === 3 && !passedName)) && (
        <div className="w-full max-w-sm animate-fade-in-scale text-center">
          <div className="text-6xl mb-6">🎓</div>
          <h2 className="text-2xl font-bold mb-2">{t('profile.iAmA')}</h2>
          <p className="text-muted-foreground mb-6">{t('profile.personalizeExp')}</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('child')}
              className={`card-game p-6 text-center transition-all ${role === 'child' ? 'ring-4 ring-game-primary bg-game-primary/10 scale-105' : ''
                }`}
            >
              <div className="text-5xl mb-3">👧</div>
              <div className="font-bold text-lg">{t('profile.student')}</div>
              <div className="text-sm text-muted-foreground">{t('profile.studentDesc')}</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`card-game p-6 text-center transition-all ${role === 'teacher' ? 'ring-4 ring-game-primary bg-game-primary/10 scale-105' : ''
                }`}
            >
              <div className="text-5xl mb-3">👨‍🏫</div>
              <div className="font-bold text-lg">{t('profile.teacher')}</div>
              <div className="text-sm text-muted-foreground">{t('profile.teacherDesc')}</div>
            </button>
          </div>
          <button
            onClick={() => setStep(passedName ? 3 : 4)}
            className="btn-game-primary mt-6 w-full"
          >
            {t('profile.next')} →
          </button>
        </div>
      )}

      {/* Step 3 (if name passed) or Step 4: Avatar */}
      {((step === 3 && passedName) || (step === 4 && !passedName)) && (
        <div className="w-full max-w-sm animate-fade-in-scale text-center">
          <div className="text-6xl mb-4">{AVATARS[selectedAvatar]}</div>
          <h2 className="text-2xl font-bold mb-2">{t('profile.pickBuddy')}</h2>
          <p className="text-muted-foreground mb-6">{t('profile.chooseBuddy')}</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {AVATARS.map((avatar, i) => (
              <button
                key={i}
                onClick={() => setSelectedAvatar(i)}
                className={`text-4xl p-4 rounded-2xl transition-all ${selectedAvatar === i
                    ? 'bg-game-primary/10 ring-4 ring-game-primary scale-110'
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
            {t('welcome.startAdventure')} 🎉
          </button>
        </div>
      )}

      {/* Back button for steps 2+ */}
      {step > 1 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-4 text-muted-foreground font-semibold hover:text-foreground transition-colors"
        >
          ← {t('profile.back')}
        </button>
      )}
    </div>
  );
}
