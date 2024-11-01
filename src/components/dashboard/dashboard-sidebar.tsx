import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, Home, Users } from 'lucide-react';

const items = [
  {
    title: 'Overview',
    icon: Home,
    view: 'overview' as const,
  },
  {
    title: 'Calendar',
    icon: Calendar,
    view: 'calendar' as const,
  },
  {
    title: 'Groups',
    icon: Users,
    view: 'groups' as const,
  },
];

interface DashboardSidebarProps {
  className?: string;
  onViewChange?: (view: 'overview' | 'calendar' | 'groups') => void;
  currentView: 'overview' | 'calendar' | 'groups';
}

export function DashboardSidebar({ className, onViewChange, currentView }: DashboardSidebarProps) {
  return (
    <aside className={cn("w-[240px] border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {items.map((item) => (
              <Button
                key={item.title}
                variant={currentView === item.view ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start",
                  currentView === item.view && "bg-muted"
                )}
                onClick={() => onViewChange?.(item.view)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}