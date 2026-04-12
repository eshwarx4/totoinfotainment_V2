import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, BookOpen, Trophy, MessageCircle, User, Gamepad2 } from 'lucide-react';

interface NavTab {
  id: string;
  label: string;
  icon: typeof MapPin;
  path: string;
}

const TABS: NavTab[] = [
  { id: 'learn', label: 'Learn', icon: BookOpen, path: '/learn' },
  { id: 'games', label: 'Journey', icon: MapPin, path: '/map' },
  { id: 'play', label: 'Play', icon: Gamepad2, path: '/play' },
  { id: 'leaderboard', label: 'Ranking', icon: Trophy, path: '/leaderboard' },
  { id: 'chatbot', label: 'Chatbot', icon: MessageCircle, path: '/chatbot' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile-tab' },
];

export default function BottomNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = (): string => {
    const path = location.pathname;
    if (path === '/learn' || path.startsWith('/learn/')) return 'learn';
    if (path.startsWith('/world') || path === '/map' || path.startsWith('/level') || path.startsWith('/story') || path.startsWith('/cultural')) return 'games';
    if (path === '/play') return 'play';
    if (path === '/leaderboard') return 'leaderboard';
    if (path === '/chatbot') return 'chatbot';
    if (path === '/profile-tab' || path === '/settings' || path === '/progress') return 'profile';
    return 'learn';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="navbar-bottom">
      <div className="navbar-inner">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`navbar-tab ${isActive ? 'navbar-tab-active' : 'navbar-tab-inactive'}`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`navbar-icon-wrap ${isActive ? 'navbar-icon-active' : ''}`}>
                <Icon
                  className={`w-[18px] h-[18px] transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-400'
                    }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={`navbar-label ${isActive ? 'text-game-primary font-bold' : 'text-gray-400 font-medium'
                }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
