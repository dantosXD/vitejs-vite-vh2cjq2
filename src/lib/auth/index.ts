import { useAuth } from '@/lib/stores/auth-store';
import type { User, AuthError, UserPreferences } from './types';

export {
    useAuth,
    type User,
    type AuthError,
    type UserPreferences
};

// Re-export everything from the auth store
const { login, register, logout, checkAuth } = useAuth.getState();
export { login, register, logout, checkAuth };