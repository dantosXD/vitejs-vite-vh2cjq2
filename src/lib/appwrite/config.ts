export const DATABASE_ID = 'fishlog';

export const COLLECTIONS = {
  USERS: 'users',
  CATCHES: 'catches',
  GROUPS: 'groups',
  EVENTS: 'events',
  COMMENTS: 'comments',
  CHALLENGES: 'challenges',
} as const;

export const BUCKETS = {
  CATCH_PHOTOS: 'catch-photos',
  GROUP_AVATARS: 'group-avatars',
  USER_AVATARS: 'user-avatars',
} as const;

export const ENDPOINTS = {
  API: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  PROJECT: import.meta.env.VITE_APPWRITE_PROJECT || '6723a47b7732b1007525',
} as const;