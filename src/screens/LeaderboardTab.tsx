import { useGame } from '@/state/GameContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trophy, Medal, Crown, ShoppingBag, Tag, Sparkles, Check, Star, Zap, Lock } from 'lucide-react';
import { useMemo, useState, useRef } from 'react';

// ─────────────────────────────────────────────
// Shop item definitions
// ─────────────────────────────────────────────
interface ShopItem {
    id: string;
    name: string;
    description: string;
    emoji: string;
    cost: number;
    category: 'tag' | 'avatar' | 'card';
    tagText?: string;    // displayed below name in leaderboard
    tagColor?: string;   // tailwind bg class
    avatarEmoji?: string;
}

const SHOP_ITEMS: ShopItem[] = [
    // Profile Tags
    { id: 'tag_explorer', name: 'Village Explorer', description: 'Show you have explored Totopara', emoji: '🌱', cost: 100, category: 'tag', tagText: '🌱 Village Explorer', tagColor: 'bg-green-100 text-green-700' },
    { id: 'tag_champion', name: 'Word Champion', description: 'For those who master vocabulary', emoji: '🏆', cost: 200, category: 'tag', tagText: '🏆 Word Champion', tagColor: 'bg-amber-100 text-amber-700' },
    { id: 'tag_streak', name: 'Streak Master', description: 'Never miss a day of learning', emoji: '🔥', cost: 150, category: 'tag', tagText: '🔥 Streak Master', tagColor: 'bg-orange-100 text-orange-700' },
    { id: 'tag_story', name: 'Story Keeper', description: 'A lover of Toto folk stories', emoji: '📖', cost: 180, category: 'tag', tagText: '📖 Story Keeper', tagColor: 'bg-purple-100 text-purple-700' },
    { id: 'tag_speed', name: 'Speed Learner', description: 'Lightning-fast in every game', emoji: '⚡', cost: 220, category: 'tag', tagText: '⚡ Speed Learner', tagColor: 'bg-blue-100 text-blue-700' },
    { id: 'tag_traveler', name: 'World Traveler', description: 'Completed all worlds in Totopara', emoji: '🌍', cost: 350, category: 'tag', tagText: '🌍 World Traveler', tagColor: 'bg-cyan-100 text-cyan-700' },
    // Avatars
    { id: 'av_butterfly', name: 'Butterfly', description: 'A graceful butterfly avatar', emoji: '🦋', cost: 120, category: 'avatar', avatarEmoji: '🦋' },
    { id: 'av_tiger', name: 'Tiger', description: 'Fierce and fearless avatar', emoji: '🐯', cost: 180, category: 'avatar', avatarEmoji: '🐯' },
    { id: 'av_eagle', name: 'Eagle', description: 'Soar above the competition', emoji: '🦅', cost: 250, category: 'avatar', avatarEmoji: '🦅' },
    { id: 'av_peacock', name: 'Peacock', description: 'Show off in true style', emoji: '🦚', cost: 300, category: 'avatar', avatarEmoji: '🦚' },
    // Personalized Card
    { id: 'card_personal', name: 'My Journey Card', description: 'A personal stats card generated just for you — share it to flex your progress!', emoji: '🎴', cost: 80, category: 'card' },
];

const TAGS = SHOP_ITEMS.filter(i => i.category === 'tag');
const AVATARS = SHOP_ITEMS.filter(i => i.category === 'avatar');
const CARD_ITEM = SHOP_ITEMS.find(i => i.category === 'card')!;

