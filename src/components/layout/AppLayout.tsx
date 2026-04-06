import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CoinDisplay } from './CoinDisplay';
import { Map, Settings } from 'lucide-react';
import mascotImage from '@/assets/toto-mascot.png';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isLanding = location.pathname === '/';
  if (isLanding) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={mascotImage} alt="Toto" className="w-9 h-9" />
              <h1 className="text-lg font-bold text-primary hidden sm:block">
                Toto Infotainment
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <CoinDisplay />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/map')}
                title="Village Map"
              >
                <Map className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
