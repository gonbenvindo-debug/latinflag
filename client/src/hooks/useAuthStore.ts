import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer } from '../types';

interface AuthStore {
  user: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: Customer, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<Customer>) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      login: (user: Customer, token: string) => {
        const isAdmin = user.email === process.env.REACT_APP_ADMIN_EMAIL;
        set({
          user,
          token,
          isAuthenticated: true,
          isAdmin,
        });
        localStorage.setItem('authToken', token);
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        });
        localStorage.removeItem('authToken');
      },

      updateUser: (userData: Partial<Customer>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      initializeAuth: () => {
        const token = localStorage.getItem('authToken');
        if (token && get().token !== token) {
          set({ token });
          // In a real app, you might want to validate the token here
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
