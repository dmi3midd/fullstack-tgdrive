import { create } from 'zustand';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authApi } from '../api/auth';

interface AuthState {
    user: User | null;
    isAuth: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    setAuth: (user: User, token: string) => void;
    checkAuth: () => Promise<void>; // To be implemented if we want a manual verify, but axios interceptor handles refresh mostly
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuth: !!localStorage.getItem('accessToken'),
    isLoading: false,

    setAuth: (user, token) => {
        localStorage.setItem('accessToken', token);
        set({ user, isAuth: true });
    },

    login: async (credentials) => {
        set({ isLoading: true });
        try {
            const response = await authApi.login(credentials);
            localStorage.setItem('accessToken', response.accessToken);
            set({ user: response.user, isAuth: true });
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (credentials) => {
        set({ isLoading: true });
        try {
            const response = await authApi.register(credentials);
            localStorage.setItem('accessToken', response.accessToken);
            set({ user: response.user, isAuth: true });
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await authApi.logout();
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem('accessToken');
            set({ user: null, isAuth: false, isLoading: false });
        }
    },

    checkAuth: async () => {
        // In a real app we might call a /me endpoint. 
        // For now if we have a token we assume auth, and if requests fail 401 interceptor handles it.
    }
}));
