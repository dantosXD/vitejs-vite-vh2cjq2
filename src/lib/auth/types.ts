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
    defaultCatchView: 'grid' | 'table' | 'timeline';
    measurementSystem: 'imperial' | 'metric';
    dateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  };
}

export interface User {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface AuthError {
  name: string;
  message: string;
  code: number;
}