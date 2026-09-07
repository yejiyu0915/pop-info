import { create } from 'zustand';
import { api, setCsrfToken } from '@/lib/api';
import type { UserRole } from '@/lib/roles';

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  clearAuth: () => set({ user: null, isAuthenticated: false, isLoading: false }),

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<{ user: User; csrfToken?: string }>('/api/auth/me');
      setCsrfToken(data.csrfToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      setCsrfToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post<{ user: User; csrfToken: string }>('/api/auth/login', {
      email,
      password,
    });
    setCsrfToken(data.csrfToken);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setCsrfToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
