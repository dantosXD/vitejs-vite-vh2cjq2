import { Fish, LogOut, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/stores/auth-store';
import { usePreferences } from '@/lib/hooks/use-preferences';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DashboardSidebar } from './dashboard-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';

interface DashboardHeaderProps {
  user: User;
  currentView: 'overview' | 'calendar' | 'groups';
  onViewChange: (view: 'overview' | 'calendar' | 'groups') => void;
}

export function DashboardHeader({ user, currentView, onViewChange }: DashboardHeaderProps) {
  const { logout } = useAuth();
  const { privacy } = usePreferences();

  const viewTitles = {
    overview: 'Dashboard',
    calendar: 'Calendar',
    groups: 'Groups'
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Error is handled by the auth store
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-4 lg:gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0">
              <SheetHeader className="p-4">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <DashboardSidebar 
                className="border-0" 
                onViewChange={onViewChange} 
                currentView={currentView}
              />
            </SheetContent>
          </Sheet>
          <div className="hidden lg:flex items-center gap-2 font-semibold">
            <Fish className="h-5 w-5" />
            <span>FishLog</span>
          </div>
          <h1 className={cn(
            "font-semibold text-lg transition-opacity",
            currentView === 'overview' ? 'opacity-100' : 'opacity-0 lg:opacity-100'
          )}>
            {viewTitles[currentView]}
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col px-2 py-1.5">
                <span className="text-sm font-medium">{user.name}</span>
                {privacy.showEmail && (
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}