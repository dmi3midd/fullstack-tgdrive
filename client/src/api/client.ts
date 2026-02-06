import axios from 'axios';
import type { AuthResponse } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const client = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (config) => config,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && error.config && !error.config._isRetry) {
            originalRequest._isRetry = true;
            try {
                const response = await axios.post<AuthResponse>(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
                localStorage.setItem('accessToken', response.data.accessToken);
                return client.request(originalRequest);
            } catch (e) {
                localStorage.removeItem('accessToken');
                // Optional: Redirect to login or dispatch clean auth action
                console.error("Not authorized");
            }
        }
        throw error;
    }
);

export default client;
