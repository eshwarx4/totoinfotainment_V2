import { ReactNode } from 'react';
import BottomNavbar from '@/components/navbar/BottomNavbar';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <div className="flex-1 overflow-y-auto pb-24">
          {children}
        </div>
        <BottomNavbar />
      </div>
    </div>
  );
}
