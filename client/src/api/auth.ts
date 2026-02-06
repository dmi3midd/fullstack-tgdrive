import client from './client';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

export const authApi = {
    login: async (credentials: LoginCredentials) => {
        const response = await client.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    register: async (credentials: RegisterCredentials) => {
        const response = await client.post<AuthResponse>('/auth/registration', credentials);
        return response.data;
    },

    logout: async () => {
        await client.post('/auth/logout');
    },
};
