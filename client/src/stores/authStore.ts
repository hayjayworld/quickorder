import { create } from 'zustand';
import { apiRequest } from '../lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  restaurantId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (email, password) => {
    const response = await apiRequest('POST', '/auth/login', { email, password });
    set({ user: response.data.user, isAuthenticated: true, isLoading: false });
  },
  logout: async () => {
    try {
      await apiRequest('POST', '/auth/logout');
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  fetchMe: async () => {
    try {
      const response = await apiRequest('GET', '/auth/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
}));