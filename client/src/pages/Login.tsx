import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { AxiosError } from 'axios';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            const e = err as AxiosError<{ message: string }>;
            setError(e.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
                <p className="mt-2 text-sm text-gray-500">Access your files from any device</p>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                />
                <Input
                    label="Password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                />

                <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                >
                    Sign In
                </Button>
            </form>

            <div className="text-center">
                <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};
