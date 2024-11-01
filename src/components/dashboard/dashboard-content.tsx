import { useEffect } from 'react';
import { User } from '@/lib/types';
import { RecentCatches } from './recent-catches';
import { Statistics } from './statistics';
import { WeatherCard } from './weather-card';
import { CalendarPage } from '../calendar/calendar-page';
import { GroupsPage } from '../groups/groups-page';
import { useCatchStore } from '@/lib/stores/catch-store';
import { useGroupStore } from '@/lib/stores/group-store';
import { useEventStore } from '@/lib/stores/event-store';

interface DashboardContentProps {
  user: User;
  currentView: 'overview' | 'calendar' | 'groups';
}

export function DashboardContent({ user, currentView }: DashboardContentProps) {
  const { fetchUserCatches, isLoading: catchesLoading } = useCatchStore();
  const { fetchUserGroups, isLoading: groupsLoading } = useGroupStore();
  const { fetchUserEvents, isLoading: eventsLoading } = useEventStore();

  useEffect(() => {
    fetchUserCatches(user.id);
    fetchUserGroups(user.id);
    fetchUserEvents(user.id);
  }, [user.id, fetchUserCatches, fetchUserGroups, fetchUserEvents]);

  const isLoading = catchesLoading || groupsLoading || eventsLoading;

  const renderContent = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarPage />;
      case 'groups':
        return <GroupsPage />;
      default:
        return (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Statistics isLoading={isLoading} />
              <WeatherCard isLoading={isLoading} />
            </div>
            <RecentCatches userId={user.id} isLoading={isLoading} />
          </div>
        );
    }
  };

  return (
    <main className="flex-1 min-h-[calc(100vh-3.5rem)]">
      <div className="container py-6">
        {renderContent()}
      </div>
    </main>
  );
}