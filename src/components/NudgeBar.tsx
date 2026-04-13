// ==========================================
// NUDGE BAR — Global intelligent guidance system
// Reusable across Learn, Play, Map, etc.
// ==========================================

import { useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ALL_WORDS, WORD_CATEGORIES } from '@/data/wordData';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { WorldId } from '@/types/game';

/* ─────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────── */

interface Nudge {
  id: string;
  icon: string;           // emoji
  accentIcon: string;     // secondary floating emoji
  title: string;
  subtitle: string;
  cta: string;
  route: string;
  theme: NudgeTheme;
  priority: number;       // higher = shown first
}

type NudgeTheme =
  | 'streak'      // warm orange-red
  | 'explore'     // violet-indigo
  | 'revise'      // blue-cyan
  | 'progress'    // emerald-teal
  | 'welcome'     // green-lime
  | 'challenge'   // pink-rose
  | 'milestone';  // amber-gold

/* ─────────────────────────────────────────────
   NUDGE GENERATION ENGINE
   ───────────────────────────────────────────── */

function generateNudges(
  learnedWords: string[],
  streak: number,
  totalCoins: number,
  completedStories: string[],
  completedConcepts: string[],
  worlds: Record<WorldId, { levels: Record<number, { completed: boolean; stars: number }> }>,
  t: (key: string) => string,
): Nudge[] {
  const nudges: Nudge[] = [];
  const learnedCount = learnedWords.length;
  const totalWords = ALL_WORDS.length;
  const hour = new Date().getHours();

  // --- Explored / unexplored categories ---
  const exploredCats = new Set<string>();
  for (const w of ALL_WORDS) {
    if (learnedWords.includes(w.id)) exploredCats.add(w.category);
  }
  const unexploredCats = WORD_CATEGORIES.filter(c => !exploredCats.has(c.id));

  // --- Words learned "yesterday" (mock: based on count) ---
  // We approximate: last 3 words in the learnedWords array were recent
  const recentWords = learnedWords.slice(-3).map(
    id => ALL_WORDS.find(w => w.id === id)
  ).filter(Boolean);

  // --- Completed levels count ---
  let totalCompletedLevels = 0;
  let totalStars = 0;
  for (const wid of Object.keys(worlds) as WorldId[]) {
    for (const lv of Object.values(worlds[wid].levels)) {
      if (lv.completed) totalCompletedLevels++;
      totalStars += lv.stars;
    }
  }

  // =====================
  // RULE 1: Welcome (new user)
  // =====================
  if (learnedCount === 0 && totalCompletedLevels === 0) {
    nudges.push({
      id: 'welcome',
      icon: '🌱',
      accentIcon: '✨',
      title: t('nudge.welcome.title'),
      subtitle: t('nudge.welcome.subtitle'),
      cta: t('nudge.welcome.cta'),
      route: '/learn/category/Animals',
      theme: 'welcome',
      priority: 100,
    });
  }

  // =====================
  // RULE 2: Streak (high priority)
  // =====================
  if (streak >= 7) {
    nudges.push({
      id: 'streak-week',
      icon: '🔥',
      accentIcon: '⚡',
      title: `${streak}${t('nudge.streak.week.title')}`,
      subtitle: t('nudge.streak.week.subtitle'),
      cta: t('nudge.continue'),
      route: '/learn',
      theme: 'streak',
      priority: 95,
    });
  } else if (streak >= 3) {
    nudges.push({
      id: 'streak-good',
      icon: '🔥',
      accentIcon: '💪',
      title: `${streak}${t('nudge.streak.good.title')}`,
      subtitle: t('nudge.streak.good.subtitle'),
      cta: t('nudge.continueLearning'),
      route: '/learn/category/Animals',
      theme: 'streak',
      priority: 90,
    });
  } else if (streak === 1) {
    nudges.push({
      id: 'streak-start',
      icon: '🌟',
      accentIcon: '🔥',
      title: t('nudge.streak.start.title'),
      subtitle: t('nudge.streak.start.subtitle'),
      cta: t('nudge.learnMore'),
      route: '/learn/category/Animals',
      theme: 'streak',
      priority: 60,
    });
  }

  // =====================
  // RULE 3: Yesterday progress nudge
  // =====================
  if (recentWords.length > 0 && learnedCount >= 2) {
    const target = recentWords.length + 1;
    nudges.push({
      id: 'yesterday-beat',
      icon: '🚀',
      accentIcon: '📈',
      title: t('nudge.yesterday.title').replace('{count}', String(recentWords.length)),
      subtitle: t('nudge.yesterday.subtitle').replace('{target}', String(target)),
      cta: t('nudge.letsGo'),
      route: '/learn',
      theme: 'progress',
      priority: 75,
    });
  }

  // =====================
  // RULE 4: Unexplored category
  // =====================
  if (unexploredCats.length > 0) {
    const cat = unexploredCats[0];
    const catLabel = t(`category.${cat.id}`);
    nudges.push({
      id: `explore-${cat.id}`,
      icon: cat.emoji,
      accentIcon: '🧭',
      title: t('nudge.unexplored.title').replace('{category}', catLabel),
      subtitle: t('nudge.unexplored.subtitle').replace('{category}', catLabel),
      cta: t('nudge.explore'),
      route: `/learn/category/${encodeURIComponent(cat.id)}`,
      theme: 'explore',
      priority: learnedCount >= 2 ? 70 : 50,
    });
    // Add a second unexplored category if available
    if (unexploredCats.length > 1) {
      const cat2 = unexploredCats[1];
      const cat2Label = t(`category.${cat2.id}`);
      const wordCount = ALL_WORDS.filter(w => w.category === cat2.id).length;
      nudges.push({
        id: `explore-${cat2.id}`,
        icon: cat2.emoji,
        accentIcon: '🗺️',
        title: t('nudge.waiting.title').replace('{category}', cat2Label),
        subtitle: t('nudge.waiting.subtitle').replace('{count}', String(wordCount)),
        cta: t('nudge.explore'),
        route: `/learn/category/${encodeURIComponent(cat2.id)}`,
        theme: 'explore',
        priority: 35,
      });
    }
  }

  // =====================
  // RULE 5: Revise nudge
  // =====================
  if (recentWords.length > 0 && learnedCount >= 5) {
    const reviseWord = recentWords[0]!;
    nudges.push({
      id: 'revise',
      icon: '🎯',
      accentIcon: '🧠',
      title: t('nudge.revise.title').replace('{word}', reviseWord.english),
      subtitle: t('nudge.revise.subtitle'),
      cta: t('nudge.reviseNow'),
      route: `/learn/category/${encodeURIComponent(reviseWord.category)}`,
      theme: 'revise',
      priority: 65,
    });
  }

  // =====================
  // RULE 6: Quick challenge
  // =====================
  if (learnedCount >= 5 && (hour >= 16 || hour <= 9)) {
    nudges.push({
      id: 'challenge',
      icon: '⚡',
      accentIcon: '🏆',
      title: t('nudge.challenge.title'),
      subtitle: t('nudge.challenge.subtitle'),
      cta: t('nudge.startChallenge'),
      route: '/play/challenge',
      theme: 'challenge',
      priority: 55,
    });
  }

  // =====================
  // RULE 7: Milestones
  // =====================
  if (learnedCount === 10 || learnedCount === 25 || learnedCount === 50) {
    nudges.push({
      id: `milestone-${learnedCount}`,
      icon: '🏅',
      accentIcon: '🎉',
      title: `${learnedCount} ${t('nudge.milestone.title')}`,
      subtitle: learnedCount === 50
        ? t('nudge.milestone.subtitle.50')
        : `${(learnedCount === 10 ? 25 : 50) - learnedCount} ${t('nudge.milestone.subtitle.other')}`,
      cta: t('nudge.keepGoing'),
      route: '/learn',
      theme: 'milestone',
      priority: 85,
    });
  }

  // =====================
  // RULE 8: General progress
  // =====================
  if (learnedCount > 0 && learnedCount < totalWords) {
    const pct = Math.round((learnedCount / totalWords) * 100);
    nudges.push({
      id: 'progress',
      icon: '📚',
      accentIcon: '💫',
      title: `${pct}${t('nudge.progress.title')}`,
      subtitle: `${learnedCount} / ${totalWords}`,
      cta: t('nudge.learnMore'),
      route: '/learn',
      theme: 'progress',
      priority: 30,
    });
  }

  // =====================
  // RULE 9: Unread concepts
  // =====================
  const totalConcepts = 7;
  if (completedConcepts.length < totalConcepts) {
    nudges.push({
      id: 'concepts',
      icon: '💡',
      accentIcon: '📖',
      title: `${totalConcepts - completedConcepts.length} ${t('nudge.concepts.title')}`,
      subtitle: t('nudge.concepts.subtitle'),
      cta: t('nudge.concepts.cta'),
      route: '/learn',
      theme: 'explore',
      priority: 40,
    });
  }

  // =====================
  // RULE 10: Time-of-day motivation (always present)
  // =====================
  if (hour < 12) {
    nudges.push({
      id: 'morning',
      icon: '☀️',
      accentIcon: '🌈',
      title: t('nudge.morning.title'),
      subtitle: t('nudge.morning.subtitle'),
      cta: t('nudge.quickSession'),
      route: '/learn',
      theme: 'welcome',
      priority: 20,
    });
  } else if (hour < 17) {
    nudges.push({
      id: 'afternoon',
      icon: '🌤️',
      accentIcon: '💪',
      title: t('nudge.afternoon.title'),
      subtitle: t('nudge.afternoon.subtitle'),
      cta: t('nudge.learnNow'),
      route: '/learn',
      theme: 'progress',
      priority: 20,
    });
  } else {
    nudges.push({
      id: 'evening',
      icon: '🌙',
      accentIcon: '🧘',
      title: t('nudge.evening.title'),
      subtitle: t('nudge.evening.subtitle'),
      cta: t('nudge.learnNow'),
      route: '/learn',
      theme: 'revise',
      priority: 20,
    });
  }

  // =====================
  // RULE 11: Fun facts (always present, rotates by day)
  // =====================
  const funFacts = [
    { id: 'fact-toto', icon: '🏔️', accentIcon: '🌿', title: t('nudge.fact.toto.title'), subtitle: t('nudge.fact.toto.subtitle'), theme: 'milestone' as NudgeTheme },
    { id: 'fact-brain', icon: '🧠', accentIcon: '⚡', title: t('nudge.fact.brain.title'), subtitle: t('nudge.fact.brain.subtitle'), theme: 'revise' as NudgeTheme },
    { id: 'fact-play', icon: '🎮', accentIcon: '🏆', title: t('nudge.fact.play.title'), subtitle: t('nudge.fact.play.subtitle'), theme: 'challenge' as NudgeTheme },
  ];
  const todayFact = funFacts[Math.floor(Date.now() / 86400000) % funFacts.length];
  nudges.push({
    ...todayFact,
    cta: t('nudge.learnMore'),
    route: todayFact.id === 'fact-play' ? '/play' : '/learn',
    priority: 15,
  });

  // Sort by priority descending
  nudges.sort((a, b) => b.priority - a.priority);
  return nudges;
}

