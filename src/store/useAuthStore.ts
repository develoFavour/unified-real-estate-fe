import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User } from '@/services/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user, token, refreshToken) => {
        // Set cookies for middleware
        Cookies.set('token', token, { expires: 7 });
        if (refreshToken) {
          Cookies.set('refresh_token', refreshToken, { expires: 7 });
        }
        Cookies.set('user_role', user.role, { expires: 7 });
        
        set({ user, isAuthenticated: true });
      },
      updateUser: (user) => {
        set({ user });
      },
      logout: () => {
        Cookies.remove('token');
        Cookies.remove('refresh_token');
        Cookies.remove('user_role');
        set({ user: null, isAuthenticated: false });
        window.location.href = '/login';
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
