import { useAuth } from '@/lib/auth';
import type { UserPreferences } from '@/lib/auth/types';
import { DEFAULT_PREFERENCES } from '@/lib/auth/constants';

export function usePreferences() {
  const { user, updatePreferences } = useAuth();
  const preferences = user?.preferences || DEFAULT_PREFERENCES;

  return {
    ...preferences,
    updatePreferences,
  };
}