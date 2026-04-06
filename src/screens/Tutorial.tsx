import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';

const TUTORIAL_STEPS = [
  {
    emoji: '🗺️',
    title: 'Explore the Map',
    description: 'Travel through 5 exciting worlds! Each world teaches you new Toto words.',
    highlight: 'Tap a world to enter it!',
  },
  {
    emoji: '🎮',
    title: 'Play 3 Games per Level',
    description: 'Each level has 3 fun games: Tap the Image, Memory Match, and Speed Challenge!',
    highlight: 'Complete all 3 to finish a level!',
  },
  {
    emoji: '⭐',
    title: 'Earn Stars & XP',
    description: 'Get 1-3 stars based on how well you do. Score 90%+ for 3 stars!',
    highlight: 'Stars unlock new content!',
  },
  {
    emoji: '📖',
    title: 'Unlock Stories',
    description: 'Complete levels to unlock Toto stories and cultural content as rewards!',
    highlight: 'Stories teach you even more!',
  },
];

export default function Tutorial() {
  const navigate = useNavigate();
  const { completeTutorial, playerName } = useGame();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
      navigate('/learn');
    }
  };

  const handleSkip = () => {
    completeTutorial();
    navigate('/map');
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 screen-enter">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-muted-foreground font-semibold
                   hover:text-foreground transition-colors"
      >
        Skip →
      </button>

      {/* Mascot with speech bubble */}
      <div className="mb-4">
        <div className="speech-bubble max-w-xs mb-4 animate-fade-in-scale" key={currentStep}>
          <p className="text-sm font-semibold text-muted-foreground">
            {currentStep === 0 ? `Hey ${playerName || 'friend'}! Let me show you around!` : step.highlight}
          </p>
        </div>
        <div className="text-6xl text-center mascot-bounce">🦉</div>
      </div>

      {/* Step content */}
      <div className="text-center max-w-sm animate-fade-in-scale" key={`content-${currentStep}`}>
        <div className="text-7xl mb-4">{step.emoji}</div>
        <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
        <p className="text-muted-foreground leading-relaxed mb-8">
          {step.description}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-6">
        {TUTORIAL_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-game-primary' : 'w-2 bg-game-locked'
              }`}
          />
        ))}
      </div>

      {/* Next button */}
      <button onClick={handleNext} className="btn-game-primary px-12">
        {currentStep < TUTORIAL_STEPS.length - 1 ? 'Next' : 'Let\'s Play! 🎉'}
      </button>
    </div>
  );
}
