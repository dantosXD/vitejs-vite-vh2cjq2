import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ID, Models } from 'appwrite';
import { toast } from 'sonner';
import { account } from '@/lib/appwrite/services';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    groupInvites: boolean;
    challengeUpdates: boolean;
    newComments: boolean;
  };
  privacy: {
    showEmail: boolean;
    showLocation: boolean;
    publicProfile: boolean;
  };
  displaySettings: {
    defaultCatchView: 'grid';
    measurementSystem: 'imperial';
    dateFormat: 'MM/dd/yyyy';
  };
}

export interface AuthError {
  name: string;
  message: string;
  code: number;
}

// Update User type to properly extend Models.User
export interface User extends Omit<Models.User<Models.Preferences>, 'prefs'> {
  preferences: UserPreferences;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    groupInvites: true,
    challengeUpdates: true,
    newComments: true,
  },
  privacy: {
    showEmail: false,
    showLocation: true,
    publicProfile: true,
  },
  displaySettings: {
    defaultCatchView: 'grid',
    measurementSystem: 'imperial',
    dateFormat: 'MM/dd/yyyy',
  },
};

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

const handleNetworkError = (error: any): AuthError => {
  // Check if offline
  if (!navigator.onLine) {
    return {
      name: 'NetworkError',
      message: 'You appear to be offline. Please check your internet connection.',
      code: 0,
    };
  }

  // Handle TypeError with NetworkError message
  if (error?.name === 'TypeError' && error?.message?.includes('NetworkError')) {
    return {
      name: 'NetworkError',
      message: 'Unable to connect to the server. Please check if the Appwrite endpoint is correct and accessible.',
      code: 0,
    };
  }

  // Handle generic network errors
  if (
    error?.type === 'NetworkError' || 
    error?.message?.includes('NetworkError') ||
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('Network request failed')
  ) {
    return {
      name: 'NetworkError',
      message: 'Connection to the server failed. Please try again later.',
      code: 0,
    };
  }

  // Handle server errors (500 range)
  if (error?.code >= 500 && error?.code < 600) {
    return {
      name: error.name || 'ServerError',
      message: 'The server encountered an error. Please try again later.',
      code: error.code,
    };
  }

  // Handle authentication errors (400 range)
  if (error?.code >= 400 && error?.code < 500) {
    let message = error.message;
    if (error?.code === 401) {
      message = 'Invalid email or password';
    } else if (error?.code === 429) {
      message = 'Too many attempts. Please try again later.';
    }
    return {
      name: error.name || 'AuthError',
      message,
      code: error.code,
    };
  }

  // Default error
  return {
    name: error?.name || 'Error',
    message: error?.message || 'An unexpected error occurred. Please try again.',
    code: error?.code || 500,
  };
};

