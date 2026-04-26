import { ReactNode } from 'react';
import BottomNavbar from '@/components/navbar/BottomNavbar';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
            paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))',
          }}
        >
          {children}
        </div>
        <BottomNavbar />
      </div>
    </div>
  );
}
