import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

// Predefined Q&A with keyword matching
const QA_PAIRS: { keywords: string[]; response: string }[] = [
  { keywords: ['how', 'play', 'start', 'begin'], response: 'Go to the Map tab and select a world to start learning! Each level has 3 fun games to play. 🎮' },
  { keywords: ['totopara', 'toto', 'village', 'where'], response: 'Totopara is the homeland of the Toto community, located in the Jalpaiguri district of West Bengal, India, near the Bhutan border. 🏔️' },
  { keywords: ['star', 'stars', 'earn', 'get'], response: 'You earn 1-3 stars per level based on accuracy. Score 90%+ for 3 stars, 60%+ for 2 stars! ⭐' },
  { keywords: ['xp', 'experience', 'points', 'level up'], response: 'You earn 50 XP per level, plus 20 bonus XP for getting 3 stars. Complete stories for extra XP! 🚀' },
  { keywords: ['story', 'stories', 'unlock'], response: 'Stories unlock as you progress! Concept stories unlock after Level 2, and folk stories after Level 4 in each world. 📖' },
  { keywords: ['world', 'worlds', 'map'], response: 'There are 5 worlds: Forest (Animals), Farm (Food), Nature, Village (Objects), and Body Land. Complete 3 levels in a world to unlock the next! 🗺️' },
  { keywords: ['language', 'endangered', 'save', 'preserve'], response: 'The Toto language is critically endangered with fewer than 2,000 speakers. This app helps preserve it through interactive learning! 🌱' },
  { keywords: ['game', 'games', 'types'], response: 'Each level has 3 games:\n• Tap the Image — match audio to pictures\n• Memory Match — pair words with images\n• Speed Challenge — 30-second quiz! ⚡' },
  { keywords: ['community', 'feed', 'post'], response: 'Check the Community tab to see photos and stories from Totopara village! 📸' },
  { keywords: ['reset', 'restart', 'delete', 'progress'], response: 'You can reset your progress from Profile → Settings → Reset All Progress. Be careful — this can\'t be undone! ⚠️' },
  { keywords: ['hello', 'hi', 'hey', 'namaste', 'hola'], response: 'Hello! 👋 I\'m your Toto learning buddy. Ask me about the app, Totopara, or how to play!' },
  { keywords: ['thank', 'thanks', 'thx'], response: 'You\'re welcome! Keep learning and have fun! 🦉' },
  { keywords: ['cultural', 'culture', 'tradition'], response: 'Cultural insights unlock after completing all 5 levels in a world. They include stories, photos, and audio about Toto traditions! 🎭' },
  { keywords: ['help', 'what can'], response: 'I can help with:\n• How to play\n• Earning stars & XP\n• Unlocking stories\n• About Totopara\n• App navigation\nJust ask! 😊' },
  { keywords: ['people', 'population', 'tribe'], response: 'The Toto people are one of India\'s smallest tribal communities, with a population of around 1,600. They have a unique language and rich cultural heritage. 👥' },
  { keywords: ['food', 'eat', 'drink'], response: 'Traditional Toto cuisine includes rice, locally grown vegetables, and "Eu" — a traditional fermented drink made from millet. You can learn food words in the Farm world! 🍚' },
  { keywords: ['animal', 'forest'], response: 'The Forest world teaches you animal names in Toto! You\'ll learn words like "kuta" (dog) and "biral" (cat). Start there! 🌲' },
  { keywords: ['bye', 'goodbye', 'see you'], response: 'Goodbye! Come back soon and keep learning Toto! 👋🦉' },
];

const FALLBACK = 'I can help you with learning and Totopara information. Try asking "How do I play?" or "What is Totopara?" 😊';

function findResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  if (!lower) return FALLBACK;

  let bestMatch = { score: 0, response: FALLBACK };
  for (const qa of QA_PAIRS) {
    let score = 0;
    for (const keyword of qa.keywords) {
      if (lower.includes(keyword)) score++;
    }
    if (score > bestMatch.score) {
      bestMatch = { score, response: qa.response };
    }
  }
  return bestMatch.response;
}

const SUGGESTIONS = [
  'How to play?',
  'What is Totopara?',
  'How do I earn stars?',
  'Tell me about games',
  'What can you help with?',
];

export default function ChatbotTab() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', text: 'Hi! 🦉 I\'m your Toto learning buddy. Ask me anything about the app, Totopara, or how to play!', sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;

    const userMsg: Message = { id: `user-${Date.now()}`, text: msg, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const delay = 500 + Math.random() * 500;
    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = { id: `bot-${Date.now()}`, text: findResponse(msg), sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showSuggestions = messages.length <= 2 && !isTyping;

  return (
    <div className="flex flex-col screen-enter" style={{ height: 'calc(100vh - 0px)' }}>
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-border/50 px-4 py-3 flex-shrink-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-game-primary/10 flex items-center justify-center text-xl">
              🦉
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-game-primary border-2 border-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold leading-tight">Toto Assistant</h1>
            <p className="text-[11px] text-game-primary font-semibold">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        <div className="max-w-lg mx-auto space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-game-primary/10 flex items-center justify-center text-sm mr-2 mt-1 flex-shrink-0">
                  🦉
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                msg.sender === 'user'
                  ? 'bg-game-primary text-white rounded-br-md'
                  : 'bg-white shadow-game text-foreground rounded-bl-md'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="w-7 h-7 rounded-full bg-game-primary/10 flex items-center justify-center text-sm mr-2 mt-1 flex-shrink-0">
                🦉
              </div>
              <div className="bg-white shadow-game rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="max-w-lg mx-auto flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="flex-shrink-0 px-3.5 py-2 rounded-2xl bg-game-primary/8 border border-game-primary/20
                           text-game-primary text-xs font-semibold whitespace-nowrap
                           active:scale-95 hover:bg-game-primary/15 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-border/50 bg-white/95 backdrop-blur-sm px-4 py-3 pb-[88px] flex-shrink-0">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-muted/50 border border-border
                       text-sm focus:outline-none focus:border-game-primary/50 focus:ring-2 focus:ring-game-primary/10
                       transition-all placeholder:text-muted-foreground/50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-game-primary flex items-center justify-center flex-shrink-0
                       disabled:opacity-30 active:scale-90 transition-all duration-150"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
