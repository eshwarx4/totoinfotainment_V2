import { useState } from 'react';
import { Heart, Share2 } from 'lucide-react';
import COMMUNITY_POSTS from '@/data/communityPosts';

export default function CommunityTab() {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  return (
    <div className="min-h-screen screen-enter">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Totopara Community</h1>
            <p className="text-[11px] text-muted-foreground">Stories and culture from Totopara</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-game-primary/10 flex items-center justify-center text-lg">
            🏔️
          </div>
        </div>
      </div>

      {/* Hero banner */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="rounded-2xl bg-gradient-to-br from-green-600 to-teal-700 p-5 text-white mb-4">
          <p className="text-sm font-bold opacity-80 uppercase tracking-wide mb-1">Welcome to</p>
          <h2 className="text-xl font-black mb-1">The Toto Community</h2>
          <p className="text-xs opacity-70 leading-relaxed">
            Discover the rich culture, traditions, and daily life of the Toto people from Totopara village.
          </p>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-lg mx-auto px-4 pb-4 space-y-4">
        {COMMUNITY_POSTS.map(post => {
          const isLiked = likedPosts.has(post.id);
          return (
            <article key={post.id} className="card-game overflow-hidden animate-fade-in">
              {/* Image */}
              <div className="w-full aspect-[16/10] bg-muted overflow-hidden relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                {/* Tag badge */}
                {post.tag && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm
                                   text-white text-[10px] font-bold uppercase tracking-wider">
                    {post.tag}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-[15px] mb-1.5 leading-snug">{post.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {post.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Like button */}
                    <button
                      onClick={() => toggleLike(post.id)}
                      className="flex items-center gap-1.5 transition-all duration-200 active:scale-90"
                      aria-label={isLiked ? 'Unlike' : 'Like'}
                    >
                      <Heart
                        className={`w-[18px] h-[18px] transition-all duration-300 ${
                          isLiked
                            ? 'fill-red-500 text-red-500 scale-110'
                            : 'text-gray-400 hover:text-red-400'
                        }`}
                      />
                      <span className={`text-xs font-semibold ${
                        isLiked ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        {post.likes + (isLiked ? 1 : 0)}
                      </span>
                    </button>

                    {/* Share button (UI only) */}
                    <button className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors active:scale-90">
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs font-semibold">Share</span>
                    </button>
                  </div>

                  {/* Timestamp */}
                  <span className="text-[11px] text-muted-foreground">{post.timestamp}</span>
                </div>
              </div>
            </article>
          );
        })}

        {/* End of feed */}
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🏔️</div>
          <p className="text-sm text-muted-foreground font-medium">
            More updates coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}
