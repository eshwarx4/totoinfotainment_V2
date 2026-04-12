import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, BookOpen, Trophy, MessageCircle, User, Gamepad2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NavTab {
  id: string;
  labelKey: string;
  icon: typeof MapPin;
  path: string;
}

const TABS: NavTab[] = [
  { id: 'learn', labelKey: 'nav.learn', icon: BookOpen, path: '/learn' },
  { id: 'games', labelKey: 'nav.journey', icon: MapPin, path: '/map' },
  { id: 'play', labelKey: 'nav.play', icon: Gamepad2, path: '/play' },
  { id: 'leaderboard', labelKey: 'nav.ranking', icon: Trophy, path: '/leaderboard' },
  { id: 'chatbot', labelKey: 'nav.chatbot', icon: MessageCircle, path: '/chatbot' },
  { id: 'profile', labelKey: 'nav.profile', icon: User, path: '/profile-tab' },
];

export default function BottomNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

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
          const label = t(tab.labelKey);

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`navbar-tab ${isActive ? 'navbar-tab-active' : 'navbar-tab-inactive'}`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`navbar-icon-wrap ${isActive ? 'navbar-icon-active' : ''}`}>
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-400'
                    }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={`navbar-label ${isActive ? 'text-game-primary font-semibold' : 'text-gray-400 font-medium'
                }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
