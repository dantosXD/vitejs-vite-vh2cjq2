// Appwrite specific types
export interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
}

export interface User extends AppwriteDocument {
  email: string;
  name: string;
  avatar?: string;
  preferences?: UserPreferences;
}

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
    defaultCatchView: 'table' | 'grid' | 'timeline';
    measurementSystem: 'imperial' | 'metric';
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  };
}

export interface Catch extends AppwriteDocument {
  species: string;
  weight: number;
  length: number;
  location: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  date: string;
  photos: string[];
  featurePhotoIndex: number;
  weather?: {
    temperature: number;
    conditions: string;
  };
  userId: string;
  groupId?: string;
  sharedWithGroups: string[];
  notes?: string;
}

export interface Group extends AppwriteDocument {
  name: string;
  description: string;
  avatar?: string;
  members: string[];
  admins: string[];
  challenges?: string[];
}

export interface Challenge extends AppwriteDocument {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'biggest_catch' | 'species_variety' | 'total_weight';
  target: {
    species?: string;
    metric?: 'weight' | 'length';
    count?: number;
  };
  participants: {
    userId: string;
    progress: number;
  }[];
  completed: boolean;
  winner?: string;
  groupId: string;
}

export interface Comment extends AppwriteDocument {
  content: string;
  userId: string;
  catchId: string;
}

export interface CalendarEvent extends AppwriteDocument {
  title: string;
  date: string;
  location: string;
  description?: string;
  participants: string[];
  userId: string;
}

export interface Invitation extends AppwriteDocument {
  email: string;
  groupId: string;
  status: 'pending' | 'accepted' | 'declined';
  expiresAt: string;
  userId?: string;
}