// ─────────────────────────────────────────────
// Personalized Stat Card
// ─────────────────────────────────────────────
function PersonalizedCard({ name, avatar, tag, streak, coins, diamonds, wordsLearned, rank, tagColor }: {
    name: string; avatar: string; tag: ShopItem | null; streak: number;
    coins: number; diamonds: number; wordsLearned: number; rank: number; tagColor: string;
}) {
    return (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', minHeight: 260 }}>
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-15"
                style={{ background: 'radial-gradient(circle, #6366f1, transparent)', transform: 'translate(-30%, 30%)' }} />

            {/* Watermark */}
            <div className="absolute bottom-3 right-4 text-white/10 text-xs font-bold uppercase tracking-widest">Toto Infotainment</div>

            <div className="relative p-5">
                {/* Top row */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl border border-white/20">
                        {avatar}
                    </div>
                    <div>
                        <p className="text-white font-extrabold text-lg leading-tight">{name}</p>
                        {tag ? (
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${tagColor}`}>{tag.tagText}</span>
                        ) : (
                            <span className="text-white/40 text-xs">No tag</span>
                        )}
                        {rank > 0 && <p className="text-white/50 text-[11px] mt-0.5">#{rank} on leaderboard</p>}
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                        { icon: '🪙', label: 'Coins', value: coins.toLocaleString() },
                        { icon: '💎', label: 'Diamonds', value: diamonds.toLocaleString() },
                        { icon: '📚', label: 'Words', value: wordsLearned },
                        { icon: '🔥', label: 'Streak', value: `${streak} days` },
                    ].map(s => (
                        <div key={s.label} className="bg-white/8 rounded-xl px-3 py-2 flex items-center gap-2">
                            <span className="text-base">{s.icon}</span>
                            <div>
                                <p className="text-white font-black text-sm leading-none">{s.value}</p>
                                <p className="text-white/40 text-[10px]">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toto badge */}
                <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/30 text-[10px] uppercase tracking-widest">Totopara</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
interface UserRankData {
    userId: string; name: string; avatar: string;
    coins: number; diamonds: number; equippedTag?: string | null;
}

export default function LeaderboardTab() {
    const game = useGame();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'leaderboard' | 'shop'>('leaderboard');
    const [shopCategory, setShopCategory] = useState<'tag' | 'avatar' | 'card'>('tag');
    const [toast, setToast] = useState<string | null>(null);
    const [showCard, setShowCard] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const owned = game.purchasedItems || [];
    const equippedTagId = game.equippedTag || null;
    const equippedTagItem = TAGS.find(t => t.id === equippedTagId) || null;

    const total = game.getTotalProgress();

    // Rankings
    const rankings = useMemo((): UserRankData[] => {
        return game.listUsers()
            .map(u => ({ userId: u.userId, name: u.playerName, avatar: u.playerAvatar || '🦉', coins: u.totalCoins || 0, diamonds: u.totalDiamonds || 0 }))
            .sort((a, b) => b.coins - a.coins);
    }, [game]);

    const myRank = rankings.findIndex(u => u.userId === game.userId) + 1;

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const handlePurchase = (item: ShopItem) => {
        if (owned.includes(item.id)) {
            // Already owned — equip if it's a tag/avatar
            if (item.category === 'tag') { game.equipTag(item.id); showToast(`✅ Equipped "${item.name}"!`); }
            if (item.category === 'avatar') { game.equipAvatar(item.avatarEmoji!); showToast(`✅ Avatar changed to ${item.avatarEmoji}!`); }
            if (item.category === 'card') setShowCard(true);
            return;
        }
        const ok = game.purchaseShopItem(item.id, item.cost);
        if (!ok) { showToast('❌ Not enough coins!'); return; }
        showToast(`🎉 Unlocked "${item.name}"!`);
        if (item.category === 'tag') { game.equipTag(item.id); }
        if (item.category === 'avatar') { game.equipAvatar(item.avatarEmoji!); }
        if (item.category === 'card') setShowCard(true);
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-400">{rank}</span>;
    };

    return (
        <div className="min-h-screen screen-enter pb-24 bg-gray-50">

            {/* Toast */}
            {toast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-bold
                        px-4 py-2.5 rounded-2xl shadow-2xl animate-fade-in">
                    {toast}
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white px-4 pt-5 pb-14">
                <div className="max-w-lg mx-auto text-center">
                    <Trophy className="w-10 h-10 mx-auto mb-1.5 text-white" />
                    <h1 className="text-2xl font-black">Rank & Rewards</h1>
                    <p className="text-sm opacity-75 mt-0.5">Earn coins. Unlock rewards. Show off! 💪</p>
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-bold">🪙 {total.totalCoins}</div>
                        <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-bold">💎 {total.totalDiamonds}</div>
                        {myRank > 0 && <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-bold">🏆 #{myRank}</div>}
                    </div>
                </div>
            </div>

            {/* Tab switcher */}
            <div className="max-w-lg mx-auto px-4 -mt-7">
                <div className="bg-white rounded-2xl shadow-lg p-1 flex gap-1">
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'leaderboard' ? 'bg-amber-500 text-white shadow' : 'text-gray-500'}`}
                    >
                        <Trophy className="w-4 h-4" /> Leaderboard
                    </button>
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'shop' ? 'bg-amber-500 text-white shadow' : 'text-gray-500'}`}
                    >
                        <ShoppingBag className="w-4 h-4" /> Shop
                    </button>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 mt-4">

                {/* ─── LEADERBOARD TAB ─── */}
                {activeTab === 'leaderboard' && (
                    <div className="space-y-2">
                        {rankings.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                                <span className="text-5xl mb-3 block">🏆</span>
                                <p className="font-bold text-gray-700">No rankings yet</p>
                                <p className="text-sm text-gray-400 mt-1">Create an account to appear here!</p>
                            </div>
                        ) : (
                            rankings.map((user, i) => {
                                const rank = i + 1;
                                const isMe = user.userId === game.userId;
                                const rankBg = rank === 1 ? 'bg-amber-50 border-amber-200' : rank === 2 ? 'bg-gray-50 border-gray-200' : rank === 3 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100';
                                return (
                                    <div key={user.userId}
                                        className={`rounded-2xl p-3.5 flex items-center gap-3 border ${rankBg} ${isMe ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`}>
                                        <div className="w-7 flex items-center justify-center shrink-0">{getRankIcon(rank)}</div>
                                        <span className="text-2xl shrink-0">{user.avatar}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <p className="font-bold text-sm text-gray-800">{user.name}</p>
                                                {isMe && <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">YOU</span>}
                                            </div>
                                            {/* Show equipped tag (for current user we know it; for others we don't have it in listUsers) */}
                                            {isMe && equippedTagItem && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block ${equippedTagItem.tagColor}`}>
                                                    {equippedTagItem.tagText}
                                                </span>
                                            )}
                                            <p className="text-[11px] text-gray-400 mt-0.5">🪙 {user.coins} · 💎 {user.diamonds}</p>
                                        </div>
                                        <p className="text-lg font-black text-amber-500 shrink-0">{user.coins}</p>
                                    </div>
                                );
                            })
                        )}

                        {/* My card preview if owned */}
                        {owned.includes('card_personal') && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">My Journey Card</p>
                                    <button onClick={() => setShowCard(true)} className="text-xs text-amber-500 font-bold">View →</button>
                                </div>
                                <div ref={cardRef}>
                                    <PersonalizedCard
                                        name={game.playerName}
                                        avatar={game.playerAvatar || '🦉'}
                                        tag={equippedTagItem}
                                        tagColor={equippedTagItem?.tagColor || ''}
                                        streak={total.streak}
                                        coins={total.totalCoins}
                                        diamonds={total.totalDiamonds}
                                        wordsLearned={total.wordsLearned}
                                        rank={myRank}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── SHOP TAB ─── */}
                {activeTab === 'shop' && (
                    <div>
                        {/* Category pills */}
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                            {([
                                { key: 'tag', label: 'Profile Tags', icon: <Tag className="w-3.5 h-3.5" /> },
                                { key: 'avatar', label: 'Avatars', icon: <Sparkles className="w-3.5 h-3.5" /> },
                                { key: 'card', label: 'Stat Card', icon: <Star className="w-3.5 h-3.5" /> },
                            ] as const).map(c => (
                                <button
                                    key={c.key}
                                    onClick={() => setShopCategory(c.key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${shopCategory === c.key ? 'bg-amber-500 text-white shadow' : 'bg-white text-gray-500 border border-gray-200'}`}
                                >
                                    {c.icon} {c.label}
                                </button>
                            ))}
                        </div>

                        {/* TAGS */}
                        {shopCategory === 'tag' && (
                            <div className="space-y-3">
                                <p className="text-xs text-gray-400 font-medium">Unlock a title that appears below your name in the leaderboard. Others can see it! 👀</p>
                                {/* Current equipped */}
                                {equippedTagItem && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2">
                                        <Check className="w-4 h-4 text-amber-500 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-amber-700">Currently Equipped</p>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${equippedTagItem.tagColor}`}>{equippedTagItem.tagText}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 gap-3">
                                    {TAGS.map(item => {
                                        const isOwned = owned.includes(item.id);
                                        const isEquipped = equippedTagId === item.id;
                                        return (
                                            <div key={item.id} className={`bg-white rounded-2xl p-4 border flex items-center gap-3 ${isEquipped ? 'border-amber-400 ring-1 ring-amber-400' : 'border-gray-100'}`}>
                                                <div className="text-3xl shrink-0">{item.emoji}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm text-gray-800">{item.name}</p>
                                                    <p className="text-xs text-gray-400">{item.description}</p>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${item.tagColor}`}>{item.tagText}</span>
                                                </div>
                                                <button
                                                    onClick={() => handlePurchase(item)}
                                                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${isEquipped ? 'bg-amber-100 text-amber-600' :
                                                            isOwned ? 'bg-green-100 text-green-700' :
                                                                total.totalCoins >= item.cost ? 'bg-amber-500 text-white shadow' : 'bg-gray-100 text-gray-400'
                                                        }`}
                                                >
                                                    {isEquipped ? 'On' : isOwned ? '✓ Equip' : `🪙 ${item.cost}`}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* AVATARS */}
                        {shopCategory === 'avatar' && (
                            <div className="space-y-3">
                                <p className="text-xs text-gray-400 font-medium">Upgrade your profile look with a new avatar. It shows in the leaderboard and on your card.</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Default owl - always available */}
                                    <div className="bg-white rounded-2xl p-4 border border-green-200 text-center">
                                        <div className="text-4xl mb-2">🦉</div>
                                        <p className="font-bold text-xs text-gray-700">Wise Owl</p>
                                        <p className="text-[10px] text-gray-400">Default</p>
                                        <button onClick={() => game.equipAvatar('🦉')} className="mt-2 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Use</button>
                                    </div>
                                    {AVATARS.map(item => {
                                        const isOwned = owned.includes(item.id);
                                        const isActive = game.playerAvatar === item.avatarEmoji;
                                        return (
                                            <div key={item.id} className={`bg-white rounded-2xl p-4 border text-center ${isActive ? 'border-amber-400 ring-1 ring-amber-400' : 'border-gray-100'}`}>
                                                <div className="text-4xl mb-2 relative inline-block">
                                                    {item.avatarEmoji}
                                                    {!isOwned && <Lock className="absolute -bottom-1 -right-1 w-3.5 h-3.5 text-gray-400 bg-white rounded-full" />}
                                                </div>
                                                <p className="font-bold text-xs text-gray-700">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 truncate">{item.description}</p>
                                                <button
                                                    onClick={() => handlePurchase(item)}
                                                    className={`mt-2 text-[10px] px-3 py-1 rounded-full font-bold transition-all active:scale-95 ${isActive ? 'bg-amber-100 text-amber-600' :
                                                            isOwned ? 'bg-green-100 text-green-700' :
                                                                total.totalCoins >= item.cost ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
                                                        }`}
                                                >
                                                    {isActive ? '✓ Active' : isOwned ? 'Use' : `🪙 ${item.cost}`}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* PERSONALIZED CARD */}
                        {shopCategory === 'card' && (
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl p-5 text-white">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center text-2xl">🎴</div>
                                        <div>
                                            <p className="font-extrabold text-base">My Journey Card</p>
                                            <p className="text-xs text-white/60">A personalized card, built just for you</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-white/70 mb-4">
                                        This card is generated from your real data — your name, avatar, streak, words learned, coins, and your equipped tag.
                                        Show off your Toto journey to your community! ✨
                                    </p>
                                    {/* Live preview */}
                                    <PersonalizedCard
                                        name={game.playerName || 'Explorer'}
                                        avatar={game.playerAvatar || '🦉'}
                                        tag={equippedTagItem}
                                        tagColor={equippedTagItem?.tagColor || ''}
                                        streak={total.streak}
                                        coins={total.totalCoins}
                                        diamonds={total.totalDiamonds}
                                        wordsLearned={total.wordsLearned}
                                        rank={myRank}
                                    />
                                    <div className="flex items-center gap-2 mt-4">
                                        <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                                            <span className="text-xs font-bold">Updates live with your progress</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Purchase / share button */}
                                {!owned.includes(CARD_ITEM.id) ? (
                                    <button
                                        onClick={() => handlePurchase(CARD_ITEM)}
                                        className={`w-full py-4 rounded-2xl font-extrabold text-base transition-all active:scale-95 ${total.totalCoins >= CARD_ITEM.cost
                                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                                : 'bg-gray-200 text-gray-400'
                                            }`}
                                    >
                                        {total.totalCoins >= CARD_ITEM.cost ? `🪙 Unlock for ${CARD_ITEM.cost} coins` : `Need ${CARD_ITEM.cost - total.totalCoins} more coins`}
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 justify-center bg-green-50 border border-green-200 rounded-2xl py-3">
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-bold text-green-700">Card Unlocked! Goes live on your leaderboard.</span>
                                        </div>
                                        <p className="text-center text-xs text-gray-400">Your card updates automatically as you progress.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Earn more coins CTA */}
                        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                            <div className="text-2xl shrink-0">🪙</div>
                            <div>
                                <p className="text-sm font-bold text-gray-700">You have {total.totalCoins} coins</p>
                                <p className="text-xs text-gray-400">Complete levels, learn words & finish stories to earn more!</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Full-screen card modal */}
            {showCard && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
                    onClick={() => setShowCard(false)}>
                    <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <PersonalizedCard
                            name={game.playerName || 'Explorer'}
                            avatar={game.playerAvatar || '🦉'}
                            tag={equippedTagItem}
                            tagColor={equippedTagItem?.tagColor || ''}
                            streak={total.streak}
                            coins={total.totalCoins}
                            diamonds={total.totalDiamonds}
                            wordsLearned={total.wordsLearned}
                            rank={myRank}
                        />
                        <button onClick={() => setShowCard(false)}
                            className="mt-4 w-full bg-white/20 text-white font-bold py-3 rounded-2xl backdrop-blur-sm">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
