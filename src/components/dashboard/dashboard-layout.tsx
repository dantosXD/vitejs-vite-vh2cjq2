import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { DashboardHeader } from './dashboard-header';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardContent } from './dashboard-content';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePreferences } from '@/lib/hooks/use-preferences';

interface DashboardLayoutProps {
  user: User;
}

export function DashboardLayout({ user }: DashboardLayoutProps) {
  const { displaySettings } = usePreferences();
  const [currentView, setCurrentView] = useState<'overview' | 'calendar' | 'groups'>(
    displaySettings.defaultCatchView
  );

  useEffect(() => {
    if (displaySettings.defaultCatchView) {
      setCurrentView(displaySettings.defaultCatchView);
    }
  }, [displaySettings.defaultCatchView]);

  return (
    <div className="relative min-h-screen bg-background">
      <DashboardHeader user={user} currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex h-[calc(100vh-3.5rem)]">
        <DashboardSidebar className="hidden lg:block" onViewChange={setCurrentView} currentView={currentView} />
        <ScrollArea className="flex-1">
          <DashboardContent user={user} currentView={currentView} />
        </ScrollArea>
      </div>
    </div>
  );
}