// Helper function to convert Appwrite user to our User type
const convertAppwriteUser = (appwriteUser: Models.User<Models.Preferences>, preferences: UserPreferences): User => {
  const { prefs: _, ...restUser } = appwriteUser;
  return {
    ...restUser,
    preferences,
  };
};

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

          // Validate connection and inputs
          if (!navigator.onLine) {
            throw new Error('You appear to be offline. Please check your internet connection.');
          }

          if (!email?.trim() || !password?.trim()) {
            throw new Error('Email and password are required');
          }

          // Attempt to create session with retry logic
          let retryCount = 0;
          const maxRetries = 2;
          
          while (retryCount <= maxRetries) {
            try {
              await account.createEmailPasswordSession(email, password);
              break; // Success, exit retry loop
            } catch (error: any) {
              if (error?.code === 401) {
                // Don't retry auth failures
                throw error;
              }
              if (retryCount === maxRetries) {
                throw error;
              }
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
            }
          }

          // Get user data with retry logic
          let appwriteUser;
          retryCount = 0;
          
          while (retryCount <= maxRetries) {
            try {
              appwriteUser = await account.get();
              if (!appwriteUser) {
                throw new Error('Failed to get user data');
              }
              break;
            } catch (error: any) {
              if (retryCount === maxRetries) {
                throw error;
              }
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }

          // Get user preferences
          let preferences = DEFAULT_PREFERENCES;
          try {
            const prefs = await account.getPrefs();
            preferences = {
              ...DEFAULT_PREFERENCES,
              ...prefs,
            };
          } catch (error) {
            console.warn('Failed to load preferences, using defaults');
          }

          const user = convertAppwriteUser(appwriteUser, preferences);

          set({
            user,
            isLoading: false,
            error: null,
          });

          toast.success('Welcome back!');
        } catch (error: any) {
          console.error('Login error:', error);
          const authError = handleNetworkError(error);
          set({ isLoading: false, user: null, error: authError });
          toast.error(authError.message);
          throw authError;
        }
      },

      register: async (email: string, password: string, name: string) => {
        try {
          set({ isLoading: true, error: null });

          if (!navigator.onLine) {
            throw new Error('You appear to be offline. Please check your internet connection.');
          }

          if (!email || !password || !name) {
            throw new Error('All fields are required');
          }

          // Create user account
          await account.create(ID.unique(), email, password, name);
          
          // Create session
          await account.createEmailPasswordSession(email, password);
          
          // Set default preferences
          await account.updatePrefs(DEFAULT_PREFERENCES);

          // Get user data
          const appwriteUser = await account.get();
          if (!appwriteUser) {
            throw new Error('Failed to get user data after registration');
          }

          const user = convertAppwriteUser(appwriteUser, DEFAULT_PREFERENCES);

          set({
            user,
            isLoading: false,
            error: null,
          });

          toast.success('Account created successfully!');
        } catch (error: any) {
          console.error('Registration error:', error);
          const authError = handleNetworkError(error);
          set({ isLoading: false, user: null, error: authError });
          toast.error(authError.message);
          throw authError;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });

          if (!navigator.onLine) {
            throw new Error('You appear to be offline. Please check your internet connection.');
          }

          await account.deleteSession('current');
          set({ user: null, isLoading: false, error: null });
          toast.success('Logged out successfully');
        } catch (error: any) {
          console.error('Logout error:', error);
          const authError = handleNetworkError(error);
          set({ isLoading: false, error: authError });
          toast.error(authError.message);
          throw authError;
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });

          // If offline, use persisted user data
          if (!navigator.onLine) {
            const persistedUser = get().user;
            set({
              user: persistedUser,
              isLoading: false,
              isOnline: false,
              error: null,
            });
            return;
          }

          // Try to get the current session
          try {
            await account.getSession('current');
          } catch (error) {
            // No active session
            set({ user: null, isLoading: false, isOnline: true, error: null });
            return;
          }

          // Get user data
          const appwriteUser = await account.get();
          if (!appwriteUser) {
            set({ user: null, isLoading: false, isOnline: true, error: null });
            return;
          }

          // Get user preferences
          let preferences = DEFAULT_PREFERENCES;
          try {
            const prefs = await account.getPrefs();
            preferences = {
              ...DEFAULT_PREFERENCES,
              ...prefs,
            };
          } catch (error) {
            console.warn('Failed to load preferences, using defaults');
          }

          const user = convertAppwriteUser(appwriteUser, preferences);

          set({
            user,
            isLoading: false,
            isOnline: true,
            error: null,
          });
        } catch (error: any) {
          console.error('Auth check error:', error);
          const authError = handleNetworkError(error);
          set({
            user: get().user,
            isLoading: false,
            isOnline: navigator.onLine,
            error: authError,
          });
        }
      },

      updatePreferences: async (preferences: Partial<UserPreferences>) => {
        try {
          set({ isLoading: true, error: null });

          if (!navigator.onLine) {
            throw new Error('You appear to be offline. Please check your internet connection.');
          }

          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('No user logged in');
          }

          const updatedPreferences = {
            ...currentUser.preferences,
            ...preferences,
          };

          await account.updatePrefs(updatedPreferences);

          set({
            user: {
              ...currentUser,
              preferences: updatedPreferences,
            },
            isLoading: false,
            error: null,
          });

          toast.success('Preferences updated successfully');
        } catch (error: any) {
          console.error('Update preferences error:', error);
          const authError = handleNetworkError(error);
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
    useAuth.getState().checkAuth();
  });

  window.addEventListener('offline', () => {
    useAuth.setState({ isOnline: false });
  });
}

// Initialize auth state
useAuth.getState().checkAuth();