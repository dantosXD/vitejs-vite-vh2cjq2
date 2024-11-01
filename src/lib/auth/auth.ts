import { ID } from 'appwrite';
import { account } from '@/lib/appwrite/services';
import type { AuthError, User, UserPreferences } from './types';
import { DEFAULT_PREFERENCES } from './constants';

const handleAuthError = (error: any): AuthError => {
  if (!navigator.onLine) {
    return {
      name: 'NetworkError',
      message: 'You appear to be offline. Please check your internet connection.',
      code: 0,
    };
  }

  // Handle specific Appwrite error codes
  switch (error?.code) {
    case 401:
      return {
        name: 'AuthError',
        message: 'Invalid email or password',
        code: 401,
      };
    case 429:
      return {
        name: 'RateLimitError',
        message: 'Too many attempts. Please try again later.',
        code: 429,
      };
    case 503:
      return {
        name: 'ServiceError',
        message: 'Service temporarily unavailable. Please try again later.',
        code: 503,
      };
    default:
      return {
        name: error?.name || 'AuthError',
        message: error?.message || 'An unexpected error occurred. Please try again.',
        code: error?.code || 500,
      };
  }
};

export async function login(email: string, password: string): Promise<User> {
  try {
    if (!navigator.onLine) {
      throw new Error('You appear to be offline. Please check your internet connection.');
    }

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Create email session
    await account.createEmailPasswordSession(email, password);

    // Get user data
    const user = await account.get();
    if (!user) {
      throw new Error('Failed to get user data');
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

    return {
      ...user,
      preferences,
    };
  } catch (error: any) {
    throw handleAuthError(error);
  }
}

export async function register(email: string, password: string, name: string): Promise<User> {
  try {
    if (!navigator.onLine) {
      throw new Error('You appear to be offline. Please check your internet connection.');
    }

    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    // Create user account
    const user = await account.create(ID.unique(), email, password, name);
    
    // Create session
    await account.createEmailPasswordSession(email, password);
    
    // Set default preferences
    await account.updatePrefs(DEFAULT_PREFERENCES);

    return {
      ...user,
      preferences: DEFAULT_PREFERENCES,
    };
  } catch (error: any) {
    throw handleAuthError(error);
  }
}

export async function logout(): Promise<void> {
  try {
    if (!navigator.onLine) {
      throw new Error('You appear to be offline. Please check your internet connection.');
    }

    await account.deleteSession('current');
  } catch (error: any) {
    throw handleAuthError(error);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    if (!navigator.onLine) {
      return null;
    }

    // Try to get the current session
    try {
      await account.getSession('current');
    } catch {
      return null;
    }

    // Get user data
    const user = await account.get();
    if (!user) {
      return null;
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

    return {
      ...user,
      preferences,
    };
  } catch (error) {
    return null;
  }
}

export async function updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
  try {
    if (!navigator.onLine) {
      throw new Error('You appear to be offline. Please check your internet connection.');
    }

    const currentPrefs = await account.getPrefs();
    const updatedPrefs = {
      ...DEFAULT_PREFERENCES,
      ...currentPrefs,
      ...preferences,
    };
    await account.updatePrefs(updatedPrefs);
    return updatedPrefs;
  } catch (error: any) {
    throw handleAuthError(error);
  }
}