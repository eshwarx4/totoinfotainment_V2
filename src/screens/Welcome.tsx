import { useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Trash2 } from 'lucide-react';
import mascotImage from '@/assets/toto-mascot.png';

export default function Welcome() {
  const navigate = useNavigate();
  const game = useGame();
  const [name, setName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [users, setUsers] = useState(game.listUsers());
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // If already logged in and onboarded, go to learn
    if (game.isLoggedIn && game.onboardingComplete && game.tutorialComplete) {
      navigate('/learn', { replace: true });
    } else if (game.isLoggedIn && game.onboardingComplete) {
      navigate('/tutorial', { replace: true });
    }
  }, [game.isLoggedIn, game.onboardingComplete, game.tutorialComplete, navigate]);

  // Refresh user list after deletions
  const refreshUsers = () => setUsers(game.listUsers());

  const handleExistingUser = (userId: string) => {
    game.switchUser(userId);
    // After switching, the effect above will redirect
    navigate('/learn', { replace: true });
  };

  const handleDeleteUser = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (confirm('Delete this account?')) {
      game.deleteUser(userId);
      refreshUsers();
    }
  };

  const handleNewUser = () => {
    setShowInput(true);
  };

  const handleNameSubmit = () => {
    if (name.trim()) {
      game.createUser(name.trim());
      navigate('/profile', { state: { name: name.trim() } });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) handleNameSubmit();
  };

  // Voice input using Web Speech API
  const startListening = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setName(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const hasExistingUsers = users.length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 screen-enter relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[8%] left-[8%] text-5xl opacity-20 animate-float" style={{ animationDelay: '0s', animationDuration: '3s' }}>🌲</div>
        <div className="absolute top-[15%] right-[12%] text-4xl opacity-20 animate-float" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>🦜</div>
        <div className="absolute bottom-[28%] left-[15%] text-4xl opacity-15 animate-float" style={{ animationDelay: '1s', animationDuration: '4s' }}>🌺</div>
        <div className="absolute bottom-[15%] right-[8%] text-5xl opacity-15 animate-float" style={{ animationDelay: '0.3s', animationDuration: '3.2s' }}>🏔️</div>
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-green-300/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        {/* Animated Mascot */}
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-game-primary/10 rounded-full blur-2xl scale-150" />
          <div className="relative">
            <img
              src={mascotImage}
              alt="Toto Mascot"
              className="w-24 h-24 object-contain mascot-bounce select-none"
            />
            {showInput && (
              <div className="absolute -top-2 -right-4 bg-white rounded-2xl px-3 py-1.5 shadow-game text-sm font-bold text-game-primary animate-fade-in">
                Hello! 👋
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black text-foreground text-center mb-1 tracking-tight">
          Toto Infotainment
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-1 max-w-xs">
          Learn the Toto language through fun games!
        </p>
        <p className="text-[11px] text-muted-foreground/50 text-center mb-5">
          An endangered language preservation project
        </p>

        {/* Existing users list */}
        {hasExistingUsers && !showInput && (
          <div className="w-full mb-4 animate-fade-in">
            <p className="text-xs font-bold text-muted-foreground text-center mb-2 uppercase tracking-wider">
              Welcome back!
            </p>
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.userId}
                  onClick={() => handleExistingUser(user.userId)}
                  className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-game
                           hover:shadow-lg transition-all active:scale-[0.98] text-left"
                >
                  <span className="text-3xl">{user.playerAvatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{user.playerName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      🪙 {user.totalCoins} · 💎 {user.totalDiamonds}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteUser(e, user.userId)}
                    className="p-2 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </button>
              ))}
            </div>
            <button
              onClick={handleNewUser}
              className="w-full mt-3 py-3 rounded-2xl border-2 border-dashed border-gray-200
                       text-sm font-bold text-muted-foreground hover:border-game-primary
                       hover:text-game-primary transition-colors"
            >
              + New Account
            </button>
          </div>
        )}

        {/* New user name input (slides in) */}
        {(!hasExistingUsers || showInput) && (
          <div className="w-full animate-fade-in">
            {!showInput && !hasExistingUsers ? (
              <button
                onClick={handleNewUser}
                className="btn-game-primary text-xl px-12 py-5 rounded-full w-full"
              >
                Let's Go! 🚀
              </button>
            ) : (
              <>
                <label className="block text-sm font-bold text-center text-muted-foreground mb-2">
                  What's your name?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your name..."
                    className="w-full text-center text-xl font-semibold px-6 py-4 pr-14 rounded-2xl
                             border-2 border-border bg-white focus:border-game-primary
                             focus:outline-none transition-colors shadow-game"
                    maxLength={20}
                    autoFocus
                  />
                  {/* Mic button */}
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full
                              transition-all ${isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-gray-100 text-gray-500 hover:bg-game-primary/10 hover:text-game-primary'
                      }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  onClick={handleNameSubmit}
                  disabled={!name.trim()}
                  className="btn-game-primary text-xl px-12 py-5 rounded-full w-full mt-4
                           disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Start Adventure! 🎉
                </button>
                {hasExistingUsers && (
                  <button
                    onClick={() => setShowInput(false)}
                    className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to accounts
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Decorative dots */}
        <div className="flex gap-2 mt-6">
          <div className="w-2 h-2 rounded-full bg-game-primary animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-game-secondary animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="w-2 h-2 rounded-full bg-game-accent animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>
    </div>
  );
}
