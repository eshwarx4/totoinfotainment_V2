import { useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { ALL_WORDS, WORD_CATEGORIES, getCategoryCounts } from '@/data/wordData';
import { Volume2, ChevronRight, BookOpen, Sparkles, Check, X } from 'lucide-react';
import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { getEmojiImageUrl } from '@/lib/emojiImages';
import NudgeBar from '@/components/NudgeBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { sfxClick, sfxCorrect, sfxWrong } from '@/hooks/useGameSFX';
import type { WordItem } from '@/data/wordData';

/* ─────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────── */

function getGreeting(name: string, t: (key: string) => string) {
  const h = new Date().getHours();
  if (h < 12) return { text: `${t('learn.greeting.morning')}, ${name}`, emoji: '☀️', sub: t('learn.greeting.sub.morning') };
  if (h < 17) return { text: `${t('learn.greeting.afternoon')}, ${name}`, emoji: '🌤️', sub: t('learn.greeting.sub.afternoon') };
  return { text: `${t('learn.greeting.evening')}, ${name}`, emoji: '🌙', sub: t('learn.greeting.sub.evening') };
}

function getDailyWords(learnedIds: string[], count = 5): WordItem[] {
  const dayOffset = Math.floor(Date.now() / 86400000);
  // prioritize unlearned words, then cycle
  const unlearned = ALL_WORDS.filter(w => !learnedIds.includes(w.id));
  const pool = unlearned.length > 0 ? unlearned : ALL_WORDS;
  const start = dayOffset % pool.length;
  const result: WordItem[] = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    result.push(pool[(start + i) % pool.length]);
  }
  return result;
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────── */

/** TASK 1 — Personalized Header */
function PersonalizedHeader({
  name, totalCoins, totalDiamonds, learnedCount, totalWords, t,
}: {
  name: string; totalCoins: number; totalDiamonds: number; learnedCount: number; totalWords: number; t: (key: string) => string;
}) {
  const greeting = getGreeting(name, t);
  const progress = Math.round((learnedCount / totalWords) * 100);

  return (
    <div className="learn-header-bg text-white px-5 pt-6 pb-10">
      <div className="max-w-lg mx-auto">
        {/* Top row: greeting + currency */}
        <div className="flex items-start justify-between mb-5">
          <div className="learn-greeting-animate">
            <p className="text-sm opacity-70 mb-0.5">{greeting.sub}</p>
            <h1 className="text-[22px] font-bold leading-tight tracking-tight">
              {greeting.text} <span className="inline-block animate-wave">{greeting.emoji}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <CurrencyDisplay type="coin" value={totalCoins} />
            <CurrencyDisplay type="diamond" value={totalDiamonds} />
          </div>
        </div>

        {/* Progress pill */}
        <div className="learn-progress-pill">
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
            <span className="opacity-90">{t('learn.wordsMastered')}</span>
            <span className="font-bold">{learnedCount} / {totalWords}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}



/** TASK 3 — Swipeable Word Cards (Bumble-style) */
function SwipeableWords({
  words, learnedWords, onMarkLearned, t,
}: {
  words: WordItem[]; learnedWords: string[]; onMarkLearned: (id: string) => void; t: (key: string) => string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [feedbackEmoji, setFeedbackEmoji] = useState<string | null>(null);

  const currentWord = words[currentIndex];
  const nextWord = words[currentIndex + 1];
  const isLearned = currentWord ? learnedWords.includes(currentWord.id) : false;

  const playAudio = (url: string, type: string) => {
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingAudio(type);
    audio.play().catch(() => { });
    audio.onended = () => setPlayingAudio(null);
  };

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    if (direction === 'right' && currentWord && !learnedWords.includes(currentWord.id)) {
      onMarkLearned(currentWord.id);
      setFeedbackEmoji('+5 ◉');
      sfxCorrect();
    } else {
      sfxWrong();
    }
    setTimeout(() => {
      setCurrentIndex(i => Math.min(i + 1, words.length));
      setSwipeDirection(null);
      setDragX(0);
      setFeedbackEmoji(null);
    }, 300);
  }, [currentWord, learnedWords, onMarkLearned, words.length]);

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

  if (currentIndex >= words.length) {
    return (
      <div className="swipe-done-card text-center py-8">
        <div className="text-4xl mb-2">🎉</div>
        <p className="font-semibold text-foreground">{t('learn.allCaughtUp')}</p>
        <p className="text-xs text-muted-foreground mt-1">{t('learn.comeBackTomorrow')}</p>
      </div>
    );
  }

  const rotation = dragX * 0.08;
  const leftOpacity = dragX < -30 ? Math.min(Math.abs(dragX) / 100, 1) : 0;
  const rightOpacity = dragX > 30 ? Math.min(dragX / 100, 1) : 0;

  return (
    <div className="relative w-full" style={{ height: 280 }}>
      {/* Next card (peeking) */}
      {nextWord && (
        <div className="swipe-card-peek absolute inset-0">
          <div className="swipe-card-inner p-4 flex items-center gap-4 opacity-50 scale-[0.96]">
            <img
              src={nextWord.imageUrl}
              alt={nextWord.english}
              className="w-16 h-16 rounded-xl object-cover bg-slate-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getEmojiImageUrl(nextWord.english, nextWord.category);
              }}
            />
            <div>
              <h3 className="text-lg font-bold text-foreground/50">{nextWord.english}</h3>
              <p className="text-xs text-muted-foreground/50">{t(`category.${nextWord.category}`)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Current card */}
      <div
        className={`swipe-card absolute inset-0 ${swipeDirection === 'left' ? 'swipe-exit-left' : ''} ${swipeDirection === 'right' ? 'swipe-exit-right' : ''}`}
        style={{
          transform: swipeDirection ? undefined : `translateX(${dragX}px) rotate(${rotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.25s ease',
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
        <div className="absolute top-4 left-4 z-10 pointer-events-none" style={{ opacity: leftOpacity }}>
          <div className="bg-rose-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
            <X className="w-3 h-3" /> {t('learn.skip')}
          </div>
        </div>
        <div className="absolute top-4 right-4 z-10 pointer-events-none" style={{ opacity: rightOpacity }}>
          <div className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
            <Check className="w-3 h-3" /> {t('learn.learned')}
          </div>
        </div>

        {/* Coin feedback */}
        {feedbackEmoji && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="coin-feedback font-bold text-emerald-500 text-xl">{feedbackEmoji}</div>
          </div>
        )}

        <div className="swipe-card-inner p-6 h-full flex flex-col cursor-grab active:cursor-grabbing touch-none select-none">
          {/* Top: category + learned badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              {t(`category.${currentWord.category}`)}
            </span>
            {isLearned && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> {t('learn.learned')}
              </span>
            )}
          </div>

          {/* Body: image + word + audio */}
          <div className="flex-1 flex items-center gap-5">
            <img
              src={currentWord.imageUrl}
              alt={currentWord.english}
              className="w-24 h-24 rounded-2xl object-cover bg-slate-100 shadow-md pointer-events-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getEmojiImageUrl(currentWord.english, currentWord.category);
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-black text-foreground leading-tight">{currentWord.english}</h3>
              <div className="flex gap-2.5 mt-3">
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); playAudio(currentWord.audioEnglishUrl, 'eng'); }}
                  className={`audio-btn ${playingAudio === 'eng' ? 'audio-btn-active-blue' : 'audio-btn-blue'}`}
                >
                  <Volume2 className="w-4 h-4" />
                  {t('common.english')}
                </button>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); playAudio(currentWord.audioTotoUrl, 'toto'); }}
                  className={`audio-btn ${playingAudio === 'toto' ? 'audio-btn-active-green' : 'audio-btn-green'}`}
                >
                  <Volume2 className="w-4 h-4" />
                  {t('common.toto')}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom hint */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" /> {t('learn.swipeLeftSkip')}
            </span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
              {t('learn.swipeRightLearn')} <Check className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Card counter */}
      <div className="absolute -bottom-7 left-0 right-0 flex justify-center gap-1">
        {words.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-5 bg-emerald-500' : i < currentIndex ? 'w-1.5 bg-emerald-400' : 'w-1.5 bg-slate-300'
              }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */

export default function LearnTab() {
  const navigate = useNavigate();
  const game = useGame();
  const { t } = useLanguage();
  const total = game.getTotalProgress();
  const categoryCounts = getCategoryCounts();

  const learnedCount = game.learnedWords.length;
  const totalWords = ALL_WORDS.length;

  const dailyWords = useMemo(() => getDailyWords(game.learnedWords, 5), [game.learnedWords]);

  return (
    <div className="learn-page-bg min-h-screen pb-24">
      {/* TASK 1: Personalized Header */}
      <PersonalizedHeader
        name={game.playerName || 'Learner'}
        totalCoins={total.totalCoins}
        totalDiamonds={total.totalDiamonds}
        learnedCount={learnedCount}
        totalWords={totalWords}
        t={t}
      />

      <div className="max-w-lg mx-auto px-4 -mt-5 space-y-5">
        {/* Smart Nudge Bar */}
        <NudgeBar rotateInterval={6000} />

        {/* TASK 3: Swipeable Word Cards */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-slate-600">{t('learn.todaysWords')}</h2>
          </div>
          <SwipeableWords
            words={dailyWords}
            learnedWords={game.learnedWords}
            onMarkLearned={game.markWordLearned}
            t={t}
          />
        </div>

        {/* Categories */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-slate-800">{t('learn.browseByCategory')}</h2>
            <span className="text-[11px] text-slate-500 font-semibold">{totalWords} {t('learn.words')}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {WORD_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const learnedInCat = ALL_WORDS.filter(
                w => w.category === cat.id && game.learnedWords.includes(w.id)
              ).length;
              const catProgress = count > 0 ? Math.round((learnedInCat / count) * 100) : 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/learn/category/${encodeURIComponent(cat.id)}`)}
                  className="category-card text-center"
                >
                  <div className="text-3xl mb-2">{cat.emoji}</div>
                  <p className="text-sm font-semibold truncate text-foreground">{t(`category.${cat.id}`)}</p>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-500`}
                      style={{ width: `${catProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">{learnedInCat}/{count}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Concepts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-slate-800">{t('learn.concepts')}</h2>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2.5">
            {[
              { id: '770e8400-e29b-41d4-a716-446655440001', title: 'Evaporation', emoji: '💧', slides: 3 },
              { id: '770e8400-e29b-41d4-a716-446655440002', title: 'Plant Growth', emoji: '🌱', slides: 3 },
              { id: '770e8400-e29b-41d4-a716-446655440003', title: 'Food Sources', emoji: '🌾', slides: 3 },
              { id: '770e8400-e29b-41d4-a716-446655440004', title: 'Seasons & Monsoon', emoji: '🌦️', slides: 3 },
              { id: '770e8400-e29b-41d4-a716-446655440005', title: 'Water Cycle', emoji: '🔄', slides: 3 },
              { id: '770e8400-e29b-41d4-a716-446655440006', title: 'Photosynthesis', emoji: '☀️', slides: 3 },
              { id: '770e8400-e29b-41d4-a716-446655440007', title: 'Seasons', emoji: '🍂', slides: 3 },
              { id: 'concept-cooking-rice', title: 'Cooking Rice', emoji: '🍚', slides: 3 },
              { id: 'concept-butterfly-life', title: "The Butterfly's Life", emoji: '🦋', slides: 3 },
              { id: 'concept-honeybee', title: 'The Busy Honeybee', emoji: '🐝', slides: 3 },
            ].map(concept => {
              const isCompleted = (game.completedConcepts || []).includes(concept.id);
              return (
                <button
                  key={concept.id}
                  onClick={() => navigate(`/learn/concept/${concept.id}`)}
                  className="concept-row w-full"
                >
                  <div className="concept-row-icon">{concept.emoji}</div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-[15px] text-foreground">{concept.title}</p>
                    <p className="text-xs text-muted-foreground">{concept.slides} {t('learn.slides')}</p>
                  </div>
                  {isCompleted ? (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">{t('learn.done')} ✅</span>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-slate-800">{t('learn.folkStories')}</h2>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2.5">
            {[
              { id: '550e8400-e29b-41d4-a716-446655440001', title: 'The Brave Toto Boy', emoji: '🐯', desc: 'A story of courage and unity' },
              { id: '550e8400-e29b-41d4-a716-446655440002', title: 'The River and the Drum', emoji: '🥁', desc: 'Nature listens to our actions' },
            ].map(story => {
              const isCompleted = game.completedStories.includes(story.id);
              return (
                <button
                  key={story.id}
                  onClick={() => navigate(`/learn/story/${story.id}`)}
                  className="concept-row w-full"
                >
                  <span className="text-3xl">{story.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-[15px] text-foreground">{story.title}</p>
                    <p className="text-xs text-muted-foreground">{story.desc}</p>
                  </div>
                  {isCompleted ? (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">{t('learn.read')} ✅</span>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold">{t('learn.new')}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily tip — refined */}
        <div className="learn-tip-card mb-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🦉</span>
            <div>
              <p className="text-sm font-bold text-violet-700">{t('learn.totoTip')}</p>
              <p className="text-[13px] text-violet-600/80 mt-0.5 leading-relaxed">
                {t('learn.tipText')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
