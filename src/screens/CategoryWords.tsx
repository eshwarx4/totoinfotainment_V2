import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/state/GameContext';
import { ALL_WORDS, WORD_CATEGORIES, WordItem } from '@/data/wordData';
import { ArrowLeft, Volume2, Check } from 'lucide-react';
import { useRef, useState } from 'react';
import { getEmojiImageUrl } from '@/lib/emojiImages';

export default function CategoryWords() {
    const { category } = useParams<{ category: string }>();
    const navigate = useNavigate();
    const game = useGame();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);

    const decodedCategory = decodeURIComponent(category || '');
    const catInfo = WORD_CATEGORIES.find(c => c.id === decodedCategory);
    const words = ALL_WORDS.filter(w => w.category === decodedCategory);
    const learnedInCat = words.filter(w => game.learnedWords.includes(w.id)).length;

    const playAudio = (url: string, id: string) => {
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(url);
        audioRef.current = audio;
        setPlayingAudio(id);
        audio.play().catch(() => { });
        audio.onended = () => setPlayingAudio(null);
    };

    return (
        <div className="min-h-screen screen-enter pb-24">
            {/* Header */}
            <div className={`bg-gradient-to-br ${catInfo?.color || 'from-gray-400 to-gray-500'} text-white px-4 pt-4 pb-6`}>
                <div className="max-w-lg mx-auto">
                    <button
                        onClick={() => navigate('/learn')}
                        className="flex items-center gap-1 text-white/80 hover:text-white mb-3 text-sm font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Learn
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{catInfo?.emoji || '📚'}</span>
                        <div>
                            <h1 className="text-2xl font-bold">{catInfo?.label || decodedCategory}</h1>
                            <p className="text-sm opacity-80">{learnedInCat}/{words.length} words learned</p>
                        </div>
                    </div>
                    {/* Mini progress */}
                    <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                        <div
                            className="bg-white rounded-full h-2 transition-all"
                            style={{ width: `${words.length ? (learnedInCat / words.length) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 mt-4 space-y-3">
                {words.map((word) => {
                    const isLearned = game.learnedWords.includes(word.id);
                    return (
                        <div key={word.id} className="card-game p-3 flex items-center gap-3">
                            {/* Image */}
                            <img
                                src={word.imageUrl}
                                alt={word.english}
                                className="w-16 h-16 rounded-xl object-cover bg-gray-50 flex-shrink-0"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = getEmojiImageUrl(word.english, word.category);
                                }}
                            />
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base">{word.english}</h3>
                                {/* Audio buttons */}
                                <div className="flex gap-1.5 mt-1">
                                    <button
                                        onClick={() => playAudio(word.audioEnglishUrl, `${word.id}-eng`)}
                                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-all
                      ${playingAudio === `${word.id}-eng`
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-blue-50 text-blue-600'}`}
                                    >
                                        <Volume2 className="w-3 h-3" />
                                        ENG
                                    </button>
                                    <button
                                        onClick={() => playAudio(word.audioTotoUrl, `${word.id}-toto`)}
                                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-all
                      ${playingAudio === `${word.id}-toto`
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-emerald-50 text-emerald-600'}`}
                                    >
                                        <Volume2 className="w-3 h-3" />
                                        TOTO
                                    </button>
                                </div>
                            </div>
                            {/* Learn/Learned */}
                            {isLearned ? (
                                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                                    <Check className="w-5 h-5 text-green-500" />
                                </div>
                            ) : (
                                <button
                                    onClick={() => game.markWordLearned(word.id)}
                                    className="flex-shrink-0 px-3 py-1.5 rounded-full bg-game-primary text-white text-xs font-bold
                           active:scale-95 transition-transform"
                                >
                                    Learn +5🪙
                                </button>
                            )}
                        </div>
                    );
                })}

                {words.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">No words in this category yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
