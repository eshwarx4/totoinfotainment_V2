import { useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { ALL_WORDS, WORD_CATEGORIES, getWordOfTheDay, getCategoryCounts } from '@/data/wordData';
import { Volume2, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { useRef, useState, useMemo } from 'react';
import { getEmojiImageUrl } from '@/lib/emojiImages';

export default function LearnTab() {
  const navigate = useNavigate();
  const game = useGame();
  const total = game.getTotalProgress();
  const wordOfTheDay = getWordOfTheDay();
  const categoryCounts = getCategoryCounts();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const learnedCount = game.learnedWords.length;
  const totalWords = ALL_WORDS.length;
  const learnProgress = Math.round((learnedCount / totalWords) * 100);

  // Personalized nudge
  const nudge = useMemo(() => {
    if (learnedCount === 0) return { text: "Start your Toto journey! Learn your first word 🌟", action: "Learn First Word", emoji: "🚀" };
    if (learnedCount < 5) return { text: `Great start! ${5 - learnedCount} more words to unlock a game 🎮`, action: "Keep Learning", emoji: "💪" };
    if (learnedCount < 15) return { text: `You know ${learnedCount} words! Try a quiz to earn coins 🪙`, action: "Take Quiz", emoji: "🧠" };
    if (learnedCount < 30) return { text: `Amazing! ${learnedCount}/${totalWords} words! You're becoming fluent 🌟`, action: "Learn More", emoji: "⭐" };
    return { text: `Master learner! ${learnedCount}/${totalWords} words! Almost there 🎉`, action: "Complete All", emoji: "🏆" };
  }, [learnedCount, totalWords]);

  const playAudio = (url: string, type: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingAudio(type);
    audio.play().catch(() => { });
    audio.onended = () => setPlayingAudio(null);
  };

  return (
    <div className="min-h-screen screen-enter pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-game-primary to-emerald-600 text-white px-4 pt-5 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold">Learn</h1>
              <p className="text-sm opacity-80">Your Toto word library</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full px-3 py-1.5">
                <span className="text-sm font-bold">🪙 {total.totalCoins}</span>
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1.5">
                <span className="text-sm font-bold">💎 {total.totalDiamonds}</span>
              </div>
            </div>
          </div>

          {/* Learning progress bar */}
          <div className="bg-white/15 backdrop-blur rounded-xl p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold">Words Learned</span>
              <span className="opacity-80">{learnedCount}/{totalWords}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${learnProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Personalized Nudge */}
        <div className="card-game p-4 border-l-4 border-game-primary animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{nudge.emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{nudge.text}</p>
              <button
                onClick={() => navigate(learnedCount < 5 ? '/learn/category/Animals' : '/games')}
                className="text-xs font-bold text-game-primary mt-1 hover:underline"
              >
                {nudge.action} →
              </button>
            </div>
          </div>
        </div>

        {/* Word of the Day */}
        <div className="card-game overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Word of the Day</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={wordOfTheDay.imageUrl}
                alt={wordOfTheDay.english}
                className="w-20 h-20 rounded-xl object-cover bg-gray-50"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getEmojiImageUrl(wordOfTheDay.english, wordOfTheDay.category);
                }}
              />
              <div className="flex-1">
                <h3 className="text-2xl font-black text-foreground">{wordOfTheDay.english}</h3>
                <p className="text-xs text-muted-foreground mb-2">{wordOfTheDay.category}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => playAudio(wordOfTheDay.audioEnglishUrl, 'eng')}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all
                      ${playingAudio === 'eng'
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    English
                  </button>
                  <button
                    onClick={() => playAudio(wordOfTheDay.audioTotoUrl, 'toto')}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all
                      ${playingAudio === 'toto'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Toto
                  </button>
                </div>
              </div>
            </div>
            {!game.learnedWords.includes(wordOfTheDay.id) && (
              <button
                onClick={() => {
                  game.markWordLearned(wordOfTheDay.id);
                }}
                className="w-full mt-3 py-2.5 rounded-xl bg-game-primary text-white text-sm font-bold
                         active:scale-[0.98] transition-transform"
              >
                Mark as Learned (+5 🪙)
              </button>
            )}
            {game.learnedWords.includes(wordOfTheDay.id) && (
              <div className="w-full mt-3 py-2.5 rounded-xl bg-green-50 text-green-600 text-sm font-bold text-center">
                ✅ Already Learned!
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Browse by Category</h2>
            <span className="text-xs text-muted-foreground">{totalWords} words</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {WORD_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const learnedInCat = ALL_WORDS.filter(
                w => w.category === cat.id && game.learnedWords.includes(w.id)
              ).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/learn/category/${encodeURIComponent(cat.id)}`)}
                  className="card-game p-3 text-center active:scale-[0.96] transition-transform"
                >
                  <div className="text-2xl mb-1">{cat.emoji}</div>
                  <p className="text-xs font-bold truncate">{cat.label}</p>
                  <p className="text-[10px] text-muted-foreground">{learnedInCat}/{count}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Concepts Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Concepts</h2>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {[
              { id: '770e8400-e29b-41d4-a716-446655440001', title: 'Evaporation', emoji: '💧', slides: 3 },
              { id: '770e8400-e29b-41d4-a716-446655440002', title: 'Plant Growth', emoji: '🌱', slides: 3 },
              { id: '770e8400-e29b-41d4-a716-446655440003', title: 'Food Sources', emoji: '🌾', slides: 3 },
              { id: '770e8400-e29b-41d4-a716-446655440004', title: 'Seasons & Monsoon', emoji: '🌦️', slides: 3 },
              { id: '770e8400-e29b-41d4-a716-446655440005', title: 'Water Cycle', emoji: '🔄', slides: 3 },
              { id: '770e8400-e29b-41d4-a716-446655440006', title: 'Photosynthesis', emoji: '☀️', slides: 3 },
              { id: '770e8400-e29b-41d4-a716-446655440007', title: 'Seasons', emoji: '🍂', slides: 3 },
            ].map(concept => {
              const isCompleted = (game.completedConcepts || []).includes(concept.id);
              return (
                <button
                  key={concept.id}
                  onClick={() => navigate(`/learn/concept/${concept.id}`)}
                  className="w-full card-game p-3 flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
                >
                  <span className="text-2xl">{concept.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{concept.title}</p>
                    <p className="text-[10px] text-muted-foreground">{concept.slides} slides</p>
                  </div>
                  {isCompleted ? (
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">Done ✅</span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stories Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Folk Stories</h2>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {[
              { id: '550e8400-e29b-41d4-a716-446655440001', title: 'The Brave Toto Boy', emoji: '🐯', desc: 'A story of courage and unity' },
              { id: '550e8400-e29b-41d4-a716-446655440002', title: 'The River and the Drum', emoji: '🥁', desc: 'Nature listens to our actions' },
            ].map(story => {
              const isCompleted = game.completedStories.includes(story.id);
              return (
                <button
                  key={story.id}
                  onClick={() => navigate(`/learn/story/${story.id}`)}
                  className="w-full card-game p-4 flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
                >
                  <span className="text-3xl">{story.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{story.title}</p>
                    <p className="text-[10px] text-muted-foreground">{story.desc}</p>
                  </div>
                  {isCompleted ? (
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">Read ✅</span>
                  ) : (
                    <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold">New</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily tip */}
        <div className="card-game p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🦉</span>
            <div>
              <p className="text-sm font-bold text-purple-700">Toto Tip</p>
              <p className="text-xs text-purple-600 mt-0.5">
                Learn 5 new words to unlock games! Words you learn here will appear in quizzes and earn you coins.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