/* ─────────────────────────────────────────────
   THEME CONFIG (colors, gradients)
   ───────────────────────────────────────────── */

const THEME_MAP: Record<NudgeTheme, {
  bg: string;
  border: string;
  glow: string;
  ctaColor: string;
  gradientFrom: string;
  gradientTo: string;
}> = {
  streak:    { bg: 'nudge-bg-streak',    border: 'border-orange-300', glow: 'shadow-orange-200/40', ctaColor: 'text-orange-600', gradientFrom: '#fff7ed', gradientTo: '#ffedd5' },
  explore:   { bg: 'nudge-bg-explore',   border: 'border-violet-300', glow: 'shadow-violet-200/40', ctaColor: 'text-violet-600', gradientFrom: '#f5f3ff', gradientTo: '#ede9fe' },
  revise:    { bg: 'nudge-bg-revise',    border: 'border-blue-300',   glow: 'shadow-blue-200/40',   ctaColor: 'text-blue-600',   gradientFrom: '#eff6ff', gradientTo: '#dbeafe' },
  progress:  { bg: 'nudge-bg-progress',  border: 'border-emerald-300', glow: 'shadow-emerald-200/40', ctaColor: 'text-emerald-600', gradientFrom: '#ecfdf5', gradientTo: '#d1fae5' },
  welcome:   { bg: 'nudge-bg-welcome',   border: 'border-green-300', glow: 'shadow-green-200/40', ctaColor: 'text-green-600',  gradientFrom: '#f0fdf4', gradientTo: '#dcfce7' },
  challenge: { bg: 'nudge-bg-challenge', border: 'border-rose-300',  glow: 'shadow-rose-200/40',  ctaColor: 'text-rose-600',   gradientFrom: '#fff1f2', gradientTo: '#ffe4e6' },
  milestone: { bg: 'nudge-bg-milestone', border: 'border-amber-300', glow: 'shadow-amber-200/40', ctaColor: 'text-amber-600',  gradientFrom: '#fffbeb', gradientTo: '#fef3c7' },
};

