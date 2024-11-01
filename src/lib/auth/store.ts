import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { login as authLogin, register as authRegister, logout as authLogout, getCurrentUser, updatePreferences as authUpdatePreferences } from './auth';
import type { User, AuthError, UserPreferences } from './types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  isOnline: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isOnline: navigator.onLine,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const user = await authLogin(email, password);
          set({ user, isLoading: false, error: null });
          toast.success('Welcome back!');
        } catch (error: any) {
          const authError = error as AuthError;
          set({ isLoading: false, user: null, error: authError });
          toast.error(authError.message);
          throw authError;
        }
      },

      register: async (email: string, password: string, name: string) => {
        try {
          set({ isLoading: true, error: null });
          const user = await authRegister(email, password, name);
          set({ user, isLoading: false, error: null });
          toast.success('Account created successfully!');
        } catch (error: any) {
          const authError = error as AuthError;
          set({ isLoading: false, user: null, error: authError });
          toast.error(authError.message);
          throw authError;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          await authLogout();
          set({ user: null, isLoading: false, error: null });
          toast.success('Logged out successfully');
        } catch (error: any) {
          const authError = error as AuthError;
          set({ isLoading: false, error: authError });
          toast.error(authError.message);
          throw authError;
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          const user = await getCurrentUser();
          set({ user, isLoading: false, error: null });
        } catch (error: any) {
          const authError = error as AuthError;
          set({ isLoading: false, error: authError });
        }
      },

      updatePreferences: async (preferences: Partial<UserPreferences>) => {
        try {
          set({ isLoading: true, error: null });
          const updatedPrefs = await authUpdatePreferences(preferences);
          const user = get().user;
          if (user) {
            set({
              user: { ...user, preferences: updatedPrefs },
              isLoading: false,
              error: null,
            });
          }
          toast.success('Preferences updated successfully');
        } catch (error: any) {
          const authError = error as AuthError;
          set({ isLoading: false, error: authError });
          toast.error(authError.message);
          throw authError;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Set up online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    const { checkAuth } = useAuth.getState();
    checkAuth();
  });

  window.addEventListener('offline', () => {
    useAuth.setState({ isOnline: false });
  });
}

// Initialize auth state
useAuth.getState().checkAuth();