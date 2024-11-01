import type { UserPreferences } from './types';

export const DEFAULT_PREFERENCES: UserPreferences = {
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
    dateFormat: 'MM/DD/YYYY',
  },
};