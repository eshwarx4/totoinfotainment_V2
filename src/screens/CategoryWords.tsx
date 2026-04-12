import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { ALL_WORDS, WORD_CATEGORIES, WordItem } from '@/data/wordData';
import { ArrowLeft, Volume2, Check, X, Mic, RotateCcw, ChevronRight } from 'lucide-react';
import { useRef, useState, useCallback, useEffect } from 'react';
import { getEmojiImageUrl } from '@/lib/emojiImages';
import { Confetti } from '@/components/effects/Confetti';
import { CoinPopup } from '@/components/effects/CoinPopup';
import { playCorrectSound, playWrongSound, playLearnSound, playSkipSound, playCompletionSound } from '@/lib/sounds';

/* ─── Voice Practice States ─── */
type VoiceState = 'idle' | 'listening' | 'processing' | 'correct' | 'incorrect';

/* ─── Voice Practice Panel ─── */
function VoicePractice({
  word,
  onClose,
}: {
  word: WordItem;
  onClose: () => void;
}) {
  const [state, setState] = useState<VoiceState>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const startListening = () => {
    setState('listening');
    // Mock: after 2.5s of "listening", go to processing
    timeoutRef.current = setTimeout(() => {
      setState('processing');
      // Mock: after 1s of "processing", randomly succeed/fail (70% success)
      timeoutRef.current = setTimeout(() => {
        const isCorrect = Math.random() > 0.3;
        setState(isCorrect ? 'correct' : 'incorrect');
        if (isCorrect) playCorrectSound();
        else playWrongSound();
      }, 800);
    }, 2500);
  };

  const reset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setState('idle');
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="voice-practice-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="voice-practice-panel">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <X className="w-4 h-4 text-white/70" />
        </button>

        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">Say this word</p>
        <h2 className="text-white text-3xl font-black mb-8">{word.english}</h2>

        {/* Mic area */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Pulse rings when listening */}
          {state === 'listening' && (
            <>
              <div className="voice-pulse-ring voice-pulse-ring-1" />
              <div className="voice-pulse-ring voice-pulse-ring-2" />
              <div className="voice-pulse-ring voice-pulse-ring-3" />
            </>
          )}

          {state === 'idle' && (
            <button
              onClick={startListening}
              className="voice-mic-btn"
            >
              <Mic className="w-8 h-8 text-white" />
            </button>
          )}

          {state === 'listening' && (
            <div className="voice-mic-btn voice-mic-listening">
              <div className="voice-wave-bars">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="voice-wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          )}

          {state === 'processing' && (
            <div className="voice-mic-btn voice-mic-processing">
              <div className="voice-spinner" />
            </div>
          )}

          {state === 'correct' && (
            <div className="voice-mic-btn voice-mic-correct">
              <Check className="w-10 h-10 text-white" />
            </div>
          )}

          {state === 'incorrect' && (
            <div className="voice-mic-btn voice-mic-incorrect">
              <X className="w-10 h-10 text-white" />
            </div>
          )}
        </div>

        {/* Status text */}
        <div className="text-center min-h-[60px]">
          {state === 'idle' && (
            <p className="text-white/50 text-sm">Tap the mic and say "<span className="text-white font-bold">{word.english}</span>"</p>
          )}
          {state === 'listening' && (
            <p className="text-white/80 text-sm animate-pulse">Listening...</p>
          )}
          {state === 'processing' && (
            <p className="text-white/60 text-sm">Checking your pronunciation...</p>
          )}
          {state === 'correct' && (
            <div className="voice-result-correct">
              <p className="text-emerald-300 text-lg font-bold mb-1">Great job!</p>
              <p className="text-white/50 text-xs">Your pronunciation sounds great</p>
              <button onClick={onClose} className="mt-4 px-6 py-2 rounded-full bg-emerald-500 text-white text-sm font-bold active:scale-95 transition-transform">
                Continue
              </button>
            </div>
          )}
          {state === 'incorrect' && (
            <div className="voice-result-incorrect">
              <p className="text-amber-300 text-lg font-bold mb-1">Try again</p>
              <p className="text-white/50 text-xs mb-3">Listen to the word and try once more</p>
              <button onClick={reset} className="px-5 py-2 rounded-full bg-white/15 text-white text-sm font-bold active:scale-95 transition-transform flex items-center gap-2 mx-auto">
                <RotateCcw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Word Card Component ─── */
function WordCard({
  word,
  catInfo,
  isLearned,
  dragX,
  isDragging,
  swipeDirection,
  feedbackEmoji,
  playingAudio,
  onDragStart,
  onDragMove,
  onDragEnd,
  onPlayAudio,
  onPractice,
}: {
  word: WordItem;
  catInfo: typeof WORD_CATEGORIES[0] | undefined;
  isLearned: boolean;
  dragX: number;
  isDragging: boolean;
  swipeDirection: 'left' | 'right' | null;
  feedbackEmoji: string | null;
  playingAudio: string | null;
  onDragStart: (x: number) => void;
  onDragMove: (x: number) => void;
  onDragEnd: () => void;
  onPlayAudio: (url: string, type: string) => void;
  onPractice: () => void;
}) {
  const rotation = dragX * 0.06;
  const leftOpacity = dragX < -30 ? Math.min(Math.abs(dragX) / 120, 1) : 0;
  const rightOpacity = dragX > 30 ? Math.min(dragX / 120, 1) : 0;
  const scale = 1 - Math.abs(dragX) * 0.0003;

  return (
    <div
      className={`catcard-swipe ${swipeDirection === 'left' ? 'catcard-exit-left' : ''} ${swipeDirection === 'right' ? 'catcard-exit-right' : ''}`}
      style={{
        transform: swipeDirection ? undefined : `translateX(${dragX}px) rotate(${rotation}deg) scale(${scale})`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
      onMouseDown={(e) => onDragStart(e.clientX)}
      onMouseMove={(e) => onDragMove(e.clientX)}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
      onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
      onTouchEnd={onDragEnd}
    >
      {/* Swipe indicators */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none" style={{ opacity: leftOpacity }}>
        <div className="catcard-badge-skip">
          <X className="w-4 h-4" /> SKIP
        </div>
      </div>
      <div className="absolute top-6 right-6 z-10 pointer-events-none" style={{ opacity: rightOpacity }}>
        <div className="catcard-badge-learn">
          <Check className="w-4 h-4" /> LEARNED
        </div>
      </div>

      {/* Coin reward feedback */}
      {feedbackEmoji && (
        <div className="absolute top-1/4 left-1/2 z-20 pointer-events-none">
          <div className="catcard-coin-pop">{feedbackEmoji}</div>
        </div>
      )}

      {/* Glow borders — green on right, red on left */}
      <div className="catcard-glow" style={{ opacity: rightOpacity * 0.7 }} />
      <div className="catcard-glow-skip" style={{ opacity: leftOpacity * 0.5 }} />

      {/* Card inner */}
      <div className="catcard-inner">
        {/* Category badge + learned */}
        <div className="flex items-center justify-between">
          <span className={`catcard-category bg-gradient-to-r ${catInfo?.color || 'from-gray-400 to-gray-500'}`}>
            {catInfo?.emoji} {word.category}
          </span>
          {isLearned && (
            <span className="catcard-learned-badge">
              <Check className="w-3 h-3" /> Learned
            </span>
          )}
        </div>

        {/* HERO illustration */}
        <div className="catcard-image-wrap">
          <img
            src={word.imageUrl}
            alt={word.english}
            className="catcard-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getEmojiImageUrl(word.english, word.category);
            }}
          />
        </div>

        {/* Word — large and prominent */}
        <h2 className="catcard-word">{word.english}</h2>

        {/* Audio control pills */}
        <div className="flex items-center justify-center gap-3 mb-3" style={{ position: 'relative', zIndex: 1 }}>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onPlayAudio(word.audioEnglishUrl, 'eng'); }}
            className={`catcard-audio-btn ${playingAudio === 'eng' ? 'catcard-audio-active-blue' : 'catcard-audio-blue'}`}
          >
            <Volume2 className="w-4 h-4" />
            English
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onPlayAudio(word.audioTotoUrl, 'toto'); }}
            className={`catcard-audio-btn ${playingAudio === 'toto' ? 'catcard-audio-active-green' : 'catcard-audio-green'}`}
          >
            <Volume2 className="w-4 h-4" />
            Toto
          </button>
        </div>

        {/* Practice CTA — dominant gradient */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onPractice(); }}
          className="catcard-practice-btn"
        >
          <Mic className="w-4 h-4" />
          Tap to Speak
        </button>

        {/* Action bar — skip vs learn */}
        <div className="catcard-action-bar">
          <span className="catcard-skip-hint">
            <X className="w-3.5 h-3.5" /> Skip
          </span>
          <span className="catcard-learn-hint">
            Learn +5 <span className="catcard-coin-icon">$</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Completion Screen ─── */
function CompletionScreen({
  catInfo,
  totalWords,
  learnedInSession,
  coinsEarned,
  onExploreNext,
  onGoBack,
}: {
  catInfo: typeof WORD_CATEGORIES[0] | undefined;
  totalWords: number;
  learnedInSession: number;
  coinsEarned: number;
  onExploreNext: () => void;
  onGoBack: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    playCompletionSound();
  }, []);

  return (
    <div className="catcard-completion">
      {showConfetti && <Confetti duration={3000} />}
      <div className="catcard-completion-inner">
        <div className="text-6xl mb-4 animate-bounce">{catInfo?.emoji || '🎉'}</div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">
          Category Complete!
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          You finished <span className="font-bold text-slate-700">{catInfo?.label}</span>!
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-500">{totalWords}</div>
            <div className="text-[11px] text-slate-400 font-medium">Cards</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <div className="text-2xl font-black text-blue-500">{learnedInSession}</div>
            <div className="text-[11px] text-slate-400 font-medium">Learned</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <div className="text-2xl font-black text-amber-500">+{coinsEarned}</div>
            <div className="text-[11px] text-slate-400 font-medium">Coins</div>
          </div>
        </div>

        <button
          onClick={onExploreNext}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 text-white font-bold text-base shadow-lg shadow-emerald-200 active:scale-[0.97] transition-transform mb-3"
        >
          Explore Next Category <ChevronRight className="w-4 h-4 inline" />
        </button>
        <button
          onClick={onGoBack}
          className="text-sm text-slate-400 font-medium"
        >
          Back to Learn
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function CategoryWords() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const game = useGame();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const [feedbackEmoji, setFeedbackEmoji] = useState<string | null>(null);
  const [showVoice, setShowVoice] = useState(false);
  const [coinPopup, setCoinPopup] = useState<number | null>(null);
  const [learnedInSession, setLearnedInSession] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);

  const decodedCategory = decodeURIComponent(category || '');
  const catInfo = WORD_CATEGORIES.find(c => c.id === decodedCategory);
  const words = ALL_WORDS.filter(w => w.category === decodedCategory);
  const learnedInCat = words.filter(w => game.learnedWords.includes(w.id)).length;

  const currentWord = words[currentIndex];
  const nextWord = words[currentIndex + 1];
  const isLearned = currentWord ? game.learnedWords.includes(currentWord.id) : false;
  const isComplete = currentIndex >= words.length;
  const progress = words.length ? ((currentIndex) / words.length) * 100 : 0;

  const playAudio = (url: string, type: string) => {
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingAudio(type);
    audio.play().catch(() => {});
    audio.onended = () => setPlayingAudio(null);
  };

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    if (direction === 'right' && currentWord && !game.learnedWords.includes(currentWord.id)) {
      game.markWordLearned(currentWord.id);
      setFeedbackEmoji('+5 ◉');
      setCoinPopup(5);
      setLearnedInSession(p => p + 1);
      setCoinsEarned(p => p + 5);
      playLearnSound();
    } else if (direction === 'left') {
      playSkipSound();
    }
    setTimeout(() => {
      setCurrentIndex(i => i + 1);
      setSwipeDirection(null);
      setDragX(0);
      setFeedbackEmoji(null);
    }, 350);
  }, [currentWord, game]);

  const onDragStart = (clientX: number) => {
    setIsDragging(true);
    startX.current = clientX;
  };

  const onDragMove = (clientX: number) => {
    if (!isDragging) return;
    setDragX(clientX - startX.current);
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(dragX) > 80) {
      handleSwipe(dragX > 0 ? 'right' : 'left');
    } else {
      setDragX(0);
    }
  };

  // Navigate to next category
  const goToNextCategory = () => {
    const currentIdx = WORD_CATEGORIES.findIndex(c => c.id === decodedCategory);
    const nextCat = WORD_CATEGORIES[(currentIdx + 1) % WORD_CATEGORIES.length];
    navigate(`/learn/category/${encodeURIComponent(nextCat.id)}`);
  };

  /* ─── Completion state ─── */
  if (isComplete && words.length > 0) {
    return (
      <div className="min-h-screen catcard-page-bg">
        <CompletionScreen
          catInfo={catInfo}
          totalWords={words.length}
          learnedInSession={learnedInSession}
          coinsEarned={coinsEarned}
          onExploreNext={goToNextCategory}
          onGoBack={() => navigate('/learn')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen catcard-page-bg screen-enter">
      {/* Coin popup */}
      {coinPopup && (
        <CoinPopup amount={coinPopup} onDone={() => setCoinPopup(null)} />
      )}

      {/* Voice practice overlay */}
      {showVoice && currentWord && (
        <VoicePractice word={currentWord} onClose={() => setShowVoice(false)} />
      )}

      {/* ── Header ── */}
      <div className={`catcard-header bg-gradient-to-br ${catInfo?.color || 'from-gray-400 to-gray-500'}`}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/learn')}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <span className="text-white/80 text-sm font-bold">
              {currentIndex + 1} / {words.length}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{catInfo?.emoji || '📚'}</span>
            <div>
              <h1 className="text-xl font-bold text-white">{catInfo?.label || decodedCategory}</h1>
              <p className="text-xs text-white/70">{learnedInCat} of {words.length} mastered</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Card Stack ── */}
      <div className="max-w-lg mx-auto px-4">
        <div className="catcard-stack">
          {/* Peek card (next — subtle stack hint) */}
          {nextWord && (
            <div className="catcard-peek">
              <div className="catcard-inner" style={{ opacity: 0.35, transform: 'scale(0.95)' }}>
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <img
                    src={nextWord.imageUrl}
                    alt={nextWord.english}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-100/50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getEmojiImageUrl(nextWord.english, nextWord.category);
                    }}
                  />
                  <span className="text-sm font-bold text-slate-400">{nextWord.english}</span>
                </div>
              </div>
            </div>
          )}

          {/* Current card */}
          {currentWord && (
            <WordCard
              word={currentWord}
              catInfo={catInfo}
              isLearned={isLearned}
              dragX={dragX}
              isDragging={isDragging}
              swipeDirection={swipeDirection}
              feedbackEmoji={feedbackEmoji}
              playingAudio={playingAudio}
              onDragStart={onDragStart}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
              onPlayAudio={playAudio}
              onPractice={() => setShowVoice(true)}
            />
          )}
        </div>

        {/* Animated progress bar */}
        <div className="mt-5 px-1">
          <div className="catcard-progress-label">
            <span>{currentIndex} of {words.length} reviewed</span>
            <span className="text-emerald-600">{learnedInSession} learned</span>
          </div>
          <div className="catcard-progress-track">
            <div
              className="catcard-progress-fill"
              style={{ width: `${words.length ? (currentIndex / words.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Empty state ── */}
      {words.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-semibold">No words in this category yet</p>
        </div>
      )}
    </div>
  );
}
