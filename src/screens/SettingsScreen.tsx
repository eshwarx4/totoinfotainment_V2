import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { ArrowLeft, Trash2, Info } from 'lucide-react';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const game = useGame();
  const [showReset, setShowReset] = useState(false);

  const [largeText, setLargeText] = useState(
    () => localStorage.getItem('largeText') === 'true'
  );
  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem('highContrast') === 'true'
  );

  const toggleSetting = (key: string, value: boolean, setter: (v: boolean) => void) => {
    localStorage.setItem(key, String(value));
    setter(value);
  };

  const handleReset = () => {
    game.resetAll();
    setShowReset(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen screen-enter">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 pt-4 pb-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-3 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Map
          </button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Profile */}
        <div className="card-game p-4">
          <h2 className="font-bold text-sm text-muted-foreground mb-3">PROFILE</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-game-primary/10 flex items-center justify-center text-2xl">
              🦉
            </div>
            <div>
              <p className="font-bold">{game.playerName || 'Explorer'}</p>
              <p className="text-xs text-muted-foreground capitalize">{game.playerRole}</p>
            </div>
          </div>
        </div>

        {/* Accessibility */}
        <div className="card-game p-4">
          <h2 className="font-bold text-sm text-muted-foreground mb-3">ACCESSIBILITY</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="font-semibold text-sm">Large Text</span>
              <button
                onClick={() => toggleSetting('largeText', !largeText, setLargeText)}
                className={`w-11 h-6 rounded-full transition-colors ${
                  largeText ? 'bg-game-primary' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  largeText ? 'translate-x-5.5' : 'translate-x-0.5'
                }`} />
              </button>
            </label>
            <label className="flex items-center justify-between">
              <span className="font-semibold text-sm">High Contrast</span>
              <button
                onClick={() => toggleSetting('highContrast', !highContrast, setHighContrast)}
                className={`w-11 h-6 rounded-full transition-colors ${
                  highContrast ? 'bg-game-primary' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  highContrast ? 'translate-x-5.5' : 'translate-x-0.5'
                }`} />
              </button>
            </label>
          </div>
        </div>

        {/* About */}
        <button
          onClick={() => {/* Could navigate to about page */}}
          className="card-game p-4 w-full text-left flex items-center gap-3"
        >
          <Info className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="font-semibold text-sm">About Toto Language</p>
            <p className="text-xs text-muted-foreground">Learn about the Toto community</p>
          </div>
        </button>

        {/* Data */}
        <div className="card-game p-4">
          <h2 className="font-bold text-sm text-muted-foreground mb-3">DATA</h2>
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="flex items-center gap-2 text-game-wrong font-semibold text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Reset All Progress
            </button>
          ) : (
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-sm text-red-800 font-semibold mb-2">
                This will delete all your progress. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-game-wrong text-white rounded-xl text-sm font-bold"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowReset(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
