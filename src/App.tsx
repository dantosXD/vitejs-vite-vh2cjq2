import { useEffect } from 'react';
import { Fish } from 'lucide-react';
import { AuthTabs } from './components/auth/auth-tabs';
import { useAuth } from './lib/stores/auth-store';
import { Toaster } from 'sonner';
import { DashboardLayout } from './components/dashboard/dashboard-layout';

function App() {
  const { user, checkAuth, isLoading } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Fish className="h-12 w-12 text-primary" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!user ? (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
          <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
            <div className="absolute inset-0 bg-zinc-900" />
            <div className="relative z-20 flex items-center text-lg font-medium">
              <Fish className="mr-2 h-6 w-6" />
              FishLog
            </div>
            <div className="relative z-20 mt-auto">
              <blockquote className="space-y-2">
                <p className="text-lg">
                  "The best fishing log app I've ever used. It helps me track my catches and connect with other anglers."
                </p>
                <footer className="text-sm">Sofia Davis</footer>
              </blockquote>
            </div>
          </div>
          <div className="lg:p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
              <AuthTabs />
            </div>
          </div>
        </div>
      ) : (
        <DashboardLayout user={user} />
      )}
      <Toaster />
    </div>
  );
}

export default App;