/* ─────────────────────────────────────────────
   FLOATING PARTICLE
   ───────────────────────────────────────────── */

function FloatingParticle({ emoji, delay, duration, left }: {
  emoji: string; delay: number; duration: number; left: number;
}) {
  return (
    <span
      className="nudge-particle"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {emoji}
    </span>
  );
}

/* ─────────────────────────────────────────────
   PROGRESS RING (tiny circular indicator)
   ───────────────────────────────────────────── */

function MiniRing({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width="48" height="48" viewBox="0 0 44 44" className="nudge-ring">
      <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-15" />
      <circle
        cx="22" cy="22" r="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="nudge-ring-fill"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   NUDGE BAR COMPONENT
   ───────────────────────────────────────────── */

interface NudgeBarProps {
  /** Auto-rotate interval in ms (0 = no rotation) */
  rotateInterval?: number;
  /** Compact mode for non-Learn screens */
  compact?: boolean;
}

export default function NudgeBar({ rotateInterval = 6000, compact = false }: NudgeBarProps) {
  const navigate = useNavigate();
  const game = useGame();
  const { t } = useLanguage();
  const total = game.getTotalProgress();

  const nudges = useMemo(() => generateNudges(
    game.learnedWords,
    game.streak,
    game.totalCoins,
    game.completedStories,
    game.completedConcepts || [],
    game.worlds,
    t,
  ), [game.learnedWords, game.streak, game.totalCoins, game.completedStories, game.completedConcepts, game.worlds, t]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-rotation
  useEffect(() => {
    if (rotateInterval <= 0 || nudges.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex(i => (i + 1) % nudges.length);
        setIsTransitioning(false);
      }, 300);
    }, rotateInterval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [rotateInterval, nudges.length]);

  const handleClick = useCallback(() => {
    if (nudges[activeIndex]) {
      navigate(nudges[activeIndex].route);
    }
  }, [navigate, nudges, activeIndex]);

  // Swipe to dismiss
  const dragX = useRef(0);
  const startX = useRef(0);
  const [swipeX, setSwipeX] = useState(0);
  const isDragging = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    dragX.current = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    dragX.current = e.clientX - startX.current;
    // Only allow right swipe (dismiss)
    if (dragX.current > 0) setSwipeX(dragX.current);
  };
  const onPointerUp = () => {
    isDragging.current = false;
    if (dragX.current > 120) {
      setDismissed(true);
    } else {
      setSwipeX(0);
    }
    dragX.current = 0;
  };

  if (nudges.length === 0 || dismissed) return null;

  const nudge = nudges[activeIndex % nudges.length];
  const theme = THEME_MAP[nudge.theme];
  const overallProgress = Math.round((game.learnedWords.length / ALL_WORDS.length) * 100);

  return (
    <div
      className={`nudge-bar-wrapper ${compact ? 'nudge-bar-compact' : ''}`}
      style={{
        transform: swipeX > 0 ? `translateX(${swipeX}px)` : undefined,
        opacity: swipeX > 80 ? 1 - (swipeX - 80) / 120 : 1,
        transition: isDragging.current ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Animated gradient background */}
      <div
        className="nudge-bar-bg"
        style={{
          background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
        }}
      />

      {/* Moving gradient wave */}
      <div className="nudge-wave" />

      {/* Floating particles */}
      <div className="nudge-particles">
        <FloatingParticle emoji={nudge.accentIcon} delay={0} duration={4} left={10} />
        <FloatingParticle emoji={nudge.accentIcon} delay={1.5} duration={5} left={55} />
        <FloatingParticle emoji={nudge.icon} delay={3} duration={4.5} left={85} />
      </div>

      {/* Content */}
      <button
        onClick={handleClick}
        className={`nudge-bar-content ${isTransitioning ? 'nudge-content-exit' : 'nudge-content-enter'}`}
      >
        {/* Left: icon ring */}
        <div className="nudge-icon-ring">
          <MiniRing progress={overallProgress} />
          <span className="nudge-icon-emoji">{nudge.icon}</span>
        </div>

        {/* Center: text */}
        <div className="flex-1 min-w-0 text-left">
          <p className={`nudge-title ${compact ? 'text-sm' : 'text-[15px]'}`}>
            {nudge.title}
          </p>
          {!compact && (
            <p className="nudge-subtitle">{nudge.subtitle}</p>
          )}
        </div>

        {/* Right: CTA */}
        <div className={`nudge-cta ${theme.ctaColor}`}>
          <span className="nudge-cta-text">{nudge.cta}</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>

      {/* Dot indicators */}
      {nudges.length > 1 && (
        <div className="nudge-dots">
          {nudges.slice(0, Math.min(nudges.length, 5)).map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setIsTransitioning(true);
                setTimeout(() => {
                  setActiveIndex(i);
                  setIsTransitioning(false);
                }, 200);
                // Reset timer
                if (timerRef.current) clearInterval(timerRef.current);
              }}
              className={`nudge-dot ${i === activeIndex % nudges.length ? 'nudge-dot-active' : ''}`}
            />
          ))}
        </div>
      )}

      {/* Pulse glow border */}
      <div className={`nudge-pulse-border ${theme.border}`} />
    </div>
  );